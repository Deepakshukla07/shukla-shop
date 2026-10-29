
import { useCallback, useEffect, useState } from 'react';
import {
  CloudSun, CloudRain, Sun, Cloud, Thermometer,
  Droplets, Wind, RefreshCw, Sprout
} from 'lucide-react';

const API_URL =
  'https://api.open-meteo.com/v1/forecast' +
  '?latitude=26.15&longitude=81.81' +
  '&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code' +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum' +
  '&forecast_days=7&timezone=Asia%2FKolkata';

function getWeather(code) {
  if (code === 0) return { label: 'साफ मौसम', Icon: Sun };
  if ([1, 2].includes(code)) return { label: 'आंशिक बादल', Icon: CloudSun };
  if (code === 3) return { label: 'बादल', Icon: Cloud };
  if ([45, 48].includes(code)) return { label: 'कोहरा', Icon: Cloud };
  if ([51, 53, 55, 56, 57].includes(code))
    return { label: 'हल्की बूंदाबांदी', Icon: CloudRain };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: 'बारिश', Icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: 'बर्फबारी', Icon: Cloud };
  if ([95, 96, 99].includes(code))
    return { label: 'गरज के साथ बारिश', Icon: CloudRain };
  return { label: 'मौसम की जानकारी', Icon: CloudSun };
}

const dayFormatter = new Intl.DateTimeFormat('hi-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC'
});

export default function WeatherSection() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('मौसम डेटा उपलब्ध नहीं है');

      const data = await response.json();
      if (!data.current || !data.daily) {
        throw new Error('मौसम की जानकारी अधूरी है');
      }

      setWeather(data);
    } catch {
      setError('मौसम की जानकारी अभी नहीं मिल सकी। दोबारा कोशिश करें।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const current = weather?.current;
  const today = current ? getWeather(current.weather_code) : null;
  const TodayIcon = today?.Icon || CloudSun;

  return (
    <section className="weather-section" id="weather">
      <div className="container">
        <div className="weather-heading">
          <span className="section-kicker">
            <Sprout size={16} /> किसानों के लिए उपयोगी जानकारी
          </span>
          <h2>किसान मौसम अपडेट</h2>
          <p>अमेठी, उत्तर प्रदेश का मौसम और अगले 7 दिनों का पूर्वानुमान</p>
        </div>

        {loading && (
          <div className="weather-message">
            मौसम की जानकारी लोड हो रही है...
          </div>
        )}

        {!loading && error && (
          <div className="weather-message">
            <p>{error}</p>
            <button className="weather-refresh" onClick={loadWeather}>
              <RefreshCw size={16} /> फिर से कोशिश करें
            </button>
          </div>
        )}

        {!loading && !error && current && (
          <>
            <div className="weather-current">
              <div className="weather-current-main">
                <div>
                  <span className="weather-location">📍 अमेठी, उत्तर प्रदेश</span>
                  <h3>आज का मौसम</h3>
                  <p>{today.label}</p>
                </div>
                <TodayIcon size={58} strokeWidth={1.5} />
                <div className="weather-temperature">
                  {Math.round(current.temperature_2m)}°
                  <small>महसूस हो रहा है {Math.round(current.apparent_temperature)}°C</small>
                </div>
              </div>

              <div className="weather-stats">
                <div>
                  <Droplets size={21} />
                  <span>नमी</span>
                  <strong>{current.relative_humidity_2m}%</strong>
                </div>
                <div>
                  <Wind size={21} />
                  <span>हवा की गति</span>
                  <strong>{current.wind_speed_10m} km/h</strong>
                </div>
                <div>
                  <Thermometer size={21} />
                  <span>तापमान</span>
                  <strong>{Math.round(current.temperature_2m)}°C</strong>
                </div>
              </div>
            </div>

            <h3 className="forecast-title">अगले 7 दिनों का पूर्वानुमान</h3>

            <div className="forecast-grid">
              {weather.daily.time.map((date, index) => {
                const day = getWeather(weather.daily.weather_code[index]);
                const DayIcon = day.Icon;

                return (
                  <article className="forecast-card" key={date}>
                    <strong>
                      {index === 0 ? 'आज' : dayFormatter.format(
                        new Date(`${date}T12:00:00Z`)
                      )}
                    </strong>
                    <DayIcon size={30} strokeWidth={1.6} />
                    <span className="forecast-condition">{day.label}</span>
                    <div className="forecast-temperatures">
                      <b>{Math.round(weather.daily.temperature_2m_max[index])}°</b>
                      <span>{Math.round(weather.daily.temperature_2m_min[index])}°</span>
                    </div>
                    <span className="forecast-rain">
                      <CloudRain size={15} />
                      {weather.daily.precipitation_probability_max[index] ?? 0}%
                    </span>
                    <small>बारिश की संभावना</small>
                  </article>
                );
              })}
            </div>

            <div className="weather-advice">
              <CloudRain size={22} />
              <div>
                <strong>किसानों के लिए सुझाव</strong>
                <p>
                  बुवाई, सिंचाई या छिड़काव से पहले स्थानीय मौसम और खेत की
                  स्थिति जाँचें। बारिश की संभावना को निश्चित बारिश न मानें।
                  फसल-विशेष सलाह के लिए कृषि विशेषज्ञ से संपर्क करें।
                </p>
              </div>
            </div>

            <div className="weather-footer">
              <span>
                स्रोत: Open-Meteo Forecast API · पूर्वानुमान बदल सकता है
              </span>
              <button className="weather-refresh" onClick={loadWeather}>
                <RefreshCw size={15} /> अपडेट करें
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
