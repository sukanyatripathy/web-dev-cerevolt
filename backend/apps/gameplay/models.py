import re
import secrets

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

MAX_PARENTS_PER_CHILD = 2


class GameKey(models.TextChoices):
   
    WORD_PUZZLE = 'word_puzzle', 'Word Puzzle'
    MATH_MAGIC = 'math_magic', 'Math Magic'
    MEMORY_MATCH = 'memory_match', 'Memory Match'
    SCIENCE_EXPLORER = 'science_explorer', 'Science Explorer'
    
    GO_NO_GO = 'go_no_go', 'Go / No-Go'
    FOCUS_CATCHER = 'focus_catcher', 'Focus Catcher'
    EMOTION_MATCH = 'emotion_match', 'Emotion Match'
    PATTERN_FINDER = 'pattern_finder', 'Pattern Finder'
    ROUTINE_ORDER = 'routine_order', 'Daily Routine Order'


class GameSession(models.Model):
    

    child = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='game_sessions',
    )
    game_key = models.CharField(max_length=30, choices=GameKey.choices)
    variant = models.CharField(max_length=40, blank=True, default='')
    difficulty_level = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    score = models.PositiveIntegerField(default=0, validators=[MaxValueValidator(100)])
    accuracy_pct = models.FloatField(
        null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    avg_reaction_ms = models.PositiveIntegerField(
        null=True, blank=True, validators=[MaxValueValidator(60000)],
    )
    duration_seconds = models.PositiveIntegerField(
        default=0, validators=[MaxValueValidator(3600)],
    )
    completed = models.BooleanField(default=True)
    metrics = models.JSONField(default=dict, blank=True)
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-played_at']
        indexes = [models.Index(fields=['child', 'game_key', '-played_at'])]

    def __str__(self):
        return f'{self.child_id} - {self.game_key} - {self.score}'


CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  


def normalize_code(raw):
    
    code = re.sub(r'\s+', '', str(raw or '')).upper()
    if len(code) == 8 and '-' not in code:
        code = f'{code[:4]}-{code[4:]}'
    return code


def generate_child_code():
    """Example: K7M2-9QXA """
    while True:
        raw = ''.join(secrets.choice(CODE_ALPHABET) for _ in range(8))
        code = f'{raw[:4]}-{raw[4:]}'
        if not ChildCode.objects.filter(code=code).exists():
            return code


class ChildCode(models.Model):
    

    child = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='child_code',
    )
    code = models.CharField(max_length=9, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'child {self.child_id}'