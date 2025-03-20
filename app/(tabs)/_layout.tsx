import { router, Tabs } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Platform,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialIcons } from "@expo/vector-icons";
import { Menu, Provider, Modal, Button, Portal } from "react-native-paper";
import MaterialIcon from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // For Profile Popup
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // When modal opens, fetch user details from AsyncStorage
  useEffect(() => {
    if (modalVisible) {
      const fetchUserDetails = async () => {
        try {
          const storedUserId = await AsyncStorage.getItem("userId");
          const storedUserName = await AsyncStorage.getItem("userName");
          setUserId(storedUserId);
          setUserName(storedUserName);
          setPhone(phone);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };
      fetchUserDetails();
    }
  }, [modalVisible]);

  const handleLogout = async () => {
    try {
      // Remove stored token and userId
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");

      // Reset state variables
      setToken("");
      setUserId(null);
      setIsLoggedIn(false);

      // Optionally, navigate to a public screen or show a message
      Alert.alert("Success", "Logged out successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
      console.error("Logout Error:", error);
    }
  };

  return (
    <Provider>
      {/* Profile Popup Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Profile Details</Text>
            <Ionicons
              name="person-circle"
              size={80}
              color="black"
              style={styles.avatar}
            />
            <Text style={styles.modalLabel}>User ID:</Text>
            <Text style={styles.modalInfo}>{userId || "N/A"}</Text>
            {/* <Text style={styles.modalLabel}>User Name:</Text> */}
            {/* <Text style={styles.modalInfo}>{phone || "N/A"}</Text> */}
            <Button
              mode="contained"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Close
            </Button>
          </View>
        </Modal>
      </Portal>

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/")}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              contentStyle={{ marginTop: 40, width: 150 }}
              anchor={
                <TouchableOpacity
                  onPress={() => {
                    setMenuVisible(true);
                    console.log("Menu opened");
                  }}
                  style={{ marginRight: 15 }}
                >
                  <MaterialIcons name="more-vert" size={24} color="black" />
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  console.log("Profile clicked");
                  setMenuVisible(false);
                  setModalVisible(true); // Open Profile Modal
                }}
                title="Profile"
              />
              <Menu.Item
                onPress={() => {
                  console.log("Settings clicked");
                  setMenuVisible(false);
                }}
                title="Settings"
              />
              <Menu.Item
                onPress={async () => {
                  console.log("Logout clicked");
                  handleLogout(); // Call the logout function
                  setMenuVisible(false);

                  // Refresh the app
                  try {
                    await Updates.reloadAsync();
                  } catch (e) {
                    console.error("Error refreshing app:", e);
                  }
                }}
                title="Logout"
              />
            </Menu>
          ),
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "क्रॉपडॉक",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "हवामान",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="cloud-sun-rain" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="app"
          options={{
            title: "मदत",
            tabBarIcon: ({ color }) => (
              <Ionicons name="chatbox-ellipses" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: "पीक शिफारस",
            tabBarIcon: ({ color }) => (
              <MaterialIcon name="recommend" size={26} color={color} />
            ),
          }}
        />
      </Tabs>
    </Provider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  avatar: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  modalInfo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 20,
  },
});
