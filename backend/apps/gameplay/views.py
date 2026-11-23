from datetime import date

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError, transaction
from django.db.models import Count, Max
from django.http import Http404, HttpResponse
from rest_framework import generics, permissions, serializers, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView

from apps.accounts.models import ParentChildLink, Profile

from .analysis import analyze_sessions
from .exports import write_sessions_csv
from .models import (
    MAX_PARENTS_PER_CHILD,
    ChildCode,
    GameSession,
    generate_child_code,
    normalize_code,
)
from .permissions import can_view_child, is_child, is_parent
from .serializers import GameSessionSerializer


def _parse_child_id(raw):
    if raw is None or not str(raw).isdigit():
        raise ValidationError({'child': 'A numeric child id is required.'})
    return int(raw)


def _display_name(user):
    name = f'{user.first_name} {user.last_name}'.strip()
    if name:
        return name
    local = (user.email or '').split('@')[0]
    return f'{local[:2]}***' if local else f'Child {user.pk}'


def _verified_parent_count(child):
    return ParentChildLink.objects.filter(child=child, status='verified').count()


class SessionPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class LinkAttemptThrottle(UserRateThrottle):
    scope = 'link_child'
    rate = '10/hour'


class ParentSignupThrottle(AnonRateThrottle):
    scope = 'parent_signup'
    rate = '15/hour'


class GameSessionListCreateView(generics.ListCreateAPIView):
   

    serializer_class = GameSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = SessionPagination

    def get_queryset(self):
        user = self.request.user
        params = self.request.query_params

        if is_child(user):
            qs = GameSession.objects.filter(child=user)
        else:
            child_id = _parse_child_id(params.get('child'))
            if not can_view_child(user, child_id):
                raise PermissionDenied('You do not have access to this child.')
            qs = GameSession.objects.filter(child_id=child_id)

        game_key = params.get('game_key')
        if game_key:
            qs = qs.filter(game_key=game_key)
        return qs

    def create(self, request, *args, **kwargs):
        if not is_child(request.user):
            raise PermissionDenied('Only child accounts can submit game sessions.')
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        
        serializer.save(child=self.request.user)


class MyChildCodeView(APIView):
    

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not is_child(user):
            raise PermissionDenied('Only child accounts have a Child ID code.')

        record = ChildCode.objects.filter(child=user).first()
        if record is None:
            try:
                record = ChildCode.objects.create(child=user, code=generate_child_code())
            except IntegrityError:
                record = ChildCode.objects.get(child=user)

        return Response({
            'child_id': user.pk,
            'child_code': record.code,
            'linked_parents': _verified_parent_count(user),
        })


class LinkChildView(APIView):
    

    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [LinkAttemptThrottle]

    def post(self, request):
        if not is_parent(request.user):
            raise PermissionDenied('Only parent accounts can link a child.')

        code = normalize_code(request.data.get('child_code'))
        if not code:
            raise ValidationError({'child_code': 'Please enter the Child ID code.'})

        record = ChildCode.objects.select_related('child').filter(code=code).first()
        if record is None:
            return Response(
                {'detail': 'Child ID code not found. Please check it and try again.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        child = record.child
        link = ParentChildLink.objects.filter(parent=request.user, child=child).first()
        already = link is not None and link.status == 'verified'

        if not already:
            if _verified_parent_count(child) >= MAX_PARENTS_PER_CHILD:
                raise ValidationError({
                    'detail': 'This child already has the maximum number of linked parents. '
                              'Please contact the school or administrator.'
                })
            if link is None:
                ParentChildLink.objects.create(parent=request.user, child=child, status='verified')
            else:
                link.status = 'verified'
                link.save(update_fields=['status'])

        return Response(
            {'child_id': child.pk, 'display_name': _display_name(child), 'already_linked': already},
            status=status.HTTP_200_OK if already else status.HTTP_201_CREATED,
        )


class MyChildrenView(APIView):
    

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_parent(request.user):
            raise PermissionDenied('Only parent accounts can view linked children.')

        links = (
            ParentChildLink.objects.filter(parent=request.user, status='verified')
            .select_related('child')
            .order_by('id')
        )
        data = []
        for link in links:
            stats = GameSession.objects.filter(child=link.child).aggregate(
                total=Count('id'), last=Max('played_at')
            )
            data.append({
                'child_id': link.child.pk,
                'display_name': _display_name(link.child),
                'linked_at': link.created_at.isoformat(),
                'total_sessions': stats['total'],
                'last_played': stats['last'].isoformat() if stats['last'] else None,
            })
        return Response(data)


class ChildAnalysisView(APIView):
    

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, child_id):
        user = request.user
        if is_child(user) or not can_view_child(user, child_id):
            raise PermissionDenied('You do not have access to this child.')
        sessions = GameSession.objects.filter(child_id=child_id)
        return Response(analyze_sessions(sessions))


class ChildExportCSVView(APIView):
    

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, child_id):
        user = request.user
        if is_child(user) or not can_view_child(user, child_id):
            raise PermissionDenied('You do not have access to this child.')
        if not User.objects.filter(pk=child_id).exists():
            raise Http404

        sessions = GameSession.objects.filter(child_id=child_id).order_by('played_at')
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        filename = f'child-{child_id}-game-results-{date.today():%Y%m%d}.csv'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        write_sessions_csv(response, child_id, sessions)
        return response


class ParentSignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    child_code = serializers.CharField(max_length=20)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        if Profile.objects.filter(normalized_email__iexact=email).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return email

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_child_code(self, value):
        return normalize_code(value)


class ParentSignupView(APIView):
    

    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [ParentSignupThrottle]

    def post(self, request):
        serializer = ParentSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        record = ChildCode.objects.select_related('child').filter(code=data['child_code']).first()
        if record is None:
            return Response(
                {'child_code': ['Child ID code not found. Please check it and try again.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        child = record.child
        if _verified_parent_count(child) >= MAX_PARENTS_PER_CHILD:
            return Response(
                {'child_code': ['This Child ID already has the maximum number of linked parents.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=data['email'],
                    email=data['email'],
                    password=data['password'],
                    first_name=data.get('first_name', ''),
                    last_name=data.get('last_name', ''),
                )
                Profile.objects.create(
                    user=user,
                    role='parent',
                    normalized_email=data['email'],
                    status='approved',
                )
                ParentChildLink.objects.create(parent=user, child=child, status='verified')
        except IntegrityError:
            return Response(
                {'detail': 'Failed to create account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                'id': user.pk,
                'email': user.email,
                'role': 'parent',
                'status': 'approved',
                'child_id': child.pk,
            },
            status=status.HTTP_201_CREATED,
        )