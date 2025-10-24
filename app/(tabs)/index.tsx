import PageContainer from "@/components/page-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import useServiceOrderDatabase from "@/database/useServiceOrderDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

interface Stats {
  total: number;
  pendente: number;
  em_andamento: number;
  concluido: number;
  cancelado: number;
}

export default function Home() {
  const serviceDatabase = useServiceOrderDatabase();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pendente: 0,
    em_andamento: 0,
    concluido: 0,
    cancelado: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const services = await serviceDatabase.getAll();

      const newStats: Stats = {
        total: services.length,
        pendente: services.filter((s) => s.status === "pendente").length,
        em_andamento: services.filter((s) => s.status === "em_andamento")
          .length,
        concluido: services.filter((s) => s.status === "concluido").length,
        cancelado: services.filter((s) => s.status === "cancelado").length,
      };

      setStats(newStats);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <ThemedText style={styles.loadingText}>
          Carregando estatísticas...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <PageContainer>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Dashboard</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Visão geral das ordens de serviço
        </ThemedText>
      </ThemedView>

      {/* Card Total */}
      <ThemedView style={[styles.mainCard, styles.totalCard]}>
        <ThemedView style={styles.cardIconContainer}>
          <MaterialCommunityIcons
            name="file-document-multiple"
            size={32}
            color="#3B82F6"
          />
        </ThemedView>
        <ThemedView style={styles.cardContent}>
          <ThemedText style={styles.cardLabel}>Total de Ordens</ThemedText>
          <ThemedText style={styles.mainCardValue}>{stats.total}</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Cards de Status */}
      <ThemedView style={styles.statsGrid}>
        <ThemedView style={[styles.statCard, styles.pendingCard]}>
          <ThemedView style={styles.statCardHeader}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color="#F59E0B"
            />
            <ThemedText style={[styles.statValue, { color: "#F59E0B" }]}>
              {stats.pendente}
            </ThemedText>
          </ThemedView>
          <ThemedText style={styles.statLabel}>Pendentes</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.statCard, styles.inProgressCard]}>
          <ThemedView style={styles.statCardHeader}>
            <MaterialCommunityIcons name="wrench" size={24} color="#3B82F6" />
            <ThemedText style={[styles.statValue, { color: "#3B82F6" }]}>
              {stats.em_andamento}
            </ThemedText>
          </ThemedView>
          <ThemedText style={styles.statLabel}>Em Andamento</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.statCard, styles.completedCard]}>
          <ThemedView style={styles.statCardHeader}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#10B981"
            />
            <ThemedText style={[styles.statValue, { color: "#10B981" }]}>
              {stats.concluido}
            </ThemedText>
          </ThemedView>
          <ThemedText style={styles.statLabel}>Concluídas</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.statCard, styles.cancelledCard]}>
          <ThemedView style={styles.statCardHeader}>
            <MaterialCommunityIcons
              name="close-circle"
              size={24}
              color="#EF4444"
            />
            <ThemedText style={[styles.statValue, { color: "#EF4444" }]}>
              {stats.cancelado}
            </ThemedText>
          </ThemedView>
          <ThemedText style={styles.statLabel}>Canceladas</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Resumo */}
      <ThemedView style={styles.summaryCard}>
        <ThemedText style={styles.summaryTitle}>Resumo</ThemedText>
        <ThemedView style={styles.summaryRow}>
          <ThemedText style={styles.summaryLabel}>Em aberto:</ThemedText>
          <ThemedText style={styles.summaryValue}>
            {stats.pendente + stats.em_andamento}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.summaryRow}>
          <ThemedText style={styles.summaryLabel}>Finalizadas:</ThemedText>
          <ThemedText style={styles.summaryValue}>
            {stats.concluido + stats.cancelado}
          </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.summaryRow, styles.summaryRowBorder]}>
          <ThemedText style={styles.summaryLabelBold}>
            Taxa de conclusão:
          </ThemedText>
          <ThemedText style={styles.summaryValueBold}>
            {stats.total > 0
              ? `${((stats.concluido / stats.total) * 100).toFixed(1)}%`
              : "0%"}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },

  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },

  // Main Card
  mainCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  mainCardValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pendingCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  inProgressCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  completedCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  cancelledCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Summary Card
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryRowBorder: {
    borderTopWidth: 2,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
    paddingTop: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B82F6",
  },
});
