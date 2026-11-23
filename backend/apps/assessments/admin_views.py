import csv
import re

from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.accounts.models import ParentChildLink
from apps.accounts.permissions import IsAdmin
from .models import Answer, Assessment, Result

User = get_user_model()
CODE_RE = re.compile(r"^c(\d+)$", re.IGNORECASE)


def child_code(user_id):
    return f"C{user_id:03d}"


def display_name(user):
    return user.get_full_name().strip() or user.username


def search_children(text):
    """Children whose name, username, email or code matches every word."""
    qs = User.objects.filter(profile__role="child")
    for term in (text or "").split():
        cond = (Q(first_name__icontains=term) | Q(last_name__icontains=term)
                | Q(username__icontains=term) | Q(email__icontains=term))
        match = CODE_RE.match(term)
        if match:
            cond |= Q(id=int(match.group(1)))
        qs = qs.filter(cond)
    return qs.order_by("first_name", "last_name", "id")


def result_dict(result):
    if result is None:
        return None
    return {
        "accuracy_percent": result.accuracy_percent,
        "stars": result.stars,
        "timed_out_count": result.timed_out_count,
        "skipped_count": result.skipped_count,
        "avg_response_ms": result.avg_response_ms,
        "attention_risk": result.attention_risk,
        "learning_risk": result.learning_risk,
        "indicators": result.indicators,
    }


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_children(request):
    text = request.query_params.get("q", "").strip()
    children = list(search_children(text)[:100])
    ids = [c.id for c in children]

    parents = {}
    links = ParentChildLink.objects.filter(
        child_id__in=ids, status="verified").select_related("parent")
    for link in links:
        parents.setdefault(link.child_id, []).append(display_name(link.parent))

    counts = dict(Assessment.objects
                  .filter(child_id__in=ids, completed_at__isnull=False)
                  .values_list("child").annotate(n=Count("id")))

    latest = {}
    results = (Result.objects.filter(assessment__child_id__in=ids)
               .select_related("assessment").order_by("-created_at"))
    for res in results:
        latest.setdefault(res.assessment.child_id, res)

    data = []
    for c in children:
        res = latest.get(c.id)
        data.append({
            "id": c.id,
            "code": child_code(c.id),
            "name": display_name(c),
            "email": c.email,
            "parents": parents.get(c.id, []),
            "assessments": counts.get(c.id, 0),
            "last_assessment": res.assessment.completed_at if res else None,
            "attention_risk": res.attention_risk if res else None,
            "learning_risk": res.learning_risk if res else None,
        })
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_child_detail(request, child_id):
    child = get_object_or_404(User, pk=child_id, profile__role="child")
    assessments = (Assessment.objects
                   .filter(child=child, completed_at__isnull=False)
                   .select_related("result")
                   .prefetch_related("answers__question")
                   .order_by("-completed_at"))

    rows = []
    for a in assessments[:100]:
        result = a.result if hasattr(a, "result") else None
        answers = []
        for ans in sorted(a.answers.all(), key=lambda x: x.id):
            q = ans.question
            opts = q.options if isinstance(q.options, list) else []
            sel = ans.selected_index
            answers.append({
                "question": q.text,
                "visual": q.visual,
                "chosen": (opts[sel] if sel is not None
                           and 0 <= sel < len(opts) else None),
                "correct_answer": (opts[q.correct_index]
                                   if 0 <= q.correct_index < len(opts)
                                   else None),
                "is_correct": ans.is_correct,
                "timed_out": ans.timed_out,
                "response_time_ms": ans.response_time_ms,
            })
        rows.append({
            "id": a.id,
            "subject": a.subject,
            "language": a.language,
            "level": a.level,
            "completed_at": a.completed_at,
            "result": result_dict(result),
            "answers": answers,
        })

    parents = [display_name(link.parent) for link in
               ParentChildLink.objects.filter(
                   child=child, status="verified").select_related("parent")]
    return Response({
        "id": child.id,
        "code": child_code(child.id),
        "name": display_name(child),
        "email": child.email,
        "parents": parents,
        "assessments": rows,
    })


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_overview(request):
    done = Assessment.objects.filter(completed_at__isnull=False)
    by_subject = [
        {"subject": r["subject"], "count": r["n"],
         "avg_accuracy": round(r["avg"] or 0, 1)}
        for r in done.values("subject").annotate(
            n=Count("id"), avg=Avg("result__accuracy_percent")
        ).order_by("subject")]
    by_level = [
        {"level": r["level"], "count": r["n"],
         "avg_accuracy": round(r["avg"] or 0, 1)}
        for r in done.values("level").annotate(
            n=Count("id"), avg=Avg("result__accuracy_percent")
        ).order_by("level")]

    def risk_counts(field):
        base = {"low": 0, "medium": 0, "high": 0}
        for r in Result.objects.values(field).annotate(n=Count("id")):
            base[r[field]] = r["n"]
        return base

    avg = Result.objects.aggregate(a=Avg("accuracy_percent"))["a"] or 0
    return Response({
        "children": User.objects.filter(profile__role="child").count(),
        "children_with_quizzes": done.values("child").distinct().count(),
        "assessments": done.count(),
        "answers": Answer.objects.filter(
            assessment__completed_at__isnull=False).count(),
        "timed_out_answers": Answer.objects.filter(timed_out=True).count(),
        "avg_accuracy": round(avg, 1),
        "by_subject": by_subject,
        "by_level": by_level,
        "attention_risk": risk_counts("attention_risk"),
        "learning_risk": risk_counts("learning_risk"),
    })


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_export_csv(request):
    """One row per answer. Child code only; add ?names=1 for names too."""
    with_names = request.query_params.get("names") == "1"
    results = {r.assessment_id: r for r in Result.objects.all()}

    response = HttpResponse(content_type="text/csv; charset=utf-8")
    writer = csv.writer(response)
    header = ["child_code"]
    if with_names:
        header.append("child_name")
    header += [
        "assessment_id", "subject", "language", "level", "completed_at",
        "question_id", "question_difficulty", "selected_index",
        "correct_index", "is_correct", "timed_out", "response_time_ms",
        "accuracy_percent", "stars", "assessment_timed_out",
        "assessment_skipped", "avg_response_ms", "attention_risk",
        "learning_risk",
    ]
    writer.writerow(header)

    answers = (Answer.objects
               .filter(assessment__completed_at__isnull=False)
               .select_related("assessment", "assessment__child", "question")
               .order_by("assessment_id", "id"))
    for ans in answers.iterator():
        a = ans.assessment
        res = results.get(a.id)
        row = [child_code(a.child_id)]
        if with_names:
            row.append(display_name(a.child))
        row += [
            a.id, a.subject, a.language, a.level,
            a.completed_at.isoformat() if a.completed_at else "",
            ans.question_id, ans.question.difficulty,
            "" if ans.selected_index is None else ans.selected_index,
            ans.question.correct_index,
            int(ans.is_correct), int(ans.timed_out), ans.response_time_ms,
            res.accuracy_percent if res else "",
            res.stars if res else "",
            res.timed_out_count if res else "",
            res.skipped_count if res else "",
            res.avg_response_ms if res else "",
            res.attention_risk if res else "",
            res.learning_risk if res else "",
        ]
        writer.writerow(row)
    return response