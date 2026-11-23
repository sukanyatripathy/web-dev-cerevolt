from datetime import timedelta
from statistics import mean, median

from django.utils import timezone

from .models import GameKey


BANDS = ((80, 'Proficient'), (50, 'Developing'), (0, 'Beginner'))
TREND_MIN_SESSIONS = 6   
TREND_WINDOW = 3         
TREND_DELTA = 5          
RECENT_WINDOW = 5       

DISCLAIMER = (
    'These results describe how a child performed in learning games. They are for '
    'observation and progress tracking only and are not a medical or psychological '
    'diagnosis. Please discuss any concerns with a qualified professional.'
)


def band_for(score):
    for minimum, label in BANDS:
        if score >= minimum:
            return label
    return 'Beginner'


def trend_for(scores):
    if len(scores) < TREND_MIN_SESSIONS:
        return 'Not enough data'
    latest = mean(scores[-TREND_WINDOW:])
    previous = mean(scores[-2 * TREND_WINDOW:-TREND_WINDOW])
    difference = latest - previous
    if difference >= TREND_DELTA:
        return 'Improving'
    if difference <= -TREND_DELTA:
        return 'Dipping'
    return 'Steady'


def _number(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    return value


def _extra_attempts(session):
    
    metrics = session.metrics if isinstance(session.metrics, dict) else {}
    for key in ('wrong_attempts', 'mistakes'):
        value = _number(metrics.get(key))
        if value is not None:
            return value
    moves = _number(metrics.get('moves'))
    pairs = _number(metrics.get('pairs'))
    if moves is not None and pairs is not None:
        return max(0, moves - pairs)
    return None


def _summarise(sessions):
    scores = [s.score for s in sessions]
    accuracies = [s.accuracy_pct for s in sessions if s.accuracy_pct is not None]
    reactions = [s.avg_reaction_ms for s in sessions if s.avg_reaction_ms is not None]
    extras = [x for x in (_extra_attempts(s) for s in sessions) if x is not None]
    recent_average = mean(scores[-RECENT_WINDOW:])

    return {
        'sessions': len(sessions),
        'average_score': round(mean(scores), 1),
        'best_score': max(scores),
        'latest_score': scores[-1],
        'recent_average': round(recent_average, 1),
        'average_accuracy': round(mean(accuracies), 1) if accuracies else None,
        'median_reaction_ms': int(median(reactions)) if reactions else None,
        'average_extra_attempts': round(mean(extras), 1) if extras else None,
        'performance_band': band_for(recent_average),
        'trend': trend_for(scores),
        'last_played': sessions[-1].played_at.isoformat(),
    }


def analyze_sessions(queryset):
    sessions = list(queryset.order_by('played_at'))
    labels = dict(GameKey.choices)

    if not sessions:
        return {
            'overview': {
                'total_sessions': 0,
                'total_play_minutes': 0,
                'days_played_last_7': 0,
                'first_played': None,
                'last_played': None,
            },
            'highlights': {'strongest_game': None, 'needs_practice_game': None},
            'games': [],
            'disclaimer': DISCLAIMER,
        }

    by_game = {}
    for session in sessions:
        by_game.setdefault(session.game_key, []).append(session)

    games = []
    for key, items in by_game.items():
        summary = _summarise(items)
        summary['game_key'] = key
        summary['game'] = labels.get(key, key)

        by_variant = {}
        for session in items:
            by_variant.setdefault(session.variant or 'general', []).append(session)
        summary['variants'] = [
            {
                'variant': name,
                'sessions': len(group),
                'average_score': round(mean(s.score for s in group), 1),
            }
            for name, group in sorted(by_variant.items())
        ]
        games.append(summary)
    games.sort(key=lambda g: g['game'])

    highlights = {'strongest_game': None, 'needs_practice_game': None}
    if len(games) >= 2:
        highlights['strongest_game'] = max(games, key=lambda g: g['recent_average'])['game']
        highlights['needs_practice_game'] = min(games, key=lambda g: g['recent_average'])['game']

    week_ago = timezone.now() - timedelta(days=7)
    active_days = {s.played_at.date() for s in sessions if s.played_at >= week_ago}

    return {
        'overview': {
            'total_sessions': len(sessions),
            'total_play_minutes': round(sum(s.duration_seconds for s in sessions) / 60, 1),
            'days_played_last_7': len(active_days),
            'first_played': sessions[0].played_at.isoformat(),
            'last_played': sessions[-1].played_at.isoformat(),
        },
        'highlights': highlights,
        'games': games,
        'disclaimer': DISCLAIMER,
    }