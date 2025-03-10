import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";

const API_KEY = "4d79f2da5973a1e175cfab477f714084";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
}

interface ForecastData {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind_speed: number;
  humidity: number;
  pressure: number;
}

export default function Weather() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [city, setCity] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission denied");
      setLoading(false);
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
    fetchWeatherByCoords(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude
    );
    fetchForecast(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude
    );
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      const response = await axios.get<WeatherData>(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
      setLoading(false);
    } catch (error) {
      setErrorMsg("Failed to fetch weather data");
      setLoading(false);
    }
  };

  const fetchForecast = async (lat: number, lon: number) => {
    try {
      const response = await axios.get<{ list: ForecastData[] }>(
        `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=15&appid=${API_KEY}&units=metric`
      );
      setForecast(response.data.list);
    } catch (error) {
      setErrorMsg("Failed to fetch forecast data");
    }
  };

  const fetchWeatherByCity = async () => {
    if (!city.trim()) return;
    setLoading(true);
    try {
      const response = await axios.get<WeatherData>(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
      setLoading(false);
      fetchForecastByCity(city);
    } catch (error) {
      setErrorMsg("City not found");
      setLoading(false);
    }
  };

  const fetchForecastByCity = async (cityName: string) => {
    try {
      const response = await axios.get<{ list: ForecastData[] }>(
        `https://api.openweathermap.org/data/2.5/forecast/daily?q=${cityName}&cnt=15&appid=${API_KEY}&units=metric`
      );
      setForecast(response.data.list);
    } catch (error) {
      setErrorMsg("Failed to fetch forecast data");
    }
  };

  const getCurrentDateTime = (): string => {
    return new Date().toLocaleString();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌦️ हवामान </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter City Name"
        value={city}
        onChangeText={(text) => setCity(text)}
      />
      <Button title="हवामान शोधा" onPress={fetchWeatherByCity} />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {weather && (
        <View style={styles.weatherContainer}>
          <Text style={styles.cityName}>{weather.name}</Text>
          <Text style={styles.dateTime}>{getCurrentDateTime()}</Text>
          <Image
            source={{
              uri: `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`,
            }}
            style={styles.weatherIcon}
          />
          <Text style={styles.temperature}>{weather.main.temp}°C</Text>
          <Text style={styles.weatherDescription}>
            {weather.weather[0].description}
          </Text>
          <Text>💨 वाऱ्याचा वेग: {weather.wind.speed} मी/से</Text>
          <Text>🌡️ आर्द्रता: {weather.main.humidity}%</Text>
          <Text>🔻 हवेचा दाब: {weather.main.pressure} hPa</Text>
        </View>
      )}

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      <Button title="माझ्या ठिकाणाचे हवामान मिळवा" onPress={getLocation} />

      {forecast.length > 0 && (
        <View style={styles.forecastContainer}>
          <Text style={styles.forecastTitle}>📅 १५ दिवसांचा हवामान अंदाज</Text>
          <ScrollView horizontal contentContainerStyle={styles.forecastScroll}>
            {forecast.map((day, index) => (
              <View key={index} style={styles.forecastCard}>
                <Text>
                  {new Date(day.dt * 1000).toDateString().slice(0, 10)}
                </Text>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/w/${day.weather[0].icon}.png`,
                  }}
                  style={styles.weatherIcon}
                />
                <Text>
                  {day.temp.min}°C - {day.temp.max}°C
                </Text>
                <Text>{day.weather[0].description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#e3f2fd", top: 0 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0d47a1",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#64b5f6",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    marginBottom: 10,
  },
  weatherContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#bbdefb",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 5,
    marginVertical: 10,
  },
  cityName: { fontSize: 30, fontWeight: "bold", color: "#0d47a1" },
  dateTime: { fontSize: 16, color: "#37474f", marginBottom: 10 },
  temperature: { fontSize: 50, fontWeight: "bold", color: "#e53935" },
  weatherIcon: { width: 100, height: 100, marginVertical: 10 },
  weatherDescription: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1e88e5",
    textTransform: "capitalize",
  },
  forecastContainer: {
    marginTop: 20,
    width: "100%",
    marginBottom: 50,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  forecastScroll: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  forecastCard: {
    width: 100,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  error: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
});
