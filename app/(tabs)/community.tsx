import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Modal,
} from "react-native";

// Define the interface for your API response
interface Recommendation {
  K: number;
  N: number;
  P: number;
  city: string;
  humidity: number;
  latitude: number;
  longitude: number;
  pH: number;
  rainfall: number;
  recommended_crops: string[];
  temperature: number;
}

export default function HomeScreen() {
  const [city, setCity] = useState<string>("");
  const [result, setResult] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isAboutVisible, setIsAboutVisible] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");

  // Function to handle button click
  const handleButtonClick = () => {
    alert(`You entered: ${inputValue}`);
  };

  const getRecommendation = async () => {
    if (!city.trim()) {
      setError("कृपया एक शहर प्रविष्ट करा");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "https://cropdocrecommandationmodel.onrender.com/recommend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ city }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: Recommendation = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* <Text style={styles.title}>FarmWise</Text> */}
        {/* <Text>Crop Recommendation App</Text> */}
        

        <Image
          source={{
            uri: "https://www.wur.nl/upload/d0f5b6ed-4251-466c-a5a7-50766409bb4b_virtuele_plant_shutterstock_747576208.jpg",
          }}
          style={styles.headerImage}
          resizeMode="cover"
        />

        <TextInput
          style={styles.input}
          placeholder="शहर प्रविष्ट करा, उदा. पुणे"
          value={city}
          onChangeText={setCity}
          onSubmitEditing={getRecommendation} // Triggers when Enter is pressed
          returnKeyType="done" // Changes the keyboard button to 'Done' (useful for mobile)
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={getRecommendation}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : "शिफारस मिळवा"}
          </Text>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#007BFF"
            style={styles.loader}
          />
        )}
        {error ? <Text style={styles.errorText}>Error: {error}</Text> : null}

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>
            {result.city}  पीक शिफारस
            </Text>
            <Text style={styles.subTitle}>शिफारस केलेली पिके:</Text>
            {result.recommended_crops.map((crop, index) => (
              <Text key={index} style={styles.cropItem}>
                - {crop}
              </Text>
            ))}

            <Text style={styles.subTitle}>तपशील:</Text>
            <Text style={styles.detail}>
            तापमान: {result.temperature}°C
            </Text>
            <Text style={styles.detail}>आर्द्रता: {result.humidity}%</Text>
            <Text style={styles.detail}>पर्जन्यमान: {result.rainfall} mm</Text>
            {/* <Text style={styles.detail}>pH: {result.pH}</Text> */}
            {/* <Text style={styles.detail}>N: {result.N}</Text> */}
            {/* <Text style={styles.detail}>P: {result.P}</Text> */}
            {/* <Text style={styles.detail}>K: {result.K}</Text> */}
            {/* <Text style={styles.detail}>Latitude: {result.latitude}</Text> */}
            {/* <Text style={styles.detail}>Longitude: {result.longitude}</Text> */}
          </View>
        )}

        {/* Button to open the About modal */}
        <TouchableOpacity
          onPress={() => setIsAboutVisible(true)}
          style={styles.aboutButton}
        >
          <Text style={styles.aboutButtonText}>बद्दल</Text>
        </TouchableOpacity>

        {/* Modal Popup for About FarmWise */}
        <Modal
          visible={isAboutVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.heading}>पीक शिफारस</Text>
                <Text style={styles.paragraph}>
               हे एक पीक शिफारस ॲप आहे जे शेतकरी आणि कृषी प्रेमींना कोणते पीक लागवड करावे याबद्दल माहितीपूर्ण निर्णय घेण्यास मदत करते.  

                शहराचे नाव प्रविष्ट केल्यावर, हे ॲप पर्यावरणीय डेटा (तापमान, आर्द्रता, पर्जन्यमान, मातीचा pH इ.) मिळवते आणि स्वनिर्मित मशीन लर्निंग मॉडेलच्या मदतीने त्या ठिकाणासाठी सर्वोत्तम पिकांची शिफारस करते.
                </Text>

                <Text style={styles.subHeading}>How It Works</Text>
                <Text style={styles.paragraph}>
                  1. तुमचे शहर प्रविष्ट करा.{"\n"}2.तुमच्या शहराच्या हवामान आणि मातीच्या (N, P, K, pH) डेटाचा अभ्यास करून योग्य पिकांची शिफारस करते.
                  {"\n"}3. निकाल परत पाठवला जातो आणि ॲपमध्ये प्रदर्शित केला जातो.
      
                </Text>

            

                <Text style={styles.subHeading}>का निवडावे 'CropDoc'</Text>
                <Text style={styles.paragraph}>
                  • <Text style={styles.bold}>डेटा-ड्रिव्हन:</Text> वास्तविक हवामान आणि मातीच्या माहितीवर आधारित.{"\n"}•{" "}
                  <Text style={styles.bold}>सोपे आणि प्रभावी:</Text> फक्त शहर प्रविष्ट करून जलद शिफारस मिळवा.{"\n"}•{" "}
                  <Text style={styles.bold}>स्वनिर्मित</Text> डेटा नियंत्रित करण्यासाठी आणि अधिक लवचिकतेसाठी खास तयार.
                </Text>

                <Text style={styles.subHeading}>अस्वीकृती</Text>
                <Text style={styles.paragraph}>
                FarmWise द्वारे दिल्या जाणाऱ्या शिफारसी मशीन लर्निंग मॉडेलवर आधारित असतात आणि त्या सर्व स्थानिक घटकांचा विचार करत नाहीत. अंतिम निर्णय घेण्यापूर्वी व्यावसायिक कृषी तज्ञांचा सल्ला घ्यावा.
                </Text>
              </ScrollView>
              <TouchableOpacity
                onPress={() => setIsAboutVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>बंद करा</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* <Image
          source={{
            uri: "https://github.com/sarthak-13N/vm-interior-images/blob/main/logo.png?raw=true",
          }}
          style={styles.footerImage}
          resizeMode="contain"
        /> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E3F2FD",
  },
  container: {
    padding: 20,
    alignItems: "center",
    top: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007BFF",
    // marginBottom: 15,
    // textTransform: "uppercase",
    letterSpacing: 1,
  },
  footerImage: {
    width: 220,
    height: 220,
    // borderRadius: 10,
    marginBottom: 40,
    marginTop: 10,
  },
  headerImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  input: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    borderColor: "#007BFF",
    borderWidth: 1.5,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  button: {
    backgroundColor: "#007BFF",
    width: "100%",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#5a9bf7",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  loader: {
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
  },
  resultContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007BFF",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
    color: "#37474F",
  },
  cropItem: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 3,
    color: "#007BFF",
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
    color: "#37474F",
  },
  aboutButton: {
    backgroundColor: "#07B51B",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  aboutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 15,
    textAlign: "center",
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#37474F",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    textAlign: "justify",
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
