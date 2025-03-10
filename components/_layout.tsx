import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Upload Image" }} />
      <Stack.Screen name="disease-details" options={{ title: "Disease Details" }} />
    </Stack>
  );
}
