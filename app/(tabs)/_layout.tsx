import { router, Tabs } from "expo-router";
import React, { useState } from "react";
import { Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Menu, Provider } from "react-native-paper";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  return (
    <Provider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          headerTitleStyle: {
            fontWeight: "bold", // Makes the text bold
            fontSize: 20, // Adjust size if needed
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
              visible={visible}
              onDismiss={() => setVisible(false)}
              contentStyle={{ marginTop: 80 }} // This moves the menu items downward
              anchor={
                <TouchableOpacity
                  onPress={() => setVisible(true)}
                  style={{ marginRight: 15}}
                >
                  <MaterialIcons name="more-vert" size={24} color="black" />
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  console.log("Profile clicked");
                  setVisible(false);
                }}
                title="Profile"
              />
              <Menu.Item
                onPress={() => {
                  console.log("Settings clicked");
                  setVisible(false);
                }}
                title="Settings"
              />
              <Menu.Item
                onPress={() => {
                  console.log("Logout clicked");
                  setVisible(false);
                }}
                title="Logout"
              />
            </Menu>
          ),

          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
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
            title: "शेतकरी समुदाय",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="people-group" size={26} color={color} />
            ),
          }}
        />
      </Tabs>
    </Provider>
  );
}
