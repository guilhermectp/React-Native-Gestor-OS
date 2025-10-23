import useClientDatabase, {
  IClientDatabase,
} from "@/database/useClientDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";
import UIInput from "./UIInput";

interface ClientSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectClient: (client: IClientDatabase) => void;
}

export default function UISelectClientModal({
  visible,
  onClose,
  onSelectClient,
}: ClientSelectorModalProps) {
  const clientDatabase = useClientDatabase();

  const [searchClient, setSearchClient] = useState("");
  const [clients, setClients] = useState<IClientDatabase[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar clientes
  async function searchClients() {
    try {
      setLoading(true);
      const response = await clientDatabase.searchByName(searchClient);
      setClients(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Selecionar cliente
  function selectClient(client: IClientDatabase) {
    onSelectClient(client);
    setSearchClient("");
  }

  useEffect(() => {
    if (visible) {
      searchClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchClient, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Indicator */}
          <View style={styles.dragIndicatorContainer}>
            <View style={styles.dragIndicator} />
          </View>

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons
                name="account-search"
                size={24}
                color="#3B82F6"
              />
              <ThemedText style={styles.modalTitle}>
                Selecionar Cliente
              </ThemedText>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <UIInput
              label=""
              placeholder="Buscar por nome..."
              value={searchClient}
              onChangeText={setSearchClient}
              icon="magnify"
            />
          </View>

          {/* Client List */}
          <FlatList
            data={clients}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.clientItem}
                onPress={() => selectClient(item)}
                activeOpacity={0.7}
              >
                <View style={styles.clientItemLeft}>
                  <View style={styles.avatarContainer}>
                    <MaterialCommunityIcons
                      name="account"
                      size={24}
                      color="#3B82F6"
                    />
                  </View>
                  <View style={styles.clientInfo}>
                    <ThemedText style={styles.clientItemName} numberOfLines={1}>
                      {item.nome}
                    </ThemedText>
                    <ThemedText
                      style={styles.clientItemAddress}
                      numberOfLines={1}
                    >
                      {item.rua}, {item.numero} - {item.bairro}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.clientItemRight}>
                  <ThemedText style={styles.clientItemPhone}>
                    {item.telefone}
                  </ThemedText>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#D1D5DB"
                  />
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.clientListContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="account-off-outline"
                  size={48}
                  color="#D1D5DB"
                />
                <ThemedText style={styles.emptyText}>
                  {searchClient
                    ? "Nenhum cliente encontrado"
                    : "Nenhum cliente cadastrado"}
                </ThemedText>
              </View>
            )}
            refreshing={loading}
            onRefresh={searchClients}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "60%",
    paddingBottom: 0,
  },
  dragIndicatorContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "white",
    zIndex: 1,
  },
  clientListContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 20,
    flexGrow: 1,
  },
  clientItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  clientItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  clientInfo: {
    flex: 1,
    gap: 4,
  },
  clientItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  clientItemAddress: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  clientItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clientItemPhone: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 16,
  },
});
