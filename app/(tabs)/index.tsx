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
  TextInput,
  ImageBackground,
  ActivityIndicator,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import ModalPopup from "react-native-modal";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: number;
  name: string; // Added name property
  exp: number;
}
const API_URL = "https://cropdocback.onrender.com"; // Your backend URL

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

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [userName, setUserName] = useState(""); // New state for user's name

  // Optionally, you could check AsyncStorage for an existing token here.

  // Handle Registration
  const handleRegister = async () => {
    if (!name || !phone || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Registered successfully!");
        // Optionally, switch to login mode after registration
        setIsLoginMode(true);
      } else {
        Alert.alert("Registration Error", data.error || "Unknown error");
      }
    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    }
  };

  // Handle Login
  const handleLogin = async () => {
    // Trim input to avoid accidental spaces
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedPhone || !trimmedPassword) {
      Alert.alert("Error", "Phone and password are required");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: trimmedPhone,
          password: trimmedPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed. Please try again.");
      }

      const data = await response.json();
      Alert.alert("Success", "Logged in successfully!");

      // const data = await response.json();

      // Store token securely
      await AsyncStorage.setItem("token", data.token);
      setToken(data.token);

      // if (response.ok) {
      //   Alert.alert("Success", "Logged in successfully!");
      //   setToken(data.token);

      //   await AsyncStorage.setItem("token", data.token);
      // }

      try {
        const decoded = jwtDecode<DecodedToken>(data.token);
        setUserId(decoded.id);
        setUserName(decoded.name);
        // setPhone(decoded.phone);
        setIsLoggedIn(true);

        // await AsyncStorage.setItem("Phone", decoded.phone.toString());
        // Store userId in AsyncStorage (Optional)
        await AsyncStorage.setItem("userId", decoded.id.toString());
      } catch (decodeError) {
        console.error("JWT Decode Error:", decodeError);
        Alert.alert("Error", "Failed to process login data.");
        return;
      }
      // Decode JWT Token to get user info
      // const decoded = jwtDecode<DecodedToken>(data.token);
      // setUserId(decoded.id);
      // setUserName(decoded.name);
      // setIsLoggedIn(true);
      // Close the modal after successful login
      // setModalVisible(false);
      //  else {
      // Alert.alert("Login Error", data.error || "Unknown error");
      // }
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
      console.error("Login Error:", error);
    }
  };

  // Optional: close modal if user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      setModalVisible(false);
    } else {
      setModalVisible(true);
    }
  }, [isLoggedIn]);

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
  const handleAuth = async () => {
    setLoading(true); // Show loader
    try {
      if (isLoginMode) {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setLoading(false); // Hide loader after process
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
        <Text style={styles.title}>क्रॉपडॉकमध्ये आपले स्वागत आहे!</Text>
        {isLoggedIn ? (
          <Text style={styles.welcomeText}>{userName}</Text>
        ) : (
          <Text style={styles.infoText}>
            Please login or register to continue.
          </Text>
        )}
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
          <Text style={styles.sectionTitle}>👥 पीक शिफारस मंच</Text>
          <Text style={styles.description}>
            शेतकऱ्यांना त्यांच्या जमिनीच्या प्रकारानुसार, मातीच्या
            गुणवत्तेनुसार, हवामानाच्या परिस्थितीनुसार आणि इतर घटकांवर आधारित
            योग्य पीक निवडण्यास मदत करेल.
          </Text>
          <TouchableOpacity
            style={styles.customButton}
            // onPress={() => console.log("Navigate to forum")}
            onPress={() => router.push("/community")}
          >
            <Text style={styles.customButtonText}>पीक शिफारस</Text>
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

        {/* <Text style={styles.title}>क्रॉपडॉकमध्ये आपले स्वागत आहे!</Text>
        {isLoggedIn ? (
          <Text style={styles.welcomeText}>{userName}</Text>
        ) : (
          <Text style={styles.infoText}>
            Please login or register to continue.
          </Text>
        )} */}

        {/* The modal automatically shows if not logged in */}
      </View>
      <ModalPopup
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
      >
        <ImageBackground
          source={{
            uri: "https://c4.wallpaperflare.com/wallpaper/141/564/859/aerial-photo-of-trees-near-body-of-water-under-gray-clouds-lake-wanaka-lake-wanaka-wallpaper-preview.jpg",
          }}
          style={{
            flex: 0,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <View
            style={{
              width: "90%",
              padding: 20,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderRadius: 10,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#fff",
                marginBottom: 15,
              }}
            >
              {isLoginMode ? "Login" : "Register"}
            </Text>

            {!isLoginMode && (
              <TextInput
                placeholder="Enter Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#ccc"
                style={{
                  width: "100%",
                  padding: 12,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 5,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                }}
              />
            )}

            <TextInput
              placeholder="Enter Phone"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#ccc"
              keyboardType="phone-pad"
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#fff",
              }}
            />

            <TextInput
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#ccc"
              secureTextEntry
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#fff",
              }}
            />

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#28a745"
                style={{ marginVertical: 10 }}
              />
            ) : (
              <>
                <View style={{ width: "100%", marginTop: 10 }}>
                  <Button
                    title={isLoginMode ? "Login" : "Register"}
                    onPress={handleAuth}
                    color="#28a745"
                  />
                </View>

                <View style={{ width: "100%", marginTop: 10 }}>
                  <Button
                    title={
                      isLoginMode ? "Switch to Register" : "Switch to Login"
                    }
                    onPress={() => setIsLoginMode(!isLoginMode)}
                    color="#007bff"
                  />
                </View>
              </>
            )}
          </View>
        </ImageBackground>
      </ModalPopup>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Layout Styles
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  welcomeText: { fontSize: 18, color: "green" },
  modal: { backgroundColor: "white", padding: 20, borderRadius: 10 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
    width: 200,
    borderRadius: 5,
  },

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
