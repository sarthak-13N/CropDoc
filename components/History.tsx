import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Button,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

interface HistoryItem {
  history_id: number;
  treatment_class: string;
  user_id: number;
  created_at: string;
  treatment_id: number;
  disease: string;
  symptoms: string;
  chemical_treatment: string;
  organic_treatment?: string | null;
  disease_image?: string;
}

interface Props {
  onClose: () => void;
}

const HistoryScreen: React.FC<Props> = ({ onClose }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserHistory();
  }, []);

  const fetchUserHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("Authentication error. Please log in again.");
      }

      const response = await axios.get<HistoryItem[]>(
        `https://cropdocback.onrender.com/history/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Failed to load history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Close" onPress={onClose} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.title}>पूर्वीचे निदान</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={history}
        // keyExtractor={(item, index) => `${item.history_id || index}`}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>{item.treatment_class}</Text>
              <Text style={styles.subtitle}>Disease: {item.disease}</Text>
              <Text style={styles.symptoms}>Symptoms: {item.symptoms}</Text>
              <Text style={styles.treatment}>
                Chemical Treatment: {item.chemical_treatment}
              </Text>
              {item.organic_treatment && (
                <Text style={styles.treatment}>
                  Organic Treatment: {item.organic_treatment}
                </Text>
              )}
              {item.disease_image && (
                <Image
                  source={{ uri: item.disease_image }}
                  style={styles.image}
                />
              )}
              <Text style={styles.date}>
                Date: {new Date(item.created_at).toDateString()}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
  },
  container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", fontWeight: "bold" },
  card: { marginBottom: 10, padding: 10, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", color: "#00796B" },
  subtitle: { fontSize: 16, fontWeight: "600", marginTop: 5 },
  symptoms: { fontSize: 14, color: "#555", marginTop: 5 },
  treatment: { fontSize: 14, marginTop: 5, fontStyle: "italic" },
  image: { width: "100%", height: 150, marginTop: 10, borderRadius: 5 },
  date: { fontSize: 12, marginTop: 5, color: "#888" },
});

export default HistoryScreen;
