from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Video, VideoWatch

MAX_SECONDS = 24 * 60 * 60


def role_of(user):
    profile = getattr(user, "profile", None)
    return profile.role if profile else None


def video_to_dict(video):
    return {
        "id": video.id,
        "title": video.title,
        "description": video.description,
        "youtube_id": video.youtube_id,
        "topic": video.topic,
        "age_group": video.age_group,
        "language": video.language,
        "duration_minutes": video.duration_minutes,
    }


class VideoListView(APIView):
    """Any logged-in user can list active videos.
    Optional filters: ?topic=science&age_group=6-8&language=en"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        videos = Video.objects.filter(active=True)
        for field in ("topic", "age_group", "language"):
            value = request.query_params.get(field)
            if value:
                videos = videos.filter(**{field: value})
        return Response([video_to_dict(v) for v in videos])


class StartWatchView(APIView):
    """A child account starts watching a video: creates a VideoWatch row."""

    permission_classes = [IsAuthenticated]

    def post(self, request, video_id):
        if role_of(request.user) != "child":
            return Response(
                {"detail": "Only child accounts can watch videos."},
                status=status.HTTP_403_FORBIDDEN,
            )
        video = get_object_or_404(Video, pk=video_id, active=True)
        watch = VideoWatch.objects.create(child=request.user, video=video)
        return Response({"watch_id": watch.id}, status=status.HTTP_201_CREATED)


class UpdateWatchView(APIView):
    """A child updates their own watch record (seconds watched, completed)."""

    permission_classes = [IsAuthenticated]

    def patch(self, request, watch_id):
        watch = get_object_or_404(VideoWatch, pk=watch_id, child=request.user)
        try:
            seconds = int(request.data.get("seconds_watched", watch.seconds_watched))
        except (TypeError, ValueError):
            return Response(
                {"detail": "seconds_watched must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        seconds = max(0, min(seconds, MAX_SECONDS))
        watch.seconds_watched = max(watch.seconds_watched, seconds)
        if request.data.get("completed") is True:
            watch.completed = True
        watch.save()
        return Response(
            {"seconds_watched": watch.seconds_watched, "completed": watch.completed}
        )