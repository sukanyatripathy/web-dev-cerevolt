from django.contrib import admin

from .models import ChildCode, GameSession


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'child', 'game_key', 'variant', 'difficulty_level', 'score', 'played_at')
    list_filter = ('game_key', 'difficulty_level')
    date_hierarchy = 'played_at'


@admin.register(ChildCode)
class ChildCodeAdmin(admin.ModelAdmin):
    
    list_display = ('child', 'code', 'created_at')