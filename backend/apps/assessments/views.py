import random

from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import ParentChildLink
from .models import Answer, Assessment, Question, Result
from .scoring import build_result
from .serializers import (ChildResultSerializer, QuestionPublicSerializer,
                          ResultSerializer)

User = get_user_model()
SUBJECTS = {c[0] for c in Question.SUBJECTS}
LANGUAGES = {c[0] for c in Question.LANGUAGES}
# Seconds per question for each level (harder level = less time)
TIME_LIMITS = {1: 15, 2: 12, 3: 10}


def role_of(user):
    profile = getattr(user, "profile", None)
    return profile.role if profile else None


def can_access_child(user, child):
    if user.id == child.id:
        return True
    role = role_of(user)
    if role == "admin":
        return True
    if role == "parent":
        return ParentChildLink.objects.filter(
            parent=user, child=child, status="verified").exists()
    return False


def serializer_for(user):
    # Only a child account gets the reduced result.
    if role_of(user) == "child":
        return ChildResultSerializer
    return ResultSerializer


def pick_questions(subject, language, level, count):
    """Random questions for this level; if the level has too few,
    top up from the nearest other levels. Returned easy to hard."""
    pool = list(Question.objects.filter(
        subject=subject, language=language, is_active=True))
    same = [q for q in pool if q.difficulty == level]
    others = [q for q in pool if q.difficulty != level]
    random.shuffle(same)
    random.shuffle(others)
    others.sort(key=lambda q: abs(q.difficulty - level))
    chosen = (same + others)[:count]
    chosen.sort(key=lambda q: q.difficulty)
    return chosen


class StartAssessmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subject = request.data.get("subject")
        language = request.data.get("language", "en")
        if subject not in SUBJECTS or language not in LANGUAGES:
            return Response({"detail": "Invalid subject or language."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            count = max(1, min(int(request.data.get("count", 10)), 30))
        except (TypeError, ValueError):
            count = 10
        try:
            level = int(request.data.get("level", 1))
        except (TypeError, ValueError):
            level = 1
        if level not in TIME_LIMITS:
            level = 1

        child_id = request.data.get("child_id")
        if child_id:
            child = get_object_or_404(User, pk=child_id)
        else:
            child = request.user
        if not can_access_child(request.user, child):
            return Response({"detail": "Not allowed for this child."},
                            status=status.HTTP_403_FORBIDDEN)

        questions = pick_questions(subject, language, level, count)
        if not questions:
            return Response({"detail": "No questions available."},
                            status=status.HTTP_404_NOT_FOUND)

        assessment = Assessment.objects.create(
            child=child, subject=subject, language=language, level=level)
        return Response({
            "assessment_id": assessment.id,
            "level": level,
            "time_limit": TIME_LIMITS[level],
            "questions": QuestionPublicSerializer(questions, many=True).data,
        }, status=status.HTTP_201_CREATED)


class SubmitAssessmentView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        assessment = get_object_or_404(Assessment, pk=pk)
        if not can_access_child(request.user, assessment.child):
            return Response({"detail": "Not allowed."},
                            status=status.HTTP_403_FORBIDDEN)
        if assessment.completed_at:
            return Response({"detail": "Already submitted."},
                            status=status.HTTP_400_BAD_REQUEST)

        items = request.data.get("answers")
        if not isinstance(items, list) or not items:
            return Response({"detail": "answers must be a non-empty list."},
                            status=status.HTTP_400_BAD_REQUEST)

        ids = [i.get("question_id") for i in items if isinstance(i, dict)]
        questions = Question.objects.in_bulk(
            [q for q in ids if isinstance(q, int)])

        answers = []
        seen = set()
        for item in items:
            if not isinstance(item, dict):
                continue
            qid = item.get("question_id")
            q = questions.get(qid)
            if (q is None or qid in seen or q.subject != assessment.subject
                    or q.language != assessment.language):
                continue
            seen.add(qid)
            timed_out = bool(item.get("timed_out"))
            sel = item.get("selected_index")
            if timed_out or not isinstance(sel, int) \
                    or not 0 <= sel < len(q.options):
                sel = None
            try:
                ms = max(0, min(int(item.get("response_time_ms", 0)), 600000))
            except (TypeError, ValueError):
                ms = 0
            answers.append(Answer(
                assessment=assessment, question=q, selected_index=sel,
                is_correct=(sel is not None and sel == q.correct_index),
                timed_out=timed_out, response_time_ms=ms))

        if not answers:
            return Response({"detail": "No valid answers."},
                            status=status.HTTP_400_BAD_REQUEST)

        Answer.objects.bulk_create(answers)
        result = Result.objects.create(assessment=assessment,
                                       **build_result(answers))
        assessment.completed_at = timezone.now()
        assessment.save(update_fields=["completed_at"])
        serializer = serializer_for(request.user)
        return Response(serializer(result).data,
                        status=status.HTTP_201_CREATED)


class AssessmentResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        assessment = get_object_or_404(Assessment, pk=pk)
        if not can_access_child(request.user, assessment.child):
            return Response({"detail": "Not allowed."},
                            status=status.HTTP_403_FORBIDDEN)
        result = get_object_or_404(Result, assessment=assessment)
        serializer = serializer_for(request.user)
        return Response(serializer(result).data)


class MyChildrenView(APIView):
    """Parent: list of verified linked children."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if role_of(request.user) != "parent":
            return Response([])
        links = ParentChildLink.objects.filter(
            parent=request.user, status="verified").select_related("child")
        return Response([
            {"id": link.child.id,
             "name": link.child.get_full_name() or link.child.username}
            for link in links])


class AssessmentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        child_id = request.query_params.get("child_id")
        if child_id:
            child = get_object_or_404(User, pk=child_id)
        else:
            child = request.user
        if not can_access_child(request.user, child):
            return Response({"detail": "Not allowed."},
                            status=status.HTTP_403_FORBIDDEN)
        serializer = serializer_for(request.user)
        rows = (Assessment.objects
                .filter(child=child, completed_at__isnull=False)
                .select_related("result")
                .order_by("-completed_at")[:50])
        data = []
        for a in rows:
            if hasattr(a, "result"):
                data.append({
                    "id": a.id,
                    "subject": a.subject,
                    "language": a.language,
                    "level": a.level,
                    "completed_at": a.completed_at,
                    "result": serializer(a.result).data,
                })
        return Response(data)