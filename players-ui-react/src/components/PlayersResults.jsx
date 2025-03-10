import React, { useEffect, useState } from 'react';
import '../styling/PlayersResults.css';
import {validateId, validateCountryCode, sanitizeInput, handleApiError} from "../utils";
import useDatatFetcher from "../utils/DataFetcher";
import fetchData from "../utils/DataFetcher";

function PlayerResults() {
    const [players, setPlayers] = useState([]);
    const [playerId, setPlayerId] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [groupedView, setGroupedView] = useState(false);
    const [expandedCountries, setExpandedCountries] = useState({});

    useEffect(() => {

        fetchData()
            .then(data => {
                const subsetOfPlayers = data.players.slice(0,10);
                setPlayers(subsetOfPlayers)
                console.log(subsetOfPlayers)
            })
    }, []);

    const handleSearchById = (input) => {
        if (!validateId(input)) {
            console.error('Invalid player ID format');
            return;
        }

        const sanitizedInput = sanitizeInput(input);
        fetchData(sanitizedInput)
            .then(response => {
                if (!response || !response.players) {
                    throw new Error('Invalid response format');
                }
                const matchingPlayer = response.players.find(player => player.playerId === sanitizedInput);
                setPlayers(matchingPlayer ? [matchingPlayer] : []);
            })
            .catch(error => {
                const { status, message } = handleApiError(error);
                console.error(`Error fetching player by ID (${status}):`, message);
                setPlayers([]);
            });
    }

    const handleSearchByCountry = (input) => {
        if (!validateCountryCode(input)) {
            console.error('Invalid country code format');
            return;
        }

        const sanitizedInput = sanitizeInput(input);
        fetchData()
            .then(response => {
                if (!response || !response.players) {
                    throw new Error('Invalid response format');
                }
                const matchingPlayers = response.players.filter(player => player.birthCountry === sanitizedInput);
                setPlayers(matchingPlayers);
            })
            .catch(error => {
                const { status, message } = handleApiError(error);
                console.error(`Error fetching players by country (${status}):`, message);
                setPlayers([]);
            });
    }

    const handleSearchByName = (input) => {
        if (!input.trim()) {
            console.error('Empty search input');
            return;
        }
        
        const sanitizedInput = sanitizeInput(input).toLowerCase();
        fetchData()
            .then(response => {
                if (!response || !response.players) {
                    throw new Error('Invalid response format');
                }

                const matchingPlayers = response.players
                    .filter(player => {
                        if (!player || typeof player !== 'object') return false;
                        
                        const firstName = player.nameFirst || '';
                        const lastName = player.nameLast || '';
                        const fullName = `${firstName} ${lastName}`.toLowerCase();
                        
                        return fullName.includes(sanitizedInput) || 
                               firstName.toLowerCase().startsWith(sanitizedInput) || 
                               lastName.toLowerCase().startsWith(sanitizedInput);
                    })
                    .sort((a, b) => {
                        const lastA = (a.nameLast || '').toLowerCase();
                        const lastB = (b.nameLast || '').toLowerCase();
                        const firstA = (a.nameFirst || '').toLowerCase();
                        const firstB = (b.nameFirst || '').toLowerCase();
                        
                        const lastNameCompare = lastA.localeCompare(lastB);
                        return lastNameCompare !== 0 ? lastNameCompare : firstA.localeCompare(firstB);
                    });

                setPlayers(matchingPlayers);
            })
            .catch(error => {
                const { status, message } = handleApiError(error);
                console.error(`Error fetching players by name (${status}):`, message);
                setPlayers([]);
            });
    }

    const handleGroupByCountries = () => {
        setGroupedView(!groupedView);
    };

    const toggleCountryView = (country) => {
        setExpandedCountries(prev => ({
            ...prev,
            [country]: !prev[country]
        }));
    };

    const renderGroupedView = () => {
        const groupedPlayers = players.reduce((acc, player) => {
            const country = player.birthCountry || 'Unknown';
            if (!acc[country]) {
                acc[country] = [];
            }
            acc[country].push(player);
            return acc;
        }, {});

        return Object.entries(groupedPlayers).map(([country, countryPlayers]) => (
            <div key={country} className="country-group">
                <div className="country-header">
                    <h3>{country}</h3>
                    <button onClick={() => toggleCountryView(country)}>
                        {expandedCountries[country] ? 'Show Less' : 'View More'}
                    </button>
                </div>
                <div className="players-list">
                    {(expandedCountries[country] ? countryPlayers : countryPlayers.slice(0, 3)).map((player) => (
                        <div key={player.playerId} style={{"display": "flex", "gap": "2vh", "padding": "10px"}}>
                            <div>{player.playerId}</div>
                            <div>{`${player.nameFirst} ${player.nameLast}`}</div>
                            <div>{player.birthYear}</div>
                            <div>{player.birthCountry}</div>
                            <div>{player.birthCity}</div>
                            <div>{player.bats}/{player.throws}</div>
                        </div>
                    ))}
                </div>
            </div>
        ));
    };

    return (
        <div className="player-results">
            <div className="player-results-header">
                <div className="player-results-search">
                    <label>Player id:</label>
                    <input 
                        type="text"
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                        placeholder="Enter player id..."
                    />
                    <button onClick={() => handleSearchById(playerId)}>Submit</button>
                    
                    <input 
                        type="text"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        placeholder="Enter country code..."
                    />
                    <button onClick={() => handleSearchByCountry(countryCode)}>Submit</button>
                </div>
                <div className="player-results-search">
                    <label>Player Name:</label>
                    <input 
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter player name..."
                    />
                    <button onClick={() => handleSearchByName(playerName)}>Submit</button>
                </div>
            </div>
            <div className="players-results-section">
                <button 
                    className="group-by-countries-btn"
                    onClick={handleGroupByCountries}
                >
                    {groupedView ? 'Show Regular View' : 'Group by Countries'}
                </button>
                
                {groupedView ? renderGroupedView() : (
                    players.map((player) => (
                        <div style={{"display": "flex", "gap": "2vh", "padding": "10px"}}>
                            <div>{player.playerId}</div>
                            <div>{`${player.nameFirst} ${player.nameLast}`}</div>
                            <div>{player.birthYear}</div>
                            <div>{player.birthCountry}</div>
                            <div>{player.birthCity}</div>
                            <div>{player.bats}/{player.throws}</div>
                        </div>
                    )
                    ))}
            </div>
        </div>
    )
}

export default PlayerResults;
