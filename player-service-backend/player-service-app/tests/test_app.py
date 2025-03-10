"""
python3 -m venv env
source env/bin/activate
pip install pytest flask pandas sqlalchemy ollama
pytest -vvs /Users/sc/Desktop/Desktop/fullstack-react-python-player-service/player-service-backend/player-service-app/tests/test_app.py::test_get_player_by_id
"""
import pytest
from flask import json
import os
import sys
import os
from app import app
from app import init_db

@pytest.fixture
def client():
    # Set absolute path to Player.csv in the app directory
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Player.csv')
    app.config['CSV_PATH'] = csv_path
    app.config['TESTING'] = True
    
    # Initialize the database for testing
    init_db(csv_path)
    
    with app.test_client() as client:
        yield client

def test_get_all_players(client):
    # Import init_db at the top of the file
    
    # Test the GET all players endpoint
    response = client.get('/v1/players')  # Updated endpoint
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'players' in data
    assert isinstance(data['players'], list)

def test_get_player_by_id(client):
    response = client.get('/v1/players/aaronha01')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'player' in data  # Changed from 'players' to 'player'
    assert len(data['player']) == 1
    assert data['player'][0]['nameFirst'] == 'Hank'
    assert data['player'][0]['nameLast'] == 'Aaron'

def test_get_players_by_country(client):
    response = client.get('/v1/players/country/USA')
    assert response.status_code == 200
    data = json.loads(response.data)
    # Check if any players are returned and they're all from USA
    assert len(data['players']) > 0
    for player in data['players']:
        assert player['birthCountry'] == 'USA'

def test_invalid_player_id(client):
    response = client.get('/v1/players/invalid123')
    assert response.status_code == 404  # Should return not found for invalid ID
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == "No record found with player_id=invalid123"  # Check for error message

def test_search_by_name(client):
    response = client.get('/v1/players?name=Aaron')  # Updated endpoint
    assert response.status_code == 200
    data = json.loads(response.data)
    assert any('Aaron' in f"{player['nameFirst']} {player['nameLast']}" 
              for player in data['players'])

# @pytest.mark.parametrize("search_param", [
#     '?name=',
#     '?country=',
#     '?invalid_param=value'
# ])
# def test_invalid_search_params(client, search_param):
#     response = client.get(f'/v1/players{search_param}')  # Updated endpoint
#     assert response.status_code == 200
#     data = json.loads(response.data)
#     assert 'players' in data
