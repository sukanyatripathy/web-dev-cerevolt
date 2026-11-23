import json
import re

from rest_framework import serializers

from .models import GameSession

VARIANT_PATTERN = re.compile(r'^[a-z0-9-]{0,40}$')


class GameSessionSerializer(serializers.ModelSerializer):
    game_label = serializers.CharField(source='get_game_key_display', read_only=True)

    class Meta:
        model = GameSession
        fields = [
            'id', 'child', 'game_key', 'game_label', 'variant', 'difficulty_level',
            'score', 'accuracy_pct', 'avg_reaction_ms', 'duration_seconds',
            'completed', 'metrics', 'played_at',
        ]
        read_only_fields = ['id', 'child', 'game_label', 'played_at']

    def validate_variant(self, value):
        if not VARIANT_PATTERN.match(value or ''):
            raise serializers.ValidationError('Invalid variant.')
        return value

    def validate_metrics(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('metrics must be a JSON object.')
        if len(json.dumps(value)) > 5000:
            raise serializers.ValidationError('metrics is too large.')
        return value

    def validate(self, attrs):
       
        metrics = attrs.get('metrics') or {}
        if not attrs.get('variant') and isinstance(metrics.get('variant'), str):
            candidate = metrics['variant']
            if VARIANT_PATTERN.match(candidate):
                attrs['variant'] = candidate
        return attrs