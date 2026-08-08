import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: "center" }}>
      <Tabs.Screen name="index" options={{ title: "Lịch" }} />
      <Tabs.Screen name="events" options={{ title: "Sự kiện" }} />
      <Tabs.Screen name="family" options={{ title: "Gia phả" }} />
      <Tabs.Screen name="settings" options={{ title: "Cài đặt" }} />
    </Tabs>
  );
}
