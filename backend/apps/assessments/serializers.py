from rest_framework import serializers

from .models import Question, Result


class QuestionPublicSerializer(serializers.ModelSerializer):
    # correct_index is deliberately NOT exposed
    class Meta:
        model = Question
        fields = ["id", "text", "visual", "options", "difficulty", "subject"]


class ResultSerializer(serializers.ModelSerializer):
    # For parent / school / admin: risk level and indicators.
    disclaimer = serializers.SerializerMethodField()
    level = serializers.IntegerField(source="assessment.level", read_only=True)

    class Meta:
        model = Result
        fields = [
            "accuracy_percent",
            "avg_response_ms",
            "skipped_count",
            "timed_out_count",
            "stars",
            "level",
            "attention_risk",
            "learning_risk",
            "indicators",
            "created_at",
            "disclaimer",
        ]

    def get_disclaimer(self, obj):
        return (
            "This is a screening result, not a diagnosis. "
            "Please consult a qualified professional for evaluation."
        )


class ChildResultSerializer(serializers.ModelSerializer):
    # Children see only a friendly score, stars and a message.
    # No risk levels, no indicators.
    message = serializers.SerializerMethodField()
    level = serializers.IntegerField(source="assessment.level", read_only=True)

    class Meta:
        model = Result
        fields = ["accuracy_percent", "stars", "level", "message"]

    def get_message(self, obj):
        if obj.accuracy_percent >= 80:
            return "Great job! You did really well!"
        if obj.accuracy_percent >= 50:
            return "Good effort! Keep practising!"
        return "Nice try! Let's practise some more together."