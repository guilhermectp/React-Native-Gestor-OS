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
import { ThemedView } from "../themed-view";
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
          <ThemedView
            style={styles.modalInner}
            lightColor="#FFFFFF"
            darkColor="#1F2937"
          >
            {/* Drag Indicator */}
            <View style={styles.dragIndicatorContainer}>
              <View style={styles.dragIndicator} />
            </View>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <ThemedView
                  style={styles.iconContainer}
                  lightColor="#EFF6FF"
                  darkColor="#1E3A8A"
                >
                  <MaterialCommunityIcons
                    name="account-search"
                    size={24}
                    color="#3B82F6"
                  />
                </ThemedView>
                <ThemedText
                  style={styles.modalTitle}
                  lightColor="#111827"
                  darkColor="#F9FAFB"
                >
                  Selecionar Cliente
                </ThemedText>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#6B7280"
                />
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
                  <ThemedView
                    style={styles.clientItemContent}
                    lightColor="#F9FAFB"
                    darkColor="#374151"
                  >
                    <View style={styles.clientItemLeft}>
                      <ThemedView
                        style={styles.avatarContainer}
                        lightColor="#EFF6FF"
                        darkColor="#1E3A8A"
                      >
                        <MaterialCommunityIcons
                          name="account"
                          size={24}
                          color="#3B82F6"
                        />
                      </ThemedView>
                      <View style={styles.clientInfo}>
                        <ThemedText
                          style={styles.clientItemName}
                          numberOfLines={1}
                          lightColor="#111827"
                          darkColor="#F9FAFB"
                        >
                          {item.nome}
                        </ThemedText>
                        <ThemedText
                          style={styles.clientItemAddress}
                          numberOfLines={1}
                          lightColor="#6B7280"
                          darkColor="#9CA3AF"
                        >
                          {item.rua}, {item.numero} - {item.bairro}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.clientItemRight}>
                      <ThemedText
                        style={styles.clientItemPhone}
                        lightColor="#6B7280"
                        darkColor="#9CA3AF"
                      >
                        {item.telefone}
                      </ThemedText>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color="#9CA3AF"
                      />
                    </View>
                  </ThemedView>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.clientListContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <ThemedView
                    style={styles.emptyIconContainer}
                    lightColor="#F3F4F6"
                    darkColor="#374151"
                  >
                    <MaterialCommunityIcons
                      name="account-off-outline"
                      size={48}
                      color="#9CA3AF"
                    />
                  </ThemedView>
                  <ThemedText
                    style={styles.emptyText}
                    lightColor="#6B7280"
                    darkColor="#9CA3AF"
                  >
                    {searchClient
                      ? "Nenhum cliente encontrado"
                      : "Nenhum cliente cadastrado"}
                  </ThemedText>
                </View>
              )}
              refreshing={loading}
              onRefresh={searchClients}
            />
          </ThemedView>
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
    height: "70%",
  },
  modalInner: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 0,
  },
  dragIndicatorContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 1,
  },
  clientListContent: {
    paddingHorizontal: 20,
    paddingTop: 42,
    paddingBottom: 20,
    flexGrow: 1,
  },
  clientItem: {
    marginBottom: 8,
  },
  clientItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
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
    borderRadius: 12,
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
  },
  clientItemAddress: {
    fontSize: 13,
  },
  clientItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clientItemPhone: {
    fontSize: 14,
    fontWeight: "500",
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 16,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
  },
});
