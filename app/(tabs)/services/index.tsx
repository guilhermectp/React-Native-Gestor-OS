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
    <ThemedView style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="file-document-outline"
        size={64}
        color="#D1D5DB"
      />
      <ThemedText style={styles.emptyText}>
        {searchBy || statusBy
          ? "Nenhuma Ordem de Serviço encontrada"
          : "Nenhuma Ordem de Serviço cadastrada"}
      </ThemedText>
    </ThemedView>
  );

  return (
    <PageContainer>
      <ThemedView style={styles.searchContainer}>
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
      </ThemedView>

      <FlatList
        data={filteredServices()}
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
          services.length === 0 && styles.emptyListContainer,
        ]}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
        ListEmptyComponent={!loading ? renderEmptyList : null}
        refreshing={loading}
        onRefresh={loadServices}
        scrollEnabled={false}
        nestedScrollEnabled={true}
      />

      <Pressable
        style={[styles.button]}
        onPress={() => router.push("/services/form")}
        disabled={loading}
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
        <ThemedText style={styles.buttonText}>Nova Ordem de Serviço</ThemedText>
      </Pressable>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  listContainer: { padding: 4 },

  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 4,
    gap: 8,
    elevation: 1,
    backgroundColor: "#3B82F6",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
