import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          // title: "My Task App",
          // headerTitleAlign: "center",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
