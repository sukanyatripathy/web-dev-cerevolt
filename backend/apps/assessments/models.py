from django.conf import settings
from django.db import models


class Question(models.Model):
    SUBJECTS = [
        ("maths", "Maths"),
        ("science", "Science"),
        ("language", "Language"),
        ("colours", "Colours"),
        ("observation", "Observation"),
    ]
    LANGUAGES = [("en", "English"), ("hi", "Hindi"), ("bn", "Bengali")]

    subject = models.CharField(max_length=20, choices=SUBJECTS)
    language = models.CharField(max_length=5, choices=LANGUAGES, default="en")
    text = models.TextField()
    # What the child sees: an emoji, a row of emojis, or a colour like #e53935
    visual = models.CharField(max_length=60, blank=True, default="")
    options = models.JSONField(default=list)
    correct_index = models.PositiveSmallIntegerField()
    difficulty = models.PositiveSmallIntegerField(default=1)
    age_min = models.PositiveSmallIntegerField(default=5)
    age_max = models.PositiveSmallIntegerField(default=12)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"[{self.subject}/{self.language}] {self.text[:50]}"


class Assessment(models.Model):
    child = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                              related_name="assessments")
    subject = models.CharField(max_length=20)
    language = models.CharField(max_length=5, default="en")
    level = models.PositiveSmallIntegerField(default=1)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.child} - {self.subject} L{self.level}"


class Answer(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE,
                                   related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_index = models.SmallIntegerField(null=True, blank=True)
    is_correct = models.BooleanField(default=False)
    timed_out = models.BooleanField(default=False)
    response_time_ms = models.PositiveIntegerField(default=0)


class Result(models.Model):
    RISK = [("low", "Low"), ("medium", "Medium"), ("high", "High")]

    assessment = models.OneToOneField(Assessment, on_delete=models.CASCADE,
                                      related_name="result")
    accuracy_percent = models.FloatField()
    avg_response_ms = models.FloatField()
    skipped_count = models.PositiveIntegerField(default=0)
    timed_out_count = models.PositiveIntegerField(default=0)
    stars = models.PositiveSmallIntegerField(default=0)
    attention_risk = models.CharField(max_length=10, choices=RISK, default="low")
    learning_risk = models.CharField(max_length=10, choices=RISK, default="low")
    indicators = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.assessment} - {self.accuracy_percent}%"