import { contactWhatsapp } from "@/utils/contactWhatsapp";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { IClientDatabase } from "../database/useClientDatabase";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type Props = {
  data: IClientDatabase;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ListClientCard({ data, onEdit, onDelete }: Props) {
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return null;

    return phone;
  };

  const handleWhatsAppPress = async () => {
    contactWhatsapp({ nome: data.nome, telefone: data.telefone });
  };

  const formatAddress = () => {
    const parts = [
      data.rua,
      data.numero && `nº ${data.numero}`,
      data.bairro,
      data.complemento,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Endereço não informado";
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={[styles.card, isPressed && styles.cardPressed]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Header com Avatar e Nome */}
        <ThemedView style={styles.headerSection}>
          <ThemedView style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {getInitials(data.nome)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.nameSection}>
            <ThemedText style={styles.clientName} numberOfLines={1}>
              {data.nome}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Informações de Contato */}
        <ThemedView style={styles.infoSection}>
          {data.telefone && (
            <ThemedView style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={16} color="#10B981" />
              <ThemedText style={styles.infoText}>
                {formatPhone(data.telefone)}
              </ThemedText>
            </ThemedView>
          )}

          <ThemedView style={styles.infoRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color="#F59E0B"
            />
            <ThemedText style={styles.infoText} numberOfLines={2}>
              {formatAddress()}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Seção de Ações */}
        <ThemedView style={styles.actionsSection}>
          <ThemedView style={styles.actionButtons}>
            {/* WhatsApp Button */}
            {data.telefone && (
              <TouchableOpacity
                style={[styles.actionButton, styles.whatsappButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleWhatsAppPress();
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="whatsapp"
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            )}

            {/* Edit Button */}
            {onEdit && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={18}
                  color="#1E40AF"
                />
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="delete"
                  size={18}
                  color="#EF4444"
                />
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
    borderLeftColor: "#1E40AF",
  },
  cardPressed: {
    elevation: 1,
    shadowOpacity: 0.05,
  },

  // Header Section
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#1E40AF",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  nameSection: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },

  // Info Section
  infoSection: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
    lineHeight: 20,
  },

  // Actions Section
  actionsSection: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  editButton: {
    backgroundColor: "#EBF4FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  deleteButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
});
