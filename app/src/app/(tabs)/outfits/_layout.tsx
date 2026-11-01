import { Stack } from 'expo-router/stack';

export default function OutfitsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="generate" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
