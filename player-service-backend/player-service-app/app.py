from flask import Flask, request, jsonify
import pandas as pd
import sqlite3
from sqlalchemy import create_engine
from player_service import PlayerService
import ollama
import logging
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Add this line after creating the Flask app

logging.basicConfig(level=logging.DEBUG)

df = pd.read_csv('Player.csv')
engine = create_engine('sqlite:///player.db', echo=True)
df.to_sql('players', con=engine, if_exists='replace', index=False)

# Fix database initialization
def init_db(csv_path):
    try:
        df = pd.read_csv(csv_path)  # Use the passed csv_path parameter
        engine = create_engine('sqlite:///player.db', echo=True)
        df.to_sql('players', con=engine, if_exists='replace', index=False)
    except Exception as e:
        app.logger.error(f"Database initialization error: {str(e)}")
        raise

# Initialize database with the correct CSV path
#csv_path = '/Users/sc/Desktop/Desktop/fullstack-react-python-player-service/player-service-backend/player-service-app/Player.csv'
#if os.path.exists(csv_path):
#   init_db('Player.csv')

# Get all players
@app.route('/v1/players', methods=['GET'])
def get_players():
    player_service = PlayerService()
    result = player_service.get_all_players()
    #app.logger.debug(f"Result type: {type(result)}")
    #app.logger.debug(f"Result content: {result}")
    return {"players": result}

def generate_player_description(player_data):
    # Create a more detailed prompt with additional player information
    prompt = f"Generate a brief description for this baseball player:\n"
    prompt += f"Name: {player_data.get('nameFirst', '')} {player_data.get('nameLast', '')}\n"
    prompt += f"Birth: {player_data.get('birthCity', '')}, {player_data.get('birthCountry', '')}\n"
    prompt += f"Physical: Height {player_data.get('height', '')} cm, Weight {player_data.get('weight', '')} lbs\n"
    prompt += f"Bats: {player_data.get('bats', '')}, Throws: {player_data.get('throws', '')}\n"
    prompt += f"Debut: {player_data.get('debut', '')}\n"
    prompt += f"Final Game: {player_data.get('finalGame', '')}\n"
    prompt += f"College: {player_data.get('college', '')}\n"
    prompt += "Please provide a comprehensive summary in 2-3 sentences, including their career timeline and notable characteristics."

    try:
        response = ollama.chat(model='tinyllama', messages=[
            {
                'role': 'user',
                'content': prompt,
            },
        ])
        return response['message']['content']
    except Exception as e:
        app.logger.error(f"Error generating player description: {str(e)}")
        return "Unable to generate player description at this time."

@app.route('/v1/players/<string:player_id>')
def query_player_id(player_id):
    player_service = PlayerService()
    result = player_service.search_by_player(player_id)

    if len(result) == 0:
        return {"error": "No record found with player_id={}".format(player_id)}, 404
    else:
        ai_description = generate_player_description(result[0])
        return {
            "player": result,
            "ai_description": ai_description
        }

@app.route('/v1/players/country/<string:country>')
def query_player_by_country(country):
    player_service = PlayerService()
    result = player_service.search_by_country(country)
    
    if len(result) == 0:
        return {"error": f"No players found from country: {country}"}, 404
    else:
        return {"players": result}

@app.route('/v1/countries', methods=['GET'])
def get_countries():
    player_service = PlayerService()
    result = player_service.get_all_players()
    # Filter out None values and empty strings before sorting
    countries = sorted(list(set(player['birthCountry'] for player in result if player['birthCountry'] and player['birthCountry'].strip())))
    return {"countries": countries}

@app.route('/v1/chat/list-models')
def list_models():
    return jsonify(ollama.list())

@app.route('/v1/chat', methods=['POST'])
def chat():
    # Process the data as needed
    response = ollama.chat(model='tinyllama', messages=[
        {
            'role': 'user',
            'content': 'Why is the sky blue?',
        },
    ])
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
