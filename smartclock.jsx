import React, { useState, useEffect } from 'react';
import './SmartClock.scss';

const SmartClock = () => {
  const [time, setTime] = useState(new Date());
  const [city, setCity] = useState('');
  const [temperature, setTemperature] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [showCityInput, setShowCityInput] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const API_KEY = '840f2e7255bcf146931fd21cbbbe7b97';

  const GEO_URL = (q, limit = 1) =>
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${API_KEY}`;

  const FORECAST_URL = (lat, lon) =>
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=fr`;

  const WEATHER_URL = (lat, lon) =>
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=fr`;

  // Mise à jour de l'heure chaque seconde
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Obtenir la position de l'utilisateur au chargement
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          // Ville par défaut si la géolocalisation échoue
          searchCity('Paris');
        }
      );
    }
  }, []);

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(WEATHER_URL(lat, lon));
      const data = await response.json();
      setTemperature(Math.round(data.main.temp));
      setCity(data.name);
    } catch (error) {
      console.error('Erreur lors de la récupération des données météo:', error);
    }
  };

  const searchCity = async (cityName) => {
    try {
      const response = await fetch(GEO_URL(cityName));
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, name } = data[0];
        setCoordinates({ lat, lon });
        setCity(name);
        fetchWeatherData(lat, lon);
        setShowCityInput(false);
        setCitySearch('');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de ville:', error);
    }
  };

  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (citySearch.trim()) {
      searchCity(citySearch);
    }
  };

  // Calcul des pourcentages pour les arcs
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondsPercent = (seconds / 60) * 100;
  const minutesPercent = (minutes / 60) * 100;
  const hoursPercent = ((hours % 12) / 12) * 100 + (minutes / 60) * (100 / 12);

  // Jours de la semaine
  const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const currentDayIndex = time.getDay() === 0 ? 6 : time.getDay() - 1;

  // Formatage de la date
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  const day = time.getDate();
  const month = months[time.getMonth()];
  const year = time.getFullYear();

  // Déterminer si on utilise "de" ou "d'"
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'A', 'E', 'I', 'O', 'U', 'Y'];
  const preposition = city && vowels.includes(city[0]) ? "d'" : 'de ';

  return (
    <div className="smart-clock">
      <header className="header">
        <h1 className="title">
          HEURE DANS LA VILLE {preposition.toUpperCase()}{city.toUpperCase()}
        </h1>
      </header>

      <main className="main-content">
        {/* Partie gauche - Température */}
        <div className="left-section">
          <div className="temperature-circle">
            <span className="temp-value">{temperature !== null ? `${temperature}°` : '--°'}</span>
          </div>
          <div className="city-name">{city || 'Chargement...'}</div>
          <button 
            className="change-city-btn" 
            onClick={() => setShowCityInput(!showCityInput)}
          >
            Changer de ville
          </button>
          {showCityInput && (
            <form onSubmit={handleCitySubmit} className="city-input-form">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="Nom de la ville"
                className="city-input"
                autoFocus
              />
              <button type="submit" className="submit-btn">OK</button>
            </form>
          )}
        </div>

        {/* Partie centrale - Horloge */}
        <div className="center-section">
          <div className="clock-container">
            <svg className="clock-svg" viewBox="0 0 200 200">
              {/* Arc pour les heures (bleu) */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="rgba(100, 100, 100, 0.2)"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#00A8FF"
                strokeWidth="8"
                strokeDasharray={`${(hoursPercent / 100) * 534.07} 534.07`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                className="arc-animation"
              />

              {/* Arc pour les minutes (vert) */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="rgba(100, 100, 100, 0.2)"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#00FF87"
                strokeWidth="8"
                strokeDasharray={`${(minutesPercent / 100) * 439.82} 439.82`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                className="arc-animation"
              />

              {/* Arc pour les secondes (rouge) */}
              <circle
                cx="100"
                cy="100"
                r="55"
                fill="none"
                stroke="rgba(100, 100, 100, 0.2)"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="55"
                fill="none"
                stroke="#FF3366"
                strokeWidth="8"
                strokeDasharray={`${(secondsPercent / 100) * 345.58} 345.58`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                className="arc-animation"
              />
            </svg>

            <div className="time-display">
              <div className="time-numbers">
                <span className="hours">{String(hours).padStart(2, '0')}</span>
                <span className="separator">:</span>
                <span className="minutes">{String(minutes).padStart(2, '0')}</span>
                <span className="separator">:</span>
                <span className="seconds">{String(seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Partie droite - Calendrier */}
        <div className="right-section">
          <div className="date-display">
            <span className="day">{day}</span>
            <span className="month">{month}</span>
            <span className="year">{year}</span>
          </div>
          <div className="week-display">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="day-item">
                <span className="day-initial">{day}</span>
                <div className={`day-indicator ${index <= currentDayIndex ? 'completed' : ''}`}>
                  {index <= currentDayIndex && (
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path
                        d="M3 8l3 3 7-7"
                        fill="none"
                        stroke="#00FF87"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>
          Police "Spaceline" de <a href="https://fontmeme.com" target="_blank" rel="noopener noreferrer">FontMeme.com</a>
        </p>
        <p className="creator">
          Créé par [Votre Nom] | 
          <a href="#" className="footer-link">Projet 1</a> | 
          <a href="#" className="footer-link">Projet 2</a>
        </p>
      </footer>
    </div>
  );
};

export default SmartClock;