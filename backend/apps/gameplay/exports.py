import csv

DIFFICULTY_LABELS = {1: 'Easy', 2: 'Medium', 3: 'Hard'}


METRIC_COLUMNS = [
    'total_questions', 'total_words', 'first_try_correct', 'wrong_attempts',
    'moves', 'pairs', 'rounds', 'first_try_rounds', 'mistakes', 'longest_sequence',
]

HEADER = [
    'child_id', 'played_at_utc', 'game', 'variant', 'difficulty', 'score',
    'accuracy_pct', 'avg_reaction_ms', 'duration_seconds', 'completed',
] + METRIC_COLUMNS


def safe_cell(value):
    
    if value is None:
        return ''
    if isinstance(value, bool):
        return 'yes' if value else 'no'
    if isinstance(value, (int, float)):
        return value
    text = str(value)[:100]
    if text and text[0] in ('=', '+', '-', '@', '\t', '\r'):
        return "'" + text
    return text


def write_sessions_csv(file_obj, child_id, sessions):
    writer = csv.writer(file_obj)
    writer.writerow(HEADER)
    for session in sessions.iterator():
        metrics = session.metrics if isinstance(session.metrics, dict) else {}
        row = [
            child_id,
            session.played_at.isoformat(),
            session.get_game_key_display(),
            session.variant,
            DIFFICULTY_LABELS.get(session.difficulty_level, session.difficulty_level),
            session.score,
            session.accuracy_pct,
            session.avg_reaction_ms,
            session.duration_seconds,
            session.completed,
        ] + [metrics.get(column) for column in METRIC_COLUMNS]
        writer.writerow([safe_cell(cell) for cell in row])