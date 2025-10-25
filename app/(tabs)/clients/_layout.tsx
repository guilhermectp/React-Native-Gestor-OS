import { Stack } from "expo-router";

export default function OrderClientsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#3B82F6",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Clientes",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="form"
        options={{
          headerTitle: "Novo Cliente",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
