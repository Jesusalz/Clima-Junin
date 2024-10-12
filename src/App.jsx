import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sun, Cloud, CloudRain, Wind, Thermometer, Moon, Search } from 'lucide-react';
import './index.css';

const API_KEY = import.meta.env.VITE_API_KEY || '587d12f484265303f4ceb2a6932ae3fb'; 

function App() {
  const [city, setCity] = useState('Junin,AR');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${API_KEY}`
        );
        setWeather(weatherResponse.data);

        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=es&appid=${API_KEY}`
        );
        setForecast(forecastResponse.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeather();
  }, [city]);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const getWeatherBackground = (weatherMain) => {
    if (weatherMain.toLowerCase() === 'clear') {
      return 'bg-sunny';
    } else if (weatherMain.toLowerCase() === 'clouds') {
      return 'bg-cloudy';
    } else if (weatherMain.toLowerCase().includes('rain')) {
      return 'bg-rainy';
    } else {
      return 'bg-default';
    }
  };

  const weatherIcons = {
    clear: <Sun className="w-12 h-12 text-yellow-400 animate-float" />,
    clouds: <Cloud className="w-12 h-12 text-gray-400 animate-float" />,
    rain: <CloudRain className="w-12 h-12 text-blue-400 animate-float" />,
    default: <Thermometer className="w-12 h-12 text-red-400 animate-float" />,
  };

  const getWeatherIcon = (main) => weatherIcons[main.toLowerCase()] || weatherIcons.default;

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode.toString());
      return newMode;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCity(searchTerm);
    setSearchTerm('');
  };

  if (!weather || !forecast) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  const dailyForecast = forecast.list.filter((item, index) => index % 8 === 0).slice(0, 7);

  const weatherBackground = getWeatherBackground(weather.weather[0].main);

  return (
    <div className={`min-h-screen ${weatherBackground} text-white p-8 transition-colors duration-500`}>
      <div className="cloud"></div>
      <div className="cloud" style={{ top: '20%', left: '60%', animationDelay: '-5s' }}></div>
      {weatherBackground === 'bg-rainy' && <div className="rain"></div>}
      {weatherBackground === 'bg-sunny' && <div className="sun"></div>}
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{city}</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white text-black focus:outline-none shadow-lg"
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-8 flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar ciudad..."
            className="p-2 rounded-l-md w-full h-10 text-sm focus:outline-none text-black placeholder-gray-500"
            style={{ backgroundColor: isDarkMode ? '#4a5568' : '#f7f7f7' }}
          />
          <button type="submit" className="p-2 bg-white text-black rounded-r-md h-10">
            <Search className="w-5 h-5" />
          </button>
        </form>

        <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-semibold">{Math.round(weather.main.temp)}°C</h2>
              <p className="text-xl">{weather.weather[0].description}</p>
              <p>Sensación térmica: {Math.round(weather.main.feels_like)}°C</p>
              <p>Presión: {weather.main.pressure} hPa</p>
              <p>Visibilidad: {weather.visibility / 1000} km</p>
              <p>Amanecer: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString('es-AR')}</p>
              <p>Atardecer: {new Date(weather.sys.sunset * 1000).toLocaleTimeString('es-AR')}</p>
            </div>
            {getWeatherIcon(weather.weather[0].main)}
          </div>
          <div className="mt-4 flex justify-between">
            <p>
              <Wind className="inline mr-2" /> {weather.wind.speed} m/s
            </p>
            <p>
              <Thermometer className="inline mr-2" /> {weather.main.humidity}% humedad
            </p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-4">Próximos días</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {dailyForecast.map((day) => (
            <div
              key={day.dt}
              className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-4 text-center shadow-lg"
            >
              <p className="font-semibold">
                {new Date(day.dt * 1000).toLocaleDateString('es-AR', { weekday: 'long' })}
              </p>
              <p>{new Date(day.dt * 1000).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</p>
              <p>{new Date(day.dt * 1000).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-2xl font-bold">{Math.round(day.main.temp)}°C</p>
              {getWeatherIcon(day.weather[0].main)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
