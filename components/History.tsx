import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type HistoryProps = {
  onClose: () => void;
};

interface HistoryItem {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
}

const historyData: HistoryItem[] = [
  { id: "1", date: "2025-03-01", diagnosis: "रोग A", treatment: "उपचार X" },
  { id: "2", date: "2025-03-02", diagnosis: "रोग B", treatment: "उपचार Y" },
  { id: "3", date: "2025-03-03", diagnosis: "रोग C", treatment: "उपचार Z" },
];

export default function HistoryScreen({ onClose }: HistoryProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.title}>पूर्वीचे निदान</Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemDate}>{item.date}</Text>
            <Text style={styles.itemDiagnosis}>निदान: {item.diagnosis}</Text>
            <Text style={styles.itemTreatment}>उपचार: {item.treatment}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#2C2C2C",
  },
  itemContainer: {
    padding: 15,
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  itemDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  itemDiagnosis: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 5,
  },
  itemTreatment: {
    fontSize: 14,
    color: "#666",
  },
});
