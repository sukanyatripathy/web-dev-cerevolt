from django.urls import path

from .views import StartWatchView, UpdateWatchView, VideoListView

urlpatterns = [
    path("", VideoListView.as_view()),
    path("<int:video_id>/watch/", StartWatchView.as_view()),
    path("watch/<int:watch_id>/", UpdateWatchView.as_view()),
]