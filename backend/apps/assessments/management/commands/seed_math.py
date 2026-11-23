from django.core.management.base import BaseCommand

from apps.assessments.math_generator import generate_math_bank
from apps.assessments.models import Question


class Command(BaseCommand):
    help = "Generate random maths questions for levels 1-3 in en/hi/bn (safe to run more than once)"

    def add_arguments(self, parser):
        parser.add_argument("--per-level", type=int, default=45,
                            help="Questions per level per language (default 45)")

    def handle(self, *args, **options):
        per_level = options["per_level"]
        created = 0
        total = 0
        for level in (1, 2, 3):
            for lang in ("en", "hi", "bn"):
                bank = generate_math_bank(level, lang, per_level, seed=level * 100)
                for q in bank:
                    _, was_new = Question.objects.update_or_create(
                        subject="maths", language=lang,
                        text=q["text"], visual=q["visual"],
                        defaults={
                            "options": q["options"],
                            "correct_index": q["correct_index"],
                            "difficulty": level,
                        },
                    )
                    created += int(was_new)
                    total += 1
        self.stdout.write(self.style.SUCCESS(
            f"Done. {created} new, {total} generated in total."))