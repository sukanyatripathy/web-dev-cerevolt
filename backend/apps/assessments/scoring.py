def _stars(accuracy):
    # 1 star for trying, 2 for a good effort, 3 for a great score.
    if accuracy >= 80:
        return 3
    if accuracy >= 50:
        return 2
    return 1


def build_result(answers):
    """answers: list of Answer objects. Returns a dict for the Result model."""
    total = len(answers)
    timed_out = sum(1 for a in answers if a.timed_out)
    answered = [a for a in answers
                if a.selected_index is not None and not a.timed_out]
    skipped = max(0, total - len(answered) - timed_out)
    correct = sum(1 for a in answered if a.is_correct)

    accuracy = round(correct / total * 100, 1) if total else 0.0
    avg_ms = (round(sum(a.response_time_ms for a in answered) / len(answered), 1)
              if answered else 0.0)
    fast_wrong = sum(1 for a in answered
                     if not a.is_correct and a.response_time_ms < 1500)

    indicators = []

    if accuracy < 40:
        learning = "high"
        indicators.append("Many answers were incorrect in this subject.")
    elif accuracy < 60:
        learning = "medium"
        indicators.append("Some answers were incorrect in this subject.")
    else:
        learning = "low"

    points = 0
    skip_ratio = skipped / total if total else 0
    timeout_ratio = timed_out / total if total else 0
    rush_ratio = fast_wrong / len(answered) if answered else 0

    if skip_ratio >= 0.3:
        points += 2
        indicators.append("Many questions were skipped.")
    elif skip_ratio >= 0.15:
        points += 1
        indicators.append("Some questions were skipped.")
    if timeout_ratio >= 0.3:
        points += 2
        indicators.append("Many questions ran out of time without an answer.")
    elif timeout_ratio >= 0.15:
        points += 1
        indicators.append("Some questions ran out of time without an answer.")
    if rush_ratio >= 0.3:
        points += 2
        indicators.append("Many answers were given very quickly and were wrong.")
    elif rush_ratio >= 0.15:
        points += 1
        indicators.append("Some answers were rushed and wrong.")
    if avg_ms > 20000:
        points += 1
        indicators.append("Answers took a long time on average.")

    attention = "high" if points >= 3 else "medium" if points == 2 else "low"

    return {
        "accuracy_percent": accuracy,
        "avg_response_ms": avg_ms,
        "skipped_count": skipped,
        "timed_out_count": timed_out,
        "stars": _stars(accuracy),
        "attention_risk": attention,
        "learning_risk": learning,
        "indicators": indicators,
    }