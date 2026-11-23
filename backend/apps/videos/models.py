from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models


class Video(models.Model):
    TOPIC_CHOICES = [
        ("science", "Science"),
        ("maths", "Maths"),
        ("language", "Language"),
        ("colours", "Colours"),
        ("observation", "Observation"),
        ("geography", "Geography"),
        ("technology", "Technology"),
        ("general", "General Knowledge"),
    ]
    AGE_GROUP_CHOICES = [
        ("3-5", "3 to 5 years"),
        ("6-8", "6 to 8 years"),
        ("9-12", "9 to 12 years"),
    ]
    LANGUAGE_CHOICES = [
        ("en", "English"),
        ("hi", "Hindi"),
        ("bn", "Bengali"),
    ]

    title = models.CharField(max_length=200)
    description = models.CharField(max_length=300, blank=True)
    youtube_id = models.CharField(
        max_length=11,
        validators=[
            RegexValidator(
                regex=r"^[A-Za-z0-9_-]{11}$",
                message="Enter only the 11-character YouTube video ID.",
            )
        ],
        help_text="The 11 characters after v= in the YouTube link.",
    )
    topic = models.CharField(max_length=20, choices=TOPIC_CHOICES)
    age_group = models.CharField(max_length=10, choices=AGE_GROUP_CHOICES)
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default="en")
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["topic", "age_group", "title"]

    def __str__(self):
        return f"{self.title} ({self.language}, {self.age_group})"


class VideoWatch(models.Model):
    child = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="video_watches",
    )
    video = models.ForeignKey(
        Video,
        on_delete=models.CASCADE,
        related_name="watches",
    )
    started_at = models.DateTimeField(auto_now_add=True)
    seconds_watched = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.child_id} watched {self.video_id}"