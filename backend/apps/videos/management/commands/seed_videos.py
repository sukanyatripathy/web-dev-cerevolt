from django.core.management.base import BaseCommand

from apps.videos.models import Video

# Placeholder videos for testing only. The YouTube IDs are fake,
# so the player will show "Video unavailable". Replace them with
# real videos in the Django admin page later.
TEST_VIDEOS = [
    {
        "title": "[TEST] Fun with Colours",
        "description": "Placeholder video about colours.",
        "youtube_id": "AAAAAAAAAAA",
        "topic": "colours",
        "age_group": "3-5",
        "language": "en",
        "duration_minutes": 5,
    },
    {
        "title": "[TEST] The Solar System",
        "description": "Placeholder video about the planets.",
        "youtube_id": "BBBBBBBBBBB",
        "topic": "science",
        "age_group": "6-8",
        "language": "en",
        "duration_minutes": 8,
    },
    {
        "title": "[TEST] Numbers Ka Maza",
        "description": "Placeholder Hindi video about numbers.",
        "youtube_id": "CCCCCCCCCCC",
        "topic": "maths",
        "age_group": "6-8",
        "language": "hi",
        "duration_minutes": 6,
    },
]


class Command(BaseCommand):
    help = "Add placeholder test videos (safe to run again)."

    def handle(self, *args, **options):
        created = 0
        for data in TEST_VIDEOS:
            _, was_created = Video.objects.get_or_create(
                youtube_id=data["youtube_id"], defaults=data
            )
            if was_created:
                created += 1
        self.stdout.write(
            self.style.SUCCESS(
                f"Done. {created} new test video(s) added, "
                f"{len(TEST_VIDEOS) - created} already existed."
            )
        )