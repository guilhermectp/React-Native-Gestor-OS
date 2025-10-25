import ListServiceCard from "@/components/listServiceCard";
import PageContainer from "@/components/page-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import UIInput from "@/components/ui/UIInput";
import UISelect from "@/components/ui/UISelect";
import useServiceOrderDatabase, {
  IServiceWithClient,
} from "@/database/useServiceOrderDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet } from "react-native";

export default function ServiceListPage() {
  const serviceDatabase = useServiceOrderDatabase();
  const router = useRouter();

  const [searchBy, setSearchBy] = useState("");
  const [statusBy, setStatusBy] = useState("");
  const [loading, setLoading] = useState(true);

  const [services, setServices] = useState<IServiceWithClient[]>([]);

  const statusOptions = [
    { label: "Todos", value: "" },
    { label: "Pendente", value: "pendente" },
    { label: "Em Andamento", value: "em_andamento" },
    { label: "Concluído", value: "concluido" },
    { label: "Cancelado", value: "cancelado" },
  ];

  const filteredServices = () => {
    let filtered = services;

    if (searchBy) {
      filtered = filtered.filter((service) =>
        service.client_nome.toLowerCase().includes(searchBy.toLowerCase())
      );
    }

    if (statusBy) {
      filtered = filtered.filter((service) => service.status === statusBy);
    }

    return filtered;
  };

  async function loadServices() {
    try {
      setLoading(true);
      const response = await serviceDatabase.getAll();
      setServices(response);
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível carregar as ordens de serviço",
        error as any
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: number, newStatus: string) {
    try {
      await serviceDatabase.updateStatus({ id, status: newStatus });
      loadServices();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o status", error as any);
    }
  }

  async function handleShare(serviceId: number) {
    // Implementar a lógica de geração e compartilhamento de PDF
    Alert.alert(
      "Compartilhar OS",
      "Funcionalidade de geração de PDF em desenvolvimento"
    );
  }

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchBy]);

  useFocusEffect(
    useCallback(() => {
      loadServices();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

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
          name="file-document-outline"
          size={64}
          color="#9CA3AF"
        />
      </ThemedView>
      <ThemedText
        style={styles.emptyTitle}
        lightColor="#111827"
        darkColor="#F9FAFB"
      >
        {searchBy || statusBy
          ? "Nenhuma ordem encontrada"
          : "Nenhuma ordem cadastrada"}
      </ThemedText>
      <ThemedText
        style={styles.emptyText}
        lightColor="#6B7280"
        darkColor="#9CA3AF"
      >
        {searchBy || statusBy
          ? "Tente ajustar os filtros de busca"
          : "Comece criando sua primeira ordem de serviço"}
      </ThemedText>
    </ThemedView>
  );

  const filtered = filteredServices();

  return (
    <PageContainer>
      {/* Header com contador */}
      {/* <ThemedView
        style={styles.header}
        lightColor="transparent"
        darkColor="transparent"
      >
        <ThemedView lightColor="transparent" darkColor="transparent">
          <ThemedText type="title" lightColor="#111827" darkColor="#F9FAFB">
            Ordens de Serviço
          </ThemedText>
          <ThemedText
            style={styles.subtitle}
            lightColor="#6B7280"
            darkColor="#9CA3AF"
          >
            {filtered.length} {filtered.length === 1 ? "ordem" : "ordens"}{" "}
            {searchBy || statusBy ? "encontrada(s)" : "cadastrada(s)"}
          </ThemedText>
        </ThemedView>
      </ThemedView> */}

      {/* Container de busca e filtros */}
      <ThemedView
        style={styles.searchContainer}
        lightColor="#FFFFFF"
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
            Buscar e Filtrar
          </ThemedText>
        </ThemedView> */}

        <UIInput
          placeholder="Buscar por cliente..."
          onChangeText={setSearchBy}
          label=""
          icon="account-search"
          value={searchBy}
        />
        <UISelect
          placeholder="Filtrar por status"
          value={statusBy}
          options={statusOptions}
          onValueChange={setStatusBy}
          icon="filter-variant"
        />

        {/* Badge de filtros ativos */}
        {(searchBy || statusBy) && (
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
                {searchBy && statusBy ? "2 filtros ativos" : "1 filtro ativo"}
              </ThemedText>
            </ThemedView>
            <Pressable
              onPress={() => {
                setSearchBy("");
                setStatusBy("");
              }}
              style={styles.clearButton}
            >
              <ThemedText style={styles.clearButtonText}>Limpar</ThemedText>
            </Pressable>
          </ThemedView>
        )}
      </ThemedView>

      {/* Lista de ordens */}
      <ThemedView
        style={styles.listWrapper}
        lightColor="transparent"
        darkColor="transparent"
      >
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <ListServiceCard
              data={item}
              onOpen={() => router.push(("/services/" + item.id) as any)}
              onStatusChange={(newStatus: string) =>
                handleStatusChange(item.id, newStatus)
              }
              onShare={() => handleShare(item.id)}
            />
          )}
          contentContainerStyle={[
            styles.listContainer,
            filtered.length === 0 && styles.emptyListContainer,
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
          onRefresh={loadServices}
          scrollEnabled={false}
          nestedScrollEnabled={true}
        />
      </ThemedView>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.push("/services/form")}
        disabled={loading}
      >
        <ThemedView
          style={styles.buttonIconContainer}
          lightColor="#2563EB"
          darkColor="#1E40AF"
        >
          <MaterialCommunityIcons name="plus" size={28} color="white" />
        </ThemedView>
        <ThemedText style={styles.buttonText}>Nova Ordem de Serviço</ThemedText>
      </Pressable>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
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
    padding: 12,
    borderRadius: 16,
    gap: 12,
    elevation: 4,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: "#3B82F6",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 0.3,
  },
});
