import PageContainer from "@/components/page-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import UISelect from "@/components/ui/UISelect";
import useServiceOrderDatabase, {
  IServiceWithClient,
} from "@/database/useServiceOrderDatabase";
import { contactWhatsapp } from "@/utils/contactWhatsapp";
import { shareServicePDF } from "@/utils/generateServicePDF";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";

export default function DetailsServicePage() {
  type ServiceOrderStatus =
    | "pendente"
    | "em_andamento"
    | "concluido"
    | "cancelado";

  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const useServicerOrder = useServiceOrderDatabase();
  const [service, setService] = useState<IServiceWithClient | null>(null);

  const statusOptions = [
    { label: "Pendente", value: "pendente" },
    { label: "Em Andamento", value: "em_andamento" },
    { label: "Concluído", value: "concluido" },
    { label: "Cancelado", value: "cancelado" },
  ];

  const loadServiceId = async () => {
    try {
      const serviceDb = await useServicerOrder.getById(Number(params.id));
      setService(serviceDb);
    } catch (error) {
      Alert.alert(
        "Erro",
        `Não foi possível carregar a ordem de serviço: ${params.id}`,
        error as any
      );
    }
  };

  const formatDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (value: number) => {
    return value.toFixed(2).replace(".", ",");
  };

  const formatAddress = () => {
    const parts = [
      service?.client_rua,
      service?.client_numero && `nº ${service?.client_numero}`,
      service?.client_bairro,
      service?.client_complemento,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Endereço não informado";
  };

  const getStatusConfig = (status: ServiceOrderStatus) => {
    const configs = {
      pendente: {
        label: "Pendente",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        icon: "clock-outline",
      },
      em_andamento: {
        label: "Em Andamento",
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        icon: "wrench",
      },
      concluido: {
        label: "Concluído",
        color: "#10B981",
        bgColor: "#D1FAE5",
        icon: "check-circle",
      },
      cancelado: {
        label: "Cancelado",
        color: "#EF4444",
        bgColor: "#FEE2E2",
        icon: "close-circle",
      },
    };
    return configs[status] || configs.pendente;
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!service) return;

    try {
      await useServicerOrder.updateStatus({
        id: service.id,
        status: newStatus,
      });

      setService({ ...service, status: newStatus });
      Alert.alert("Sucesso", "Status atualizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o status", error as any);
    }
  };

  const handleShare = async () => {
    if (!service) return;

    try {
      await shareServicePDF(service);
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível gerar ou compartilhar o PDF",
        error as any
      );
    }
  };

  const handleWhatsAppPress = async () => {
    contactWhatsapp({
      nome: service!.client_nome,
      telefone: service!.client_telefone,
    });
  };

  const handleEdit = () => {
    router.push({
      pathname: "/services/form",
      params: { serviceId: String(service?.id) },
    });
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a OS #${service?.numero_os}? Esta ação não pode ser desfeita.`,
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
              await useServicerOrder.remove(service!.id);
              Alert.alert("Sucesso", "Ordem de Serviço excluída com sucesso!");
              router.back(); // Volta para a lista
            } catch (error) {
              Alert.alert(
                "Erro",
                "Não foi possível excluir a ordem de serviço",
                error as any
              );
            }
          },
        },
      ]
    );
  };

  const statusConfig = getStatusConfig(service?.status as any);

  useEffect(() => {
    loadServiceId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (params.id) {
        loadServiceId();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `OS #${service?.numero_os || params.id}`,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#3B82F6",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerShown: true,
        }}
      />

      {service && (
        <PageContainer edges={["left", "right"]}>
          {/* Header com OS e Status */}
          <ThemedView style={styles.headerSection}>
            <ThemedView style={styles.osNumberContainer}>
              <MaterialCommunityIcons
                name="file-document"
                size={24}
                color="#3B82F6"
              />
              <ThemedText style={styles.osNumber}>
                OS #{service.numero_os}
              </ThemedText>
            </ThemedView>

            <ThemedView
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              <MaterialCommunityIcons
                name={statusConfig.icon as any}
                size={16}
                color={statusConfig.color}
              />
              <ThemedText
                style={[styles.statusText, { color: statusConfig.color }]}
              >
                {statusConfig.label}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Seção Cliente */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="account"
                size={20}
                color="#3B82F6"
              />
              <ThemedText style={styles.sectionTitle}>Cliente</ThemedText>
            </ThemedView>

            <ThemedView style={styles.sectionContent}>
              <ThemedView style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={18}
                  color="#6B7280"
                />
                <ThemedText style={styles.infoLabel}>Nome:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {service.client_nome}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="phone"
                  size={18}
                  color="#6B7280"
                />
                <ThemedText style={styles.infoLabel}>Telefone:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {service.client_telefone || "Não informado"}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color="#6B7280"
                />
                <ThemedText style={styles.infoLabel}>Endereço:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {formatAddress()}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Seção Equipamento */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialCommunityIcons name="tools" size={20} color="#3B82F6" />
              <ThemedText style={styles.sectionTitle}>Equipamento</ThemedText>
            </ThemedView>

            <ThemedView style={styles.sectionContent}>
              {service.equipamento_tipo && (
                <ThemedView style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="washing-machine"
                    size={18}
                    color="#6B7280"
                  />
                  <ThemedText style={styles.infoLabel}>Tipo:</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {service.equipamento_tipo}
                  </ThemedText>
                </ThemedView>
              )}

              {service.equipamento_marca && (
                <ThemedView style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="tag"
                    size={18}
                    color="#6B7280"
                  />
                  <ThemedText style={styles.infoLabel}>Marca:</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {service.equipamento_marca}
                  </ThemedText>
                </ThemedView>
              )}

              {service.equipamento_modelo && (
                <ThemedView style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="label"
                    size={18}
                    color="#6B7280"
                  />
                  <ThemedText style={styles.infoLabel}>Modelo:</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {service.equipamento_modelo}
                  </ThemedText>
                </ThemedView>
              )}

              {service.equipamento_serie && (
                <ThemedView style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="barcode"
                    size={18}
                    color="#6B7280"
                  />
                  <ThemedText style={styles.infoLabel}>Série:</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {service.equipamento_serie}
                  </ThemedText>
                </ThemedView>
              )}

              {!service.equipamento_tipo &&
                !service.equipamento_marca &&
                !service.equipamento_modelo &&
                !service.equipamento_serie && (
                  <ThemedText style={styles.emptyText}>
                    Nenhuma informação de equipamento cadastrada
                  </ThemedText>
                )}
            </ThemedView>
          </ThemedView>

          {/* Seção Ordem de Serviço */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="clipboard-text"
                size={20}
                color="#3B82F6"
              />
              <ThemedText style={styles.sectionTitle}>
                Ordem de Serviço
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.sectionContent}>
              <ThemedView style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={18}
                  color="#6B7280"
                />
                <ThemedText style={styles.infoLabel}>Data:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {formatDate(service.data_servico)}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.serviceDescriptionBox}>
                <ThemedText style={styles.serviceDescriptionLabel}>
                  Serviços Realizados:
                </ThemedText>
                <ThemedText style={styles.serviceDescriptionText}>
                  {service.servicos_realizados || "Não informado"}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.valuesContainer}>
                <ThemedView style={styles.valueRow}>
                  <ThemedText style={styles.valueLabel}>
                    Valor dos Serviços:
                  </ThemedText>
                  <ThemedText style={styles.valueAmount}>
                    R$ {formatCurrency(service.valor_servicos)}
                  </ThemedText>
                </ThemedView>

                {service.desconto > 0 && (
                  <ThemedView style={styles.valueRow}>
                    <ThemedText style={styles.valueLabel}>Desconto:</ThemedText>
                    <ThemedText
                      style={[styles.valueAmount, styles.discountText]}
                    >
                      - R$ {formatCurrency(service.desconto)}
                    </ThemedText>
                  </ThemedView>
                )}

                <ThemedView style={styles.totalRow}>
                  <ThemedText style={styles.totalLabel}>
                    Valor Total:
                  </ThemedText>
                  <ThemedText style={styles.totalAmount}>
                    R$ {formatCurrency(service.valor_total)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {service.observacoes && (
                <ThemedView style={styles.observationsBox}>
                  <ThemedText style={styles.observationsLabel}>
                    Observações:
                  </ThemedText>
                  <ThemedText style={styles.observationsText}>
                    {service.observacoes}
                  </ThemedText>
                </ThemedView>
              )}

              {service.garantia_dias > 0 && (
                <ThemedView style={styles.warrantyBox}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={20}
                    color="#10B981"
                  />
                  <ThemedText style={styles.warrantyText}>
                    Garantia de {service.garantia_dias} dias
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>

          {/* Seção de Ações */}
          <ThemedView style={styles.actionsContainer}>
            <ThemedView style={styles.statusSelectContainer}>
              <UISelect
                label="Atualizar Status"
                value={service.status!}
                options={statusOptions}
                onValueChange={handleStatusChange}
                icon="sync"
              />
            </ThemedView>

            <ThemedView style={styles.actionButtons}>
              <Pressable
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEdit}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={20}
                  color="#3B82F6"
                />
                <ThemedText style={styles.editButtonText}>Editar</ThemedText>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.whatsappButton]}
                onPress={handleWhatsAppPress}
              >
                <MaterialCommunityIcons
                  name="whatsapp"
                  size={20}
                  color="white"
                />
                <ThemedText style={styles.whatsappButtonText}>
                  WhatsApp
                </ThemedText>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShare}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={20}
                  color="white"
                />
                <ThemedText style={styles.shareButtonText}>
                  Enviar PDF
                </ThemedText>
              </Pressable>
            </ThemedView>

            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <MaterialCommunityIcons
                name="delete-outline"
                size={18}
                color="#EF4444"
              />
              <ThemedText style={styles.deleteButtonText}>
                Excluir Ordem de Serviço
              </ThemedText>
            </Pressable>
          </ThemedView>
        </PageContainer>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Header
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  osNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  osNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Sections
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  sectionContent: {
    gap: 12,
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    minWidth: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },

  // Service Description
  serviceDescriptionBox: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  serviceDescriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  serviceDescriptionText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },

  // Values
  valuesContainer: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valueLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  valueAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  discountText: {
    color: "#EF4444",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B82F6",
  },

  // Observations
  observationsBox: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  observationsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78350F",
    marginBottom: 6,
  },
  observationsText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },

  // Warranty
  warrantyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D1FAE5",
    padding: 12,
    borderRadius: 8,
  },
  warrantyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
  },

  // Actions
  actionsContainer: {
    gap: 16,
  },
  statusSelectContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  editButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  whatsappButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  shareButton: {
    backgroundColor: "#3B82F6",
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    marginTop: 16, // ← Espaçamento acima
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#EF4444",
  },
});
