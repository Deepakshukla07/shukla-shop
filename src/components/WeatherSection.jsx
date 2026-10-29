import { useCallback, useEffect, useState } from "react";
import {
  CloudSun,
  CloudRain,
  Sun,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  Sprout,
  MapPin,
  LocateFixed,
} from "lucide-react";

// District coordinates are approximate city/district-center locations.

const districts = {
  amethi: { name: "अमेठी", latitude: 26.15, longitude: 81.81 },
  lucknow: { name: "लखनऊ", latitude: 26.85, longitude: 80.95 },
  prayagraj: { name: "प्रयागराज", latitude: 25.44, longitude: 81.84 },
  ayodhya: { name: "अयोध्या", latitude: 26.8, longitude: 82.2 },
  sultanpur: { name: "सुल्तानपुर", latitude: 26.26, longitude: 82.07 },
  raebareli: { name: "रायबरेली", latitude: 26.23, longitude: 81.24 },
  varanasi: { name: "वाराणसी", latitude: 25.32, longitude: 83.01 },
  kanpur: { name: "कानपुर", latitude: 26.45, longitude: 80.33 },
  gorakhpur: { name: "गोरखपुर", latitude: 26.76, longitude: 83.37 },
  jaunpur: { name: "जौनपुर", latitude: 25.75, longitude: 82.68 },
  barabanki: { name: "बाराबंकी", latitude: 26.94, longitude: 81.19 },
  delhi: { name: "दिल्ली", latitude: 28.61, longitude: 77.21 },
};

function getWeather(code) {
  if (code === 0) return { label: "साफ मौसम", Icon: Sun };
  if ([1, 2].includes(code)) return { label: "आंशिक बादल", Icon: CloudSun };
  if (code === 3) return { label: "बादल", Icon: Cloud };
  if ([45, 48].includes(code)) return { label: "कोहरा", Icon: Cloud };
  if ([51, 53, 55, 56, 57].includes(code))
    return { label: "बूंदाबांदी", Icon: CloudRain };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: "बारिश", Icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "बर्फबारी", Icon: Cloud };
  if ([95, 96, 99].includes(code))
    return { label: "गरज के साथ बारिश", Icon: CloudRain };
  return { label: "मौसम की जानकारी", Icon: CloudSun };
}

const dayFormatter = new Intl.DateTimeFormat("hi-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export default function WeatherSection() {
  const [district, setDistrict] = useState("amethi");
  const [location, setLocation] = useState(districts.amethi);
  const [isGps, setIsGps] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");

      url.search = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "wind_speed_10m",
          "weather_code",
        ].join(","),
        daily: [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "precipitation_probability_max",
          "precipitation_sum",
        ].join(","),
        forecast_days: "7",
        timezone: "auto",
      }).toString();

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("मौसम API से जवाब नहीं मिला।");
      }

      const data = await response.json();

      if (!data.current || !data.daily) {
        throw new Error("मौसम की जानकारी उपलब्ध नहीं है।");
      }

      setWeather(data);
    } catch {
      setError("मौसम डेटा लोड नहीं हुआ। इंटरनेट जाँचकर फिर कोशिश करें।");
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const selectDistrict = (event) => {
    const key = event.target.value;
    setDistrict(key);
    setLocation(districts[key]);
    setIsGps(false);
    setNotice("");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setNotice("आपका ब्राउज़र GPS लोकेशन सपोर्ट नहीं करता। जिला चुनें।");
      return;
    }

    setGpsLoading(true);
    setNotice("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          name: "आपकी वर्तमान लोकेशन",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsGps(true);
        setGpsLoading(false);
        setNotice("आपकी लोकेशन मिल गई। मौसम अपडेट किया जा रहा है।");
      },
      (err) => {
        const message =
          err.code === 1
            ? "लोकेशन की अनुमति नहीं मिली। ब्राउज़र सेटिंग में अनुमति दें या जिला चुनें।"
            : err.code === 2
            ? "आपकी लोकेशन नहीं मिल सकी। GPS चालू करके या जिला चुनकर कोशिश करें।"
            : "लोकेशन मिलने में समय लगा। दोबारा कोशिश करें या जिला चुनें।";

        setNotice(message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
    );
  };

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
          <p>अपनी लोकेशन या जिला चुनकर मौसम की जानकारी देखें।</p>
        </div>

        <div className="weather-location-tools">
          <button
            type="button"
            className="weather-location-button"
            onClick={useMyLocation}
            disabled={gpsLoading}
          >
            <LocateFixed size={18} />
            {gpsLoading
              ? "लोकेशन प्राप्त हो रही है..."
              : "मेरी लोकेशन से मौसम देखें"}
          </button>

          <label className="weather-district-select">
            <MapPin size={18} />
            <select value={district} onChange={selectDistrict}>
              {Object.entries(districts).map(([key, item]) => (
                <option value={key} key={key}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {notice && (
          <p className="weather-notice" role="status">
            {notice}
          </p>
        )}

        {loading && (
          <div className="weather-message">
            मौसम की जानकारी लोड हो रही है...
          </div>
        )}

        {!loading && error && (
          <div className="weather-message" role="alert">
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
                  <span className="weather-location">
                    📍 {location.name}
                    {isGps ? " · GPS" : ""}
                  </span>
                  <h3>वर्तमान मौसम</h3>
                  <p>{today.label}</p>
                </div>

                <TodayIcon size={54} strokeWidth={1.5} />

                <div className="weather-temperature">
                  {Math.round(current.temperature_2m)}°C
                  <small>
                    महसूस हो रहा है {Math.round(current.apparent_temperature)}°C
                  </small>
                </div>
              </div>

              <div className="weather-stats">
                <div>
                  <Droplets size={21} />
                  <span>हवा में नमी</span>
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
                      {index === 0
                        ? "आज"
                        : dayFormatter.format(new Date(`${date}T12:00:00Z`))}
                    </strong>
                    <DayIcon size={30} />
                    <span className="forecast-condition">{day.label}</span>
                    <div className="forecast-temperatures">
                      <b>
                        {Math.round(weather.daily.temperature_2m_max[index])}°
                      </b>
                      <span>
                        {Math.round(weather.daily.temperature_2m_min[index])}°
                      </span>
                    </div>
                    <span className="forecast-rain">
                      <CloudRain size={15} />
                      {weather.daily.precipitation_probability_max[index] ?? 0}%
                    </span>
                    <small>बारिश की संभावना</small>
                    <small>
                      बारिश: {weather.daily.precipitation_sum[index] ?? 0} mm
                    </small>
                  </article>
                );
              })}
            </div>

            <div className="weather-advice">
              <CloudRain size={22} />
              <div>
                <strong>किसानों के लिए सुझाव</strong>
                <p>
                  बुवाई, सिंचाई और छिड़काव से पहले मौसम की संभावना और खेत की
                  स्थिति जाँचें। बारिश की संभावना निश्चित बारिश की गारंटी नहीं
                  है। फसल-विशेष सलाह के लिए स्थानीय कृषि विशेषज्ञ से संपर्क
                  करें।
                </p>
              </div>
            </div>

            <div className="weather-footer">
              <span>स्रोत: Open-Meteo · पूर्वानुमान बदल सकता है</span>
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
