from django.core.management.base import BaseCommand

from apps.assessments.models import Question
from apps.assessments.question_bank import all_questions


class Command(BaseCommand):
    help = "Load science, language, colours and observation questions (safe to run more than once)"

    def handle(self, *args, **options):
        created = 0
        total = 0
        for subject, lang, level, q in all_questions():
            _, was_new = Question.objects.update_or_create(
                subject=subject, language=lang,
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
            f"Done. {created} new, {total} in the bank."))