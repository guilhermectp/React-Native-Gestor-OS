import { IServiceWithClient } from "@/database/useServiceOrderDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type ServiceOrderStatus =
  | "pendente"
  | "em_andamento"
  | "concluido"
  | "cancelado";

type Props = {
  data: IServiceWithClient;
  onOpen: () => void;
  onStatusChange?: (newStatus: ServiceOrderStatus) => void;
  onShare?: () => void;
};

export default function ListServiceCard({ data, onOpen }: Props) {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const formatDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getStatusConfig = (status: ServiceOrderStatus) => {
    const configs = {
      pendente: {
        label: "Pendente",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        bgColorDark: "#78350F",
        icon: "clock-outline",
      },
      em_andamento: {
        label: "Em Andamento",
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        bgColorDark: "#1E3A8A",
        icon: "wrench",
      },
      concluido: {
        label: "Concluído",
        color: "#10B981",
        bgColor: "#D1FAE5",
        bgColorDark: "#064E3B",
        icon: "check-circle",
      },
      cancelado: {
        label: "Cancelado",
        color: "#EF4444",
        bgColor: "#FEE2E2",
        bgColorDark: "#7F1D1D",
        icon: "close-circle",
      },
    };
    return configs[status] || configs.pendente;
  };

  const statusConfig = getStatusConfig(data.status as any);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <Pressable
        style={[styles.card, isPressed && styles.cardPressed]}
        onPress={onOpen}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <ThemedView
          style={styles.cardInner}
          lightColor="#FFFFFF"
          darkColor="#1F2937"
        >
          {/* Header */}
          <ThemedView
            style={styles.headerSection}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={styles.osNumberContainer}
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedView
                style={styles.osIconBadge}
                lightColor="#EFF6FF"
                darkColor="#1E3A8A"
              >
                <MaterialCommunityIcons
                  name="file-document"
                  size={20}
                  color="#3B82F6"
                />
              </ThemedView>
              <ThemedText
                style={styles.osNumber}
                lightColor="#111827"
                darkColor="#F9FAFB"
              >
                OS #{data.numero_os}
              </ThemedText>
            </ThemedView>

            <ThemedView
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isDark
                    ? statusConfig.bgColorDark
                    : statusConfig.bgColor,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={statusConfig.icon as any}
                size={14}
                color={statusConfig.color}
              />
              <ThemedText
                style={[styles.statusText, { color: statusConfig.color }]}
              >
                {statusConfig.label}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Info */}
          <ThemedView
            style={styles.infoSection}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={styles.infoRow}
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedView
                style={styles.infoItem}
                lightColor="transparent"
                darkColor="transparent"
              >
                <ThemedView
                  style={styles.infoIconBadge}
                  lightColor="#EFF6FF"
                  darkColor="#1E3A8A"
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={16}
                    color="#3B82F6"
                  />
                </ThemedView>
                <ThemedText
                  style={styles.clientName}
                  numberOfLines={1}
                  lightColor="#1F2937"
                  darkColor="#F9FAFB"
                >
                  {data.client_nome}
                </ThemedText>
              </ThemedView>

              <ThemedView
                style={styles.infoItem}
                lightColor="transparent"
                darkColor="transparent"
              >
                <ThemedView
                  style={styles.infoIconBadge}
                  lightColor="#F3F4F6"
                  darkColor="#374151"
                >
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color="#9CA3AF"
                  />
                </ThemedView>
                <ThemedText
                  style={styles.dateText}
                  lightColor="#6B7280"
                  darkColor="#9CA3AF"
                >
                  {formatDate(data.data_servico)}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Resumo */}
            <ThemedView
              style={styles.infoContent}
              lightColor="#F9FAFB"
              darkColor="#374151"
            >
              <ThemedView
                style={styles.serviceIconBadge}
                lightColor="#D1FAE5"
                darkColor="#064E3B"
              >
                <MaterialCommunityIcons
                  name="tools"
                  size={16}
                  color="#10B981"
                />
              </ThemedView>
              <ThemedText
                numberOfLines={2}
                style={styles.serviceText}
                lightColor="#374151"
                darkColor="#D1D5DB"
              >
                {truncateText(data.servicos_realizados, 80)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardPressed: {
    elevation: 1,
    shadowOpacity: 0.05,
  },
  cardInner: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },

  // Header
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  osNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  osIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  osNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Info Section
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  infoIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  clientName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
  },
  serviceIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
