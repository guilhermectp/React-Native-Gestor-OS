import { IServiceWithClient } from "@/database/useServiceOrderDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

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
        icon: "clock-outline",
      },
      em_andamento: {
        label: "Em Andamento",
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        icon: "wrench",
      },
      concluido: {
        label: "Concluído",
        color: "#10B981",
        bgColor: "#D1FAE5",
        icon: "check-circle",
      },
      cancelado: {
        label: "Cancelado",
        color: "#EF4444",
        bgColor: "#FEE2E2",
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
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.osNumberContainer}>
            <MaterialCommunityIcons
              name="file-document"
              size={20}
              color="#3B82F6"
            />
            <ThemedText style={styles.osNumber}>
              OS #{data.numero_os}
            </ThemedText>
          </View>

          <Pressable
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bgColor },
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
          </Pressable>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="account"
                size={16}
                color="#6B7280"
              />
              <ThemedText style={styles.clientName} numberOfLines={1}>
                {data.client_nome}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar"
                size={16}
                color="#9CA3AF"
              />
              <ThemedText>{formatDate(data.data_servico)}</ThemedText>
            </View>
          </View>

          {/* Resumo */}
          <View style={styles.infoContent}>
            <MaterialCommunityIcons name="tools" size={16} color="#10B981" />
            <ThemedText numberOfLines={2}>
              {truncateText(data.servicos_realizados, 80)}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  cardPressed: {
    elevation: 1,
    shadowOpacity: 0.05,
  },

  // Header
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  osNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  osNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Cliente
  clientSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  clientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    // flex: 1,
  },

  // Info Section
  infoSection: {
    gap: 8,
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    // justifyContent: "space-between",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  // Actions
  actionsSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  viewButton: {
    backgroundColor: "#3B82F6",
    flex: 1,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    width: 44,
    paddingHorizontal: 0,
  },
  shareButton: {
    backgroundColor: "#F3F4F6",
    width: 44,
    paddingHorizontal: 0,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
