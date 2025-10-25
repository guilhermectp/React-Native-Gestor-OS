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
        <ThemedView
          style={styles.cardInner}
          lightColor="#FFFFFF"
          darkColor="#1F2937"
        >
          {/* Header com Avatar e Nome */}
          <ThemedView
            style={styles.headerSection}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={styles.avatar}
              lightColor="#EFF6FF"
              darkColor="#1E3A8A"
            >
              <ThemedText
                style={styles.avatarText}
                lightColor="#3B82F6"
                darkColor="#60A5FA"
              >
                {getInitials(data.nome)}
              </ThemedText>
            </ThemedView>

            <ThemedView
              style={styles.nameSection}
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedText
                style={styles.clientName}
                numberOfLines={1}
                lightColor="#111827"
                darkColor="#F9FAFB"
              >
                {data.nome}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Informações de Contato */}
          <ThemedView
            style={styles.infoSection}
            lightColor="transparent"
            darkColor="transparent"
          >
            {data.telefone && (
              <ThemedView
                style={styles.infoRow}
                lightColor="transparent"
                darkColor="transparent"
              >
                <ThemedView
                  style={styles.iconBadge}
                  lightColor="#D1FAE5"
                  darkColor="#064E3B"
                >
                  <MaterialCommunityIcons
                    name="phone"
                    size={16}
                    color="#10B981"
                  />
                </ThemedView>
                <ThemedText
                  style={styles.infoText}
                  lightColor="#6B7280"
                  darkColor="#9CA3AF"
                >
                  {formatPhone(data.telefone)}
                </ThemedText>
              </ThemedView>
            )}

            <ThemedView
              style={styles.infoRow}
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedView
                style={styles.iconBadge}
                lightColor="#FEF3C7"
                darkColor="#78350F"
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color="#F59E0B"
                />
              </ThemedView>
              <ThemedText
                style={styles.infoText}
                numberOfLines={2}
                lightColor="#6B7280"
                darkColor="#9CA3AF"
              >
                {formatAddress()}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Seção de Ações */}
          <ThemedView
            style={styles.actionsSection}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={styles.actionButtons}
              lightColor="transparent"
              darkColor="transparent"
            >
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
                    color="#3B82F6"
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
        </ThemedView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
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

  // Header Section
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
  },
  nameSection: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "700",
  },

  // Info Section
  infoSection: {
    gap: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    fontWeight: "500",
  },

  // Actions Section
  actionsSection: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
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
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  deleteButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
});
