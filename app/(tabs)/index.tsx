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
      <ThemedView
        style={styles.loadingContainer}
        lightColor="#F9FAFB"
        darkColor="#111827"
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <ThemedText
          type="defaultSemiBold"
          lightColor="#6B7280"
          darkColor="#9CA3AF"
        >
          Carregando estatísticas...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <PageContainer>
      <ThemedView
        style={styles.header}
        lightColor="transparent"
        darkColor="transparent"
      >
        <ThemedText type="title" lightColor="#111827" darkColor="#F9FAFB">
          Dashboard
        </ThemedText>
        <ThemedText
          type="defaultSemiBold"
          lightColor="#6B7280"
          darkColor="#9CA3AF"
        >
          Visão geral das ordens de serviço
        </ThemedText>
      </ThemedView>

      {/* Card Total com gradiente visual */}
      <ThemedView
        style={styles.mainCard}
        lightColor="#FFFFFF"
        darkColor="#1F2937"
      >
        <ThemedView
          style={styles.cardIconContainer}
          lightColor="#EFF6FF"
          darkColor="#1E3A8A"
        >
          <MaterialCommunityIcons
            name="file-document-multiple"
            size={36}
            color="#3B82F6"
          />
        </ThemedView>
        <ThemedView
          style={styles.cardContent}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText
            type="defaultSemiBold"
            lightColor="#6B7280"
            darkColor="#9CA3AF"
          >
            Total de Ordens
          </ThemedText>
          <ThemedText
            style={styles.mainCardValue}
            lightColor="#3B82F6"
            darkColor="#60A5FA"
          >
            {stats.total}
          </ThemedText>
          <ThemedText
            style={styles.mainCardSubtext}
            lightColor="#9CA3AF"
            darkColor="#6B7280"
          >
            Todas as ordens registradas
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Cards de Status com design melhorado */}
      <ThemedView
        style={styles.statsGrid}
        lightColor="transparent"
        darkColor="transparent"
      >
        <ThemedView
          style={[styles.statCard, styles.pendingCard]}
          lightColor="#FFFFFF"
          darkColor="#1F2937"
        >
          <ThemedView
            style={styles.statCardHeader}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={[styles.iconBadge, styles.pendingBadge]}
              lightColor="#FEF3C7"
              darkColor="#78350F"
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="#F59E0B"
              />
            </ThemedView>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.statValue, { color: "#F59E0B" }]}
            >
              {stats.pendente}
            </ThemedText>
          </ThemedView>
          <ThemedText
            type="defaultSemiBold"
            lightColor="#1F2937"
            darkColor="#F9FAFB"
            style={styles.statLabel}
          >
            Pendentes
          </ThemedText>
          <ThemedView
            style={styles.statProgress}
            lightColor="#FEF3C7"
            darkColor="#78350F"
          >
            <ThemedView
              style={[
                styles.statProgressBar,
                {
                  width: `${
                    stats.total > 0 ? (stats.pendente / stats.total) * 100 : 0
                  }%`,
                  backgroundColor: "#F59E0B",
                },
              ]}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView
          style={[styles.statCard, styles.inProgressCard]}
          lightColor="#FFFFFF"
          darkColor="#1F2937"
        >
          <ThemedView
            style={styles.statCardHeader}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={[styles.iconBadge, styles.inProgressBadge]}
              lightColor="#DBEAFE"
              darkColor="#1E3A8A"
            >
              <MaterialCommunityIcons name="wrench" size={24} color="#3B82F6" />
            </ThemedView>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.statValue, { color: "#3B82F6" }]}
            >
              {stats.em_andamento}
            </ThemedText>
          </ThemedView>
          <ThemedText
            type="defaultSemiBold"
            lightColor="#1F2937"
            darkColor="#F9FAFB"
            style={styles.statLabel}
          >
            Em Andamento
          </ThemedText>
          <ThemedView
            style={styles.statProgress}
            lightColor="#DBEAFE"
            darkColor="#1E3A8A"
          >
            <ThemedView
              style={[
                styles.statProgressBar,
                {
                  width: `${
                    stats.total > 0
                      ? (stats.em_andamento / stats.total) * 100
                      : 0
                  }%`,
                  backgroundColor: "#3B82F6",
                },
              ]}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView
          style={[styles.statCard, styles.completedCard]}
          lightColor="#FFFFFF"
          darkColor="#1F2937"
        >
          <ThemedView
            style={styles.statCardHeader}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={[styles.iconBadge, styles.completedBadge]}
              lightColor="#D1FAE5"
              darkColor="#064E3B"
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#10B981"
              />
            </ThemedView>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.statValue, { color: "#10B981" }]}
            >
              {stats.concluido}
            </ThemedText>
          </ThemedView>
          <ThemedText
            type="defaultSemiBold"
            lightColor="#1F2937"
            darkColor="#F9FAFB"
            style={styles.statLabel}
          >
            Concluídas
          </ThemedText>
          <ThemedView
            style={styles.statProgress}
            lightColor="#D1FAE5"
            darkColor="#064E3B"
          >
            <ThemedView
              style={[
                styles.statProgressBar,
                {
                  width: `${
                    stats.total > 0 ? (stats.concluido / stats.total) * 100 : 0
                  }%`,
                  backgroundColor: "#10B981",
                },
              ]}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView
          style={[styles.statCard, styles.cancelledCard]}
          lightColor="#FFFFFF"
          darkColor="#1F2937"
        >
          <ThemedView
            style={styles.statCardHeader}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={[styles.iconBadge, styles.cancelledBadge]}
              lightColor="#FEE2E2"
              darkColor="#7F1D1D"
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={24}
                color="#EF4444"
              />
            </ThemedView>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.statValue, { color: "#EF4444" }]}
            >
              {stats.cancelado}
            </ThemedText>
          </ThemedView>
          <ThemedText
            type="defaultSemiBold"
            lightColor="#1F2937"
            darkColor="#F9FAFB"
            style={styles.statLabel}
          >
            Canceladas
          </ThemedText>
          <ThemedView
            style={styles.statProgress}
            lightColor="#FEE2E2"
            darkColor="#7F1D1D"
          >
            <ThemedView
              style={[
                styles.statProgressBar,
                {
                  width: `${
                    stats.total > 0 ? (stats.cancelado / stats.total) * 100 : 0
                  }%`,
                  backgroundColor: "#EF4444",
                },
              ]}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Resumo com design melhorado */}
      <ThemedView
        style={styles.summaryCard}
        lightColor="#FFFFFF"
        darkColor="#1F2937"
      >
        <ThemedView
          style={styles.summaryHeader}
          lightColor="transparent"
          darkColor="transparent"
        >
          <MaterialCommunityIcons name="chart-box" size={24} color="#3B82F6" />
          <ThemedText
            style={styles.summaryTitle}
            lightColor="#111827"
            darkColor="#F9FAFB"
          >
            Resumo Geral
          </ThemedText>
        </ThemedView>

        <ThemedView
          style={styles.summaryContent}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedView
            style={styles.summaryRow}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={styles.summaryRowLeft}
              lightColor="transparent"
              darkColor="transparent"
            >
              <MaterialCommunityIcons
                name="folder-open"
                size={20}
                color="#6B7280"
              />
              <ThemedText
                style={styles.summaryLabel}
                lightColor="#6B7280"
                darkColor="#9CA3AF"
              >
                Em aberto
              </ThemedText>
            </ThemedView>
            <ThemedText
              style={styles.summaryValue}
              lightColor="#1F2937"
              darkColor="#F9FAFB"
            >
              {stats.pendente + stats.em_andamento}
            </ThemedText>
          </ThemedView>

          <ThemedView
            style={styles.summaryRow}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={styles.summaryRowLeft}
              lightColor="transparent"
              darkColor="transparent"
            >
              <MaterialCommunityIcons
                name="folder-check"
                size={20}
                color="#6B7280"
              />
              <ThemedText
                style={styles.summaryLabel}
                lightColor="#6B7280"
                darkColor="#9CA3AF"
              >
                Finalizadas
              </ThemedText>
            </ThemedView>
            <ThemedText
              style={styles.summaryValue}
              lightColor="#1F2937"
              darkColor="#F9FAFB"
            >
              {stats.concluido + stats.cancelado}
            </ThemedText>
          </ThemedView>

          <ThemedView
            style={styles.summaryDivider}
            lightColor="#E5E7EB"
            darkColor="#374151"
          />

          <ThemedView
            style={styles.summaryRow}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={styles.summaryRowLeft}
              lightColor="transparent"
              darkColor="transparent"
            >
              <MaterialCommunityIcons
                name="chart-line"
                size={20}
                color="#3B82F6"
              />
              <ThemedText
                style={styles.summaryLabelBold}
                lightColor="#111827"
                darkColor="#F9FAFB"
              >
                Taxa de conclusão
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.summaryValueBold}>
              {stats.total > 0
                ? `${((stats.concluido / stats.total) * 100).toFixed(1)}%`
                : "0%"}
            </ThemedText>
          </ThemedView>
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

  header: {
    marginBottom: 24,
    gap: 4,
  },

  // Main Card
  mainCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#3B82F6",
  },
  cardIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  mainCardValue: {
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  mainCardSubtext: {
    fontSize: 13,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  inProgressCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  cancelledCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingBadge: {},
  inProgressBadge: {},
  completedBadge: {},
  cancelledBadge: {},
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 15,
    marginBottom: 8,
  },
  statProgress: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  statProgressBar: {
    height: "100%",
    borderRadius: 3,
  },

  // Summary Card
  summaryCard: {
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryDivider: {
    height: 2,
    marginVertical: 8,
    borderRadius: 1,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryValueBold: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B82F6",
  },
});
