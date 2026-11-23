from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework.test import APITestCase

from apps.accounts.models import ParentChildLink, Profile

from .models import ChildCode, GameSession

PASSWORD = 'StrongPass123!'


def make_user(email, role):
    user = User.objects.create_user(username=email, email=email, password=PASSWORD)
    Profile.objects.create(user=user, role=role, normalized_email=email, status='approved')
    return user


class GameplayTests(APITestCase):
    def setUp(self):
        cache.clear() 
        self.child = make_user('child@test.com', 'child')
        self.parent = make_user('parent@test.com', 'parent')
        self.other_parent = make_user('other@test.com', 'parent')

    def get_code(self):
        self.client.force_authenticate(user=self.child)
        return self.client.get('/gameplay/my-code/').data['child_code']

    def link_parent(self, parent, code):
        self.client.force_authenticate(user=parent)
        return self.client.post('/gameplay/link-child/', {'child_code': code}, format='json')

    def test_child_code_is_created_once(self):
        first = self.get_code()
        second = self.get_code()
        self.assertEqual(first, second)
        self.assertEqual(ChildCode.objects.filter(child=self.child).count(), 1)

    def test_child_saves_session_but_parent_cannot(self):
        payload = {
            'game_key': 'memory_match', 'difficulty_level': 1, 'score': 75,
            'accuracy_pct': 75, 'duration_seconds': 40, 'completed': True,
            'metrics': {'moves': 4, 'pairs': 3, 'variant': 'animal-cards'},
        }
        self.client.force_authenticate(user=self.child)
        resp = self.client.post('/gameplay/sessions/', payload, format='json')
        self.assertEqual(resp.status_code, 201)
        saved = GameSession.objects.get()
        self.assertEqual(saved.child, self.child)
        self.assertEqual(saved.variant, 'animal-cards')

        self.client.force_authenticate(user=self.parent)
        resp = self.client.post('/gameplay/sessions/', payload, format='json')
        self.assertEqual(resp.status_code, 403)

    def test_parent_links_and_can_read_analysis_and_csv(self):
        GameSession.objects.create(
            child=self.child, game_key='memory_match', variant='animal-cards',
            difficulty_level=1, score=75, duration_seconds=40,
        )
        code = self.get_code()
        resp = self.link_parent(self.parent, code)
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(
            ParentChildLink.objects.filter(
                parent=self.parent, child=self.child, status='verified'
            ).exists()
        )

        mine = self.client.get('/gameplay/my-children/')
        self.assertEqual(len(mine.data), 1)

        analysis = self.client.get(f'/gameplay/children/{self.child.pk}/analysis/')
        self.assertEqual(analysis.status_code, 200)
        self.assertEqual(analysis.data['overview']['total_sessions'], 1)

        export = self.client.get(f'/gameplay/children/{self.child.pk}/export/')
        self.assertEqual(export.status_code, 200)
        self.assertIn('text/csv', export['Content-Type'])
        text = export.content.decode()
        self.assertIn('Memory Match', text)
        self.assertIn('animal-cards', text)

    def test_unlinked_parent_is_blocked(self):
        self.get_code()
        self.client.force_authenticate(user=self.other_parent)
        self.assertEqual(
            self.client.get(f'/gameplay/children/{self.child.pk}/analysis/').status_code, 403
        )
        self.assertEqual(
            self.client.get(f'/gameplay/children/{self.child.pk}/export/').status_code, 403
        )

    def test_child_cannot_view_analysis_or_csv(self):
        self.client.force_authenticate(user=self.child)
        self.assertEqual(
            self.client.get(f'/gameplay/children/{self.child.pk}/analysis/').status_code, 403
        )
        self.assertEqual(
            self.client.get(f'/gameplay/children/{self.child.pk}/export/').status_code, 403
        )

    def test_wrong_code_is_rejected(self):
        resp = self.link_parent(self.parent, 'ZZZZ-ZZZZ')
        self.assertEqual(resp.status_code, 404)

    def test_max_two_parents_per_child(self):
        code = self.get_code()
        third = make_user('third@test.com', 'parent')
        self.assertEqual(self.link_parent(self.parent, code).status_code, 201)
        self.assertEqual(self.link_parent(self.other_parent, code).status_code, 201)
        self.assertEqual(self.link_parent(third, code).status_code, 400)

    def test_parent_signup_creates_account_and_link(self):
        code = self.get_code()
        self.client.force_authenticate(user=None)
        resp = self.client.post('/gameplay/parent-signup/', {
            'email': 'newparent@test.com', 'password': PASSWORD,
            'first_name': 'New', 'child_code': code.lower(),
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        user = User.objects.get(email='newparent@test.com')
        self.assertEqual(user.profile.role, 'parent')
        self.assertEqual(user.profile.status, 'approved')
        self.assertTrue(
            ParentChildLink.objects.filter(parent=user, child=self.child, status='verified').exists()
        )

    def test_parent_signup_with_bad_code_creates_no_account(self):
        self.client.force_authenticate(user=None)
        resp = self.client.post('/gameplay/parent-signup/', {
            'email': 'ghost@test.com', 'password': PASSWORD, 'child_code': 'ZZZZ-ZZZZ',
        }, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(User.objects.filter(email='ghost@test.com').exists())

    def test_csv_neutralises_spreadsheet_formulas(self):
        GameSession.objects.create(
            child=self.child, game_key='math_magic', variant='=SUM(1)',
            difficulty_level=1, score=50, duration_seconds=10,
        )
        self.link_parent(self.parent, self.get_code())
        self.client.force_authenticate(user=self.parent)
        text = self.client.get(f'/gameplay/children/{self.child.pk}/export/').content.decode()
        self.assertIn("'=SUM(1)", text)