import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Button,
  Modal,
  // Image,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { Link, router } from "expo-router";
import CameraComponent from "../../components/Camera";
import FastImage from "react-native-fast-image";
import { Image } from "expo-image";
import WebView from "react-native-webview";
import History from "../../components/History"; // Adjust the path accordingly

const API_KEY = "4d79f2da5973a1e175cfab477f714084";

const IndexScreen = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    getLocation(); // Fetch location and weather on component mount
  }, []);

  const getLocation = async () => {
    setLoading(true);

    // Request location permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow location access.");
      setLoading(false);
      return;
    }

    // Get current location
    let currentLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = currentLocation.coords;
    setLocation({ latitude, longitude });

    // Fetch weather data
    await getWeather(latitude, longitude);
    setLoading(false);
  };

  const getWeather = async (lat: number, lon: number) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();

      setWeather({
        minTemp: data.main.temp_min,
        maxTemp: data.main.temp_max,
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        visibility: data.visibility / 1000,
        cloudCover: data.clouds.all,
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
        uvIndex: data.uvi || "N/A",
        day: new Date(data.dt * 1000).toLocaleDateString("en-US", {
          weekday: "long",
        }),
        date: new Date(data.dt * 1000).toLocaleDateString("en-US"),
        time: new Date(data.dt * 1000).toLocaleTimeString(),
      });
    } catch (error) {
      Alert.alert("Error", "Failed to fetch weather data");
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.containerr}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.title}>क्रॉपडॉक</Text>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => console.log("Menu pressed")}
        >
          <Icon name="dots-horizontal" size={28} color="#404040" />
        </TouchableOpacity>
      </View> */}

      {/* Weather Section */}
      <View style={styles.container}>
        <Link href="/explore" style={styles.card}>
          {weather ? (
            <View style={styles.weatherCard}>
              <View>
                {/* Group 1: Left side - vertical stack */}
                <View style={styles.groupLeft}>
                  <Text style={styles.weatherText}>
                    {weather.city}, {weather.country}, {weather.date}
                  </Text>
                  <Text style={styles.subWeatherText}>
                    {weather.condition} • {weather.windSpeed} m/s
                  </Text>
                </View>
                {/* Group 2: Right side - horizontal row */}
                <View style={styles.groupRight}>
                  <Text style={styles.weatherTemp}>
                    {weather.temperature}°C
                  </Text>
                  <Icon name="weather-partly-cloudy" size={39} color="blue" />
                </View>
              </View>
            </View>
          ) : (
            <Text>Loading Weather...</Text>
          )}
        </Link>

        {/* Disease Detection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>पिकांना निरोगी करा</Text>
          <View style={styles.diagnosisBox}>
            <View style={styles.diagnosisSteps}>
              <Icon name="camera" size={24} color="black" />
              <Text style={styles.diagnosisText}>छायाचित्र घ्या</Text>
            </View>
            <View style={styles.diagnosisSteps}>
              <Icon name="clipboard-check-outline" size={24} color="black" />
              <Text style={styles.diagnosisText}>निदान पहा</Text>
            </View>
            <View style={styles.diagnosisSteps}>
              <Icon name="bottle-tonic" size={24} color="black" />
              <Text style={styles.diagnosisText}>पीक औषध मिळवा</Text>
            </View>
          </View>

          {/* <View style={styles.container}> */}
          {/* Button to Open Camera */}
          <TouchableOpacity
            style={styles.customButton}
            onPress={() => setShowCamera(true)}
          >
            <Text style={styles.customButtonText}>छायाचित्र घ्या</Text>
          </TouchableOpacity>

          {/* Camera Modal */}
          <Modal visible={showCamera} animationType="slide">
            <CameraComponent onClose={() => setShowCamera(false)} />
          </Modal>
          {/* </View> */}
        </View>
        <Image
          source={{
            uri: "https://devtechnosys.ae/blog/wp-content/uploads/2023/02/ai-gif.gif",
          }}
          style={{ width: 330, height: 230, borderRadius: 10 }}
        />

        {/* <FastImage
  source={{
    uri: "https://devtechnosys.ae/blog/wp-content/uploads/2023/02/ai-gif.gif",
    priority: FastImage.priority.high,
  }}
  style={{ width: 330, height: 230, borderRadius: 10 }}
  resizeMode={FastImage.resizeMode.contain}
/> */}

        {/* Community Forum Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 शेतकरी चर्चा मंच</Text>
          <Text style={styles.description}>
            शेतकरी आपले अनुभव आणि माहिती शेअर करू शकतात.
          </Text>
          <TouchableOpacity
            style={styles.customButton}
            // onPress={() => console.log("Navigate to forum")}
            onPress={() => router.push("/community")}
          >
            <Text style={styles.customButtonText}>चर्चा सुरू करा</Text>
          </TouchableOpacity>
        </View>

        {/* Disease History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📜 पूर्वीचे निदान</Text>
          <Text style={styles.description}>
            आपण आधी तपासलेल्या पिकांच्या समस्या आणि उपाय येथे पाहू शकता.
          </Text>
          {/* <TouchableOpacity
            style={styles.customButton}
            onPress={() => console.log("gugiydd")}
          >
            <Text style={styles.customButtonText}>निदान इतिहास पहा</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.customButton}
            onPress={() => setShowHistory(true)}
          >
            <Text style={styles.customButtonText}>निदान इतिहास पहा</Text>
          </TouchableOpacity>

          {/* Camera Modal */}
          <Modal visible={showHistory} animationType="slide">
            <History onClose={() => setShowHistory(false)} />
          </Modal>
        </View>

        {/* About Us Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌱 आमच्याबद्दल</Text>
          <Text style={styles.description}>
            "क्रॉपडॉक" हा शेतकऱ्यांसाठी विकसित केलेला AI आधारित अ‍ॅप आहे, जे
            पिकांच्या रोगाचे निदान आणि त्यावर योग्य उपचार सुचवते. Innoteqs
            द्वारे निर्मित, हा प्लॅटफॉर्म शेतकऱ्यांसाठी सोपे, वेगवान आणि प्रभावी
            समाधान प्रदान करतो.
          </Text>
          <Text style={styles.subDescription}>
            🌾 लक्ष्य: शेतकऱ्यांना स्मार्ट शेतीत मदत करणे. 🚀 फीचर्स: AI-आधारित
            निदान, हवामान अंदाज, औषध सल्ला, आणि बरेच काही!
          </Text>
        </View>

        {/* Image */}
        {/* <Image
          source={{
            uri: "https://thehouseofterra.com/wp-content/uploads/2021/03/4-min-1080x675.jpg",
          }}
          style={{ width: 330, height: 230, borderRadius: 10 }}
        /> */}

        <View
          style={{
            width: "100%",
            height: 186,
            marginBottom: 20,
            borderRadius: 10,
          }}
        >
          <WebView
            source={{
              uri: "https://www.youtube.com/embed/Qfozqrom7Bk?si=lHO5Dc8h1JBEXCuq",
            }} // Replace with your video URL
            style={{ width: "100%", height: "100%", borderRadius: 10 }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Layout Styles
  description: {
    fontSize: 20,
    fontWeight: "400",
    color: "#2c2c2c",
    lineHeight: 24,
    marginBottom: 12,
    paddingHorizontal: 10,
    textAlign: "justify",
  },
  subDescription: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#555555",
    lineHeight: 24,
    marginBottom: 12,
    paddingHorizontal: 10,
    textAlign: "justify",
  },

  containerr: {
    flex: 1,
    backgroundColor: "#51FEB5",
    paddingHorizontal: 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 15,
    // marginTop: -5,
  },
  section: {
    marginVertical: 15,
  },

  // Header Styles
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: Platform.select({ ios: 0, android: 0 }),
    backgroundColor: "#ffff",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  customButton: {
    backgroundColor: "#1E88E5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  customButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2c2c2c",
    fontFamily: "Helvetica Neue",
    letterSpacing: 0.5,
    paddingVertical: 10,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#ffff",
  },

  // Card & Weather Styles
  card: {
    marginTop: 10,
  },
  weatherCard: {
    width: "100%",
    maxWidth: 500,
    padding: 20,
    margin: 15,
    backgroundColor: "#D6FE96",
    borderRadius: 15,
    shadowColor: "#FE9900",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#FE9900",
    overflow: "hidden",
  },
  groupLeft: {
    flexDirection: "column",
    justifyContent: "center",
  },
  groupRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EA9008",
    marginBottom: 5,
  },
  subWeatherText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
  },
  weatherTemp: {
    fontSize: 35,
    fontWeight: "700",
    color: "#0594CC",
    marginRight: 15,
  },
  diagnosisText: {
    fontSize: 14,
    marginTop: 5,
  },
  diagnosisBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 30,
    backgroundColor: "#EA6831",
    borderRadius: 10,
  },
  diagnosisSteps: {
    alignItems: "center",
    flex: 1,
  },

  // Modal / Camera Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 28,
  },
});

export default IndexScreen;
