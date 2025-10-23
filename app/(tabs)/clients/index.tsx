import ListClientCard from "@/components/listClientCard";
import PageContainer from "@/components/page-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import UIInput from "@/components/ui/UIInput";
import useClientDatabase, {
  IClientDatabase,
} from "@/database/useClientDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet } from "react-native";

export default function ClientListPage() {
  const clientDatabase = useClientDatabase();
  const [searchBy, setSearchBy] = useState("");
  const [clients, setClients] = useState<IClientDatabase[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadClients() {
    try {
      setLoading(true);
      const response = await clientDatabase.searchByName(searchBy);
      setClients(response);
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível carregar os clientes",
        error as any
      );
    } finally {
      setLoading(false);
    }
  }

  async function removeClient(id: number) {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este cliente?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await clientDatabase.remove(id);
              loadClients(); // Recarrega a lista
              Alert.alert("Sucesso", "Cliente excluído com sucesso");
            } catch (error) {
              Alert.alert(
                "Erro",
                "Não foi possível excluir o cliente",
                error as any
              );
            }
          },
        },
      ]
    );
  }

  const renderEmptyList = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>
        {searchBy ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
      </ThemedText>
    </ThemedView>
  );

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchBy]);

  return (
    <PageContainer>
      <ThemedView style={styles.searchContainer}>
        <UIInput
          placeholder="Buscar cliente por nome..."
          onChangeText={setSearchBy}
          label=""
          icon="account-search"
          value={searchBy}
        />
      </ThemedView>

      <FlatList
        data={clients}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ListClientCard
            data={item}
            onDelete={() => removeClient(item.id)}
            onEdit={() =>
              router.push({
                pathname: "/clients/form",
                params: { clientId: String(item.id) },
              })
            }
          />
        )}
        contentContainerStyle={[
          styles.listContainer,
          clients.length === 0 && styles.emptyListContainer,
        ]}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
        ListEmptyComponent={!loading ? renderEmptyList : null}
        refreshing={loading}
        onRefresh={loadClients}
        scrollEnabled={false}
        nestedScrollEnabled={true}
      />

      <Pressable
        style={[styles.button]}
        onPress={() => router.push("/clients/form")}
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
        <ThemedText style={styles.buttonText}>Novo Cliente</ThemedText>
      </Pressable>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 16,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },

  listContainer: {
    padding: 4,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  separator: {
    height: 12,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 4,
    gap: 8,
    elevation: 1,
    backgroundColor: "#1E40AF",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
