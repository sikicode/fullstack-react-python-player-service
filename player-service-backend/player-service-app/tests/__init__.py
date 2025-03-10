import unittest
from flask import json

class PlayerServiceTests(unittest.TestCase):
    def setUp(self):
        from app import app
        self.app = app.test_client()
        self.app.testing = True

    def test_get_players(self):
        response = self.app.get('/api/players')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('players', data)
        self.assertTrue(len(data['players']) > 0)

    def test_get_player_by_id(self):
        # Test with a known player ID from the CSV
        response = self.app.get('/api/players/aaronha01')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['players'][0]['nameFirst'], 'Hank')
        self.assertEqual(data['players'][0]['nameLast'], 'Aaron')

    def test_get_players_by_country(self):
        response = self.app.get('/api/players?country=USA')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(all(player['birthCountry'] == 'USA' for player in data['players']))

    def test_invalid_player_id(self):
        response = self.app.get('/api/players/invalidid123')
        self.assertEqual(response.status_code, 404)

    def test_search_by_name(self):
        response = self.app.get('/api/players?name=Aaron')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(any('Aaron' in player['nameFirst'] or 'Aaron' in player['nameLast'] 
                          for player in data['players']))

if __name__ == '__main__':
    unittest.main()