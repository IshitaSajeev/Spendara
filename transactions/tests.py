from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import Category


class CategoryOwnershipTests(APITestCase):
    def setUp(self):
        # Runs before each test: create two users and one category owned by user A
        self.user_a = User.objects.create_user(username='usera', password='test1234')
        self.user_b = User.objects.create_user(username='userb', password='test1234')
        self.category_a = Category.objects.create(name='Food', user=self.user_a)

    def make_payload(self):
        return {
            'title': 'Test',
            'amount': '10.00',
            'transaction_type': 'EXPENSE',
            'category': self.category_a.id,
            'date': '2026-11-01',
        }

    def test_cannot_use_another_users_category(self):
        # User B tries to use user A's category -> should be rejected
        self.client.force_authenticate(user=self.user_b)
        response = self.client.post('/api/transactions/', self.make_payload(), format='json')
        self.assertEqual(response.status_code, 400)

    def test_can_use_own_category(self):
        # User A uses their own category -> should work
        self.client.force_authenticate(user=self.user_a)
        response = self.client.post('/api/transactions/', self.make_payload(), format='json')
        self.assertEqual(response.status_code, 201)