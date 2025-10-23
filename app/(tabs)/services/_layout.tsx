import { Stack } from "expo-router";

export default function OrderServicesLayout() {
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
          headerTitle: "Ordens de Serviço",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="form"
        options={{
          headerTitle: "Nova Ordem de Serviço",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
