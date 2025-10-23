import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  scrollable?: boolean;
}>;

export default function PageContainer({ children, scrollable = true }: Props) {
  const backgroundColor = useThemeColor({}, "background");

  if (scrollable) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <ScrollView
          style={[styles.container, { backgroundColor }]}
          contentContainerStyle={styles.contentContainer}
        >
          <ThemedView style={styles.content}>{children}</ThemedView>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <ThemedView style={[styles.container, styles.content]}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
  },
});
