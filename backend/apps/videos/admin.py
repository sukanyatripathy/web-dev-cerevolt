from django.contrib import admin

from .models import Video, VideoWatch


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("title", "topic", "age_group", "language", "active")
    list_filter = ("topic", "age_group", "language", "active")
    search_fields = ("title", "description", "youtube_id")
    list_editable = ("active",)


@admin.register(VideoWatch)
class VideoWatchAdmin(admin.ModelAdmin):
    list_display = ("child", "video", "started_at", "seconds_watched", "completed")
    list_filter = ("completed", "video__topic", "video__language")
    readonly_fields = ("child", "video", "started_at")