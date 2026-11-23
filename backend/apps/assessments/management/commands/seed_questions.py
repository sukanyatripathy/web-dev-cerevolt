from django.core.management.base import BaseCommand
from apps.assessments.models import Question

# (subject, language, text, options, correct_index, difficulty)
QUESTIONS = [
    # Maths - English
    ("maths", "en", "What is 2 + 3?", ["4", "5", "6", "7"], 1, 1),
    ("maths", "en", "What is 10 - 4?", ["5", "6", "7", "8"], 1, 1),
    ("maths", "en", "What is 6 x 3?", ["12", "15", "18", "21"], 2, 2),
    ("maths", "en", "What is 20 / 5?", ["3", "4", "5", "6"], 1, 2),
    # Maths - Hindi
    ("maths", "hi", "2 + 3 = ?", ["4", "5", "6", "7"], 1, 1),
    ("maths", "hi", "10 - 4 = ?", ["5", "6", "7", "8"], 1, 1),
    # Maths - Bengali
    ("maths", "bn", "২ + ৩ = ?", ["৪", "৫", "৬", "৭"], 1, 1),
    ("maths", "bn", "১০ - ৪ = ?", ["৫", "৬", "৭", "৮"], 1, 1),
    # Science - English
    ("science", "en", "Which planet do we live on?", ["Mars", "Earth", "Venus", "Jupiter"], 1, 1),
    ("science", "en", "What do plants need to make food?", ["Sunlight", "Sand", "Plastic", "Sugar"], 0, 1),
    ("science", "en", "At what temperature does water freeze?", ["0 C", "50 C", "100 C", "20 C"], 0, 2),
    ("science", "en", "Which animal gives us milk?", ["Lion", "Cow", "Snake", "Eagle"], 1, 1),
    # Language - English
    ("language", "en", "Which word rhymes with 'cat'?", ["Dog", "Bat", "Sun", "Pen"], 1, 1),
    ("language", "en", "What is the opposite of 'hot'?", ["Warm", "Cold", "Big", "Fast"], 1, 1),
    ("language", "en", "Which of these is a noun?", ["Run", "Quickly", "Dog", "Blue"], 2, 2),
    ("language", "en", "Choose the correct spelling.", ["Frend", "Friend", "Freind", "Frind"], 1, 2),
]


class Command(BaseCommand):
    help = "Load sample assessment questions (safe to run more than once)"

    def handle(self, *args, **options):
        created = 0
        for subject, lang, text, options_list, correct, diff in QUESTIONS:
            _, was_new = Question.objects.update_or_create(
                subject=subject, language=lang, text=text,
                defaults={"options": options_list, "correct_index": correct,
                          "difficulty": diff},
            )
            created += int(was_new)
        self.stdout.write(self.style.SUCCESS(
            f"Done. {created} new, {len(QUESTIONS)} total in file."))