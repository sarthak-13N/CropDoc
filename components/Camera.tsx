import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import {
  Button,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as FileSystem from "expo-file-system";

type CameraComponentProps = {
  onClose: () => void;
};

export default function CameraScreen({ onClose }: CameraComponentProps) {
  const [facing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  // const navigation = useNavigation(); // For navigating back to Home

  // State for treatment result and modal visibility
  const [treatmentResult, setTreatmentResult] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const apiUrl = "http://172.17.106.116:7000/predict";

  const identificationApiUrl = "http://172.17.106.116:5000/identify";

  async function uploadImage(imageUri: string) {
    setLoading(true); // Start loading before the request
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      console.error("File does not exist:", imageUri);
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "image.jpg",
      type: "image/jpeg",
    } as any); // <-- TypeScript workaround

    try {
      // Step 1: Call the Identification API
      const response = await fetch(identificationApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const idPrediction = await response.text();
      console.log("Upload success, prediction:", idPrediction);

      // If the image is identified as a crop/plant, proceed to disease prediction
      if (idPrediction.includes("Crop Plant") || idPrediction.includes("✅")) {
        // Step 2: Call the Disease Prediction API

        const diseaseResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });
        const diseasePrediction = await diseaseResponse.text();
        console.log("Disease prediction:", diseasePrediction);

        // ✅ Ensure `result.prediction` exists before making second API call
        // if (prediction.trim()) {
        // Construct dynamic API URL with the prediction
        const treatmentApiUrl = `http://172.17.106.148:3000/treatment/${encodeURIComponent(
          diseasePrediction
        )}`;

        // Call Treatment API
        const treatmentResponse = await fetch(treatmentApiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const treatmentData = await treatmentResponse.text();
        console.log(`Treatment data for ${diseasePrediction}:`, treatmentData);

        // Parse the JSON treatment data and store it in state
        try {
          const parsedData = JSON.parse(treatmentData);
          setTreatmentResult(parsedData);
          setModalVisible(true);
        } catch (error) {
          console.error("Error parsing treatment data:", error);
        }
      } else {
        // If the image is not a crop/plant, skip disease and treatment steps
        console.error(
          "The uploaded image is not a crop/plant. Skipping disease prediction and treatment."
        );
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false); // Stop loading when request is completed
    }
  }

  async function handleTakePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log("Captured Image:", photo.uri);
        await uploadImage(photo.uri); // Send to the server
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function saveImage(uri: string) {
    const fileName = uri.split("/").pop(); // Extract filename
    const newPath = `${FileSystem.documentDirectory}${fileName}`;

    try {
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
      console.log("Image saved to:", newPath);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        {/* Close Button in the Upper Right */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✖</Text>
        </TouchableOpacity>

        {/* Controls at the Bottom */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleTakePicture}
          >
            <Icon name="camera" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Loading Modal */}
      <Modal transparent={true} visible={loading} animationType="fade">
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#23AF01" />
            <Text style={styles.loadingText}>प्रक्रिया चालू आहे...</Text>
          </View>
        </View>
      </Modal>

      {/* Modal Popup for Treatment Data */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>पिकाचे रोग आणि उपचार</Text>
              {treatmentResult.map((item, index) => (
                <View key={index} style={styles.treatmentItem}>
                  {/* <Text>ID: {item.id}</Text> */}
                  {/* <Text>Class: {item.class}</Text> */}
                  <Text>
                    <Text style={styles.labelText}>रोग: </Text>
                    <Text style={styles.dynamicText}>{item.disease}</Text>
                  </Text>

                  <Text>
                    <Text style={styles.labelText}>लक्षणे: </Text>
                    <Text style={styles.dynamicText}>{item.symptoms}</Text>
                  </Text>

                  <Text>
                    <Text style={styles.labelText}>सेंद्रिय उपचार: </Text>
                    <Text style={styles.dynamicText}>
                      {item.organic_treatment}
                    </Text>
                  </Text>

                  <Text>
                    <Text style={styles.labelText}>रासायनिक उपचार: </Text>
                    <Text style={styles.dynamicText}>
                      {item.chemical_treatment}
                    </Text>
                  </Text>

                  {item.disease_image ? (
                    <Image
                      source={{ uri: item.disease_image }}
                      style={styles.diseaseImage}
                    />
                  ) : null}
                </View>
              ))}
            </ScrollView>
            {/* <Button title="Close" onPress={() => setModalVisible(false)} /> */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                backgroundColor: "#23AF01",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 20, // 20 pixels from the top
    right: 20, // 20 pixels from the right
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 40, // fixed width
    height: 40, // fixed height
    borderRadius: 20, // half of width/height makes it circular
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1, // ensure it appears on top of the camera view
  },
  closeButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  controls: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: "green",
    width: 70, // fixed width for a circular button
    height: 70, // fixed height for a circular button
    borderRadius: 35, // half of width/height for a circle
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)", // Darker overlay for better visibility
    justifyContent: "center",
    alignItems: "center",
    width: "100%", // Ensures full width
    height: "100%", // Ensures full height
    position: "absolute", // Make sure it overlays the entire screen
    top: 0,
    left: 0,
  },
  modalContent: {
    width: "100%",
    maxHeight: "100%",
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  treatmentItem: {
    backgroundColor: "#F5F5F5",
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    borderLeftWidth: 0,
    borderLeftColor: "#2E7D32", // Green accent for better UI
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B5E20", // Dark green for labels
  },
  dynamicText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333", // Dark gray for fetched API text
  },
  diseaseImage: {
    width: 310,
    height: 200,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
