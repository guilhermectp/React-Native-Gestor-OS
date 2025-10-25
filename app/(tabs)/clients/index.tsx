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
              loadClients();
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
    <ThemedView
      style={styles.emptyContainer}
      lightColor="transparent"
      darkColor="transparent"
    >
      <ThemedView
        style={styles.emptyIconContainer}
        lightColor="#F3F4F6"
        darkColor="#374151"
      >
        <MaterialCommunityIcons
          name="account-outline"
          size={64}
          color="#9CA3AF"
        />
      </ThemedView>
      <ThemedText
        style={styles.emptyTitle}
        lightColor="#111827"
        darkColor="#F9FAFB"
      >
        {searchBy ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
      </ThemedText>
      <ThemedText
        style={styles.emptyText}
        lightColor="#6B7280"
        darkColor="#9CA3AF"
      >
        {searchBy
          ? "Tente ajustar sua busca"
          : "Comece cadastrando seu primeiro cliente"}
      </ThemedText>
    </ThemedView>
  );

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchBy]);

  return (
    <PageContainer>
      {/* Header com contador */}
      <ThemedView
        style={styles.header}
        lightColor="transparent"
        darkColor="transparent"
      >
        <ThemedView lightColor="transparent" darkColor="transparent">
          {/* <ThemedText type="title" lightColor="#111827" darkColor="#F9FAFB">
            Clientes
          </ThemedText> */}
          <ThemedText
            style={styles.subtitle}
            lightColor="#6B7280"
            darkColor="#9CA3AF"
          >
            {clients.length} {clients.length === 1 ? "cliente" : "clientes"}{" "}
            {searchBy ? "encontrado(s)" : "cadastrado(s)"}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Container de busca */}
      <ThemedView
        style={styles.searchContainer}
        lightColor="transparent"
        darkColor="transparent"
      >
        {/* <ThemedView
          style={styles.searchHeader}
          lightColor="transparent"
          darkColor="transparent"
        >
          <MaterialCommunityIcons name="magnify" size={24} color="#3B82F6" />
          <ThemedText
            style={styles.searchTitle}
            lightColor="#111827"
            darkColor="#F9FAFB"
          >
            Buscar Cliente
          </ThemedText>
        </ThemedView> */}

        <UIInput
          placeholder="Buscar cliente por nome..."
          onChangeText={setSearchBy}
          label=""
          icon="account-search"
          value={searchBy}
        />

        {searchBy && (
          <ThemedView
            style={styles.filterBadgeContainer}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={styles.filterBadge}
              lightColor="#EFF6FF"
              darkColor="#1E3A8A"
            >
              <MaterialCommunityIcons
                name="filter-check"
                size={16}
                color="#3B82F6"
              />
              <ThemedText style={styles.filterBadgeText}>
                Buscando por {searchBy}
              </ThemedText>
            </ThemedView>
            <Pressable
              onPress={() => setSearchBy("")}
              style={styles.clearButton}
            >
              <ThemedText style={styles.clearButtonText}>Limpar</ThemedText>
            </Pressable>
          </ThemedView>
        )}
      </ThemedView>

      {/* Lista de clientes */}
      <ThemedView
        style={styles.listWrapper}
        lightColor="transparent"
        darkColor="transparent"
      >
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
          ItemSeparatorComponent={() => (
            <ThemedView
              style={styles.separator}
              lightColor="transparent"
              darkColor="transparent"
            />
          )}
          ListEmptyComponent={!loading ? renderEmptyList : null}
          refreshing={loading}
          onRefresh={loadClients}
          scrollEnabled={false}
          nestedScrollEnabled={true}
        />
      </ThemedView>

      {/* Botão de adicionar */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.push("/clients/form")}
        disabled={loading}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
        <ThemedText style={styles.buttonText}>Novo Cliente</ThemedText>
      </Pressable>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    // marginBottom: 20,
    gap: 4,
  },
  subtitle: {
    fontSize: 15,
  },

  searchContainer: {
    gap: 16,
    // paddingVertical: 20,
    // paddingHorizontal: 20,
    // borderRadius: 16,
    // marginBottom: 16,
    // elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 16,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filterBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B82F6",
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },

  listWrapper: {
    flex: 1,
  },
  listContainer: {
    padding: 4,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  separator: {
    height: 16,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 10,
    backgroundColor: "#3B82F6",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
});
