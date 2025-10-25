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
  // type ServiceOrderStatus =
  //   | "pendente"
  //   | "em_andamento"
  //   | "concluido"
  //   | "cancelado";

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

  // const getStatusConfig = (status: ServiceOrderStatus) => {
  //   const configs = {
  //     pendente: {
  //       label: "Pendente",
  //       color: "#F59E0B",
  //       bgColor: "#FEF3C7",
  //       darkBgColor: "#78350F",
  //       icon: "clock-outline",
  //     },
  //     em_andamento: {
  //       label: "Em Andamento",
  //       color: "#3B82F6",
  //       bgColor: "#DBEAFE",
  //       darkBgColor: "#1E3A8A",
  //       icon: "wrench",
  //     },
  //     concluido: {
  //       label: "Concluído",
  //       color: "#10B981",
  //       bgColor: "#D1FAE5",
  //       darkBgColor: "#064E3B",
  //       icon: "check-circle",
  //     },
  //     cancelado: {
  //       label: "Cancelado",
  //       color: "#EF4444",
  //       bgColor: "#FEE2E2",
  //       darkBgColor: "#7F1D1D",
  //       icon: "close-circle",
  //     },
  //   };
  //   return configs[status] || configs.pendente;
  // };

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
              router.back();
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

  // const statusConfig = getStatusConfig(service?.status as any);

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
          {/* <ThemedView
            style={styles.headerSection}
            lightColor="#FFFFFF"
            darkColor="#1F2937"
          >
            <ThemedView
              style={styles.osNumberContainer}
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedView
                style={styles.osIconBadge}
                lightColor="#EFF6FF"
                darkColor="#1E3A8A"
              >
                <MaterialCommunityIcons
                  name="file-document"
                  size={24}
                  color="#3B82F6"
                />
              </ThemedView>
              <ThemedView lightColor="transparent" darkColor="transparent">
                <ThemedText
                  style={styles.osLabel}
                  lightColor="#6B7280"
                  darkColor="#9CA3AF"
                >
                  Ordem de Serviço
                </ThemedText>
                <ThemedText
                  style={styles.osNumber}
                  lightColor="#111827"
                  darkColor="#F9FAFB"
                >
                  #{service.numero_os}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              <MaterialCommunityIcons
                name={statusConfig.icon as any}
                size={18}
                color={statusConfig.color}
              />
              <ThemedText
                style={[styles.statusText, { color: statusConfig.color }]}
              >
                {statusConfig.label}
              </ThemedText>
            </ThemedView>
          </ThemedView> */}

          {/* Seção Cliente */}
          <ThemedView
            style={styles.sectionContainer}
            lightColor="#FFFFFF"
            darkColor="#1F2937"
          >
            <ThemedView
              style={styles.sectionHeader}
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedView
                style={styles.sectionIconBadge}
                lightColor="#EFF6FF"
                darkColor="#1E3A8A"
              >
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color="#3B82F6"
                />
              </ThemedView>
              <ThemedText
                style={styles.sectionTitle}
                lightColor="#111827"
                darkColor="#F9FAFB"
              >
                Informações do Cliente
              </ThemedText>
            </ThemedView>

            <ThemedView
              style={styles.sectionContent}
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedView
                style={styles.infoRow}
                lightColor="transparent"
                darkColor="transparent"
              >
                <ThemedView
                  style={styles.infoIconContainer}
                  lightColor="#F3F4F6"
                  darkColor="#374151"
                >
                  <MaterialCommunityIcons
                    name="account-circle"
                    size={18}
                    color="#6B7280"
                  />
                </ThemedView>
                <ThemedView
                  style={styles.infoTextContainer}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedText
                    style={styles.infoLabel}
                    lightColor="#6B7280"
                    darkColor="#9CA3AF"
                  >
                    Nome
                  </ThemedText>
                  <ThemedText
                    style={styles.infoValue}
                    lightColor="#111827"
                    darkColor="#F9FAFB"
                  >
                    {service.client_nome}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView
                style={styles.infoRow}
                lightColor="transparent"
                darkColor="transparent"
              >
                <ThemedView
                  style={styles.infoIconContainer}
                  lightColor="#F3F4F6"
                  darkColor="#374151"
                >
                  <MaterialCommunityIcons
                    name="phone"
                    size={18}
                    color="#6B7280"
                  />
                </ThemedView>
                <ThemedView
                  style={styles.infoTextContainer}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedText
                    style={styles.infoLabel}
                    lightColor="#6B7280"
                    darkColor="#9CA3AF"
                  >
                    Telefone
                  </ThemedText>
                  <ThemedText
                    style={styles.infoValue}
                    lightColor="#111827"
                    darkColor="#F9FAFB"
                  >
                    {service.client_telefone || "Não informado"}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView
                style={styles.infoRow}
                lightColor="transparent"
                darkColor="transparent"
              >
                <ThemedView
                  style={styles.infoIconContainer}
                  lightColor="#F3F4F6"
                  darkColor="#374151"
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={18}
                    color="#6B7280"
                  />
                </ThemedView>
                <ThemedView
                  style={styles.infoTextContainer}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedText
                    style={styles.infoLabel}
                    lightColor="#6B7280"
                    darkColor="#9CA3AF"
                  >
                    Endereço
                  </ThemedText>
                  <ThemedText
                    style={styles.infoValue}
                    lightColor="#111827"
                    darkColor="#F9FAFB"
                  >
                    {formatAddress()}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Seção Equipamento */}
          <ThemedView
            style={styles.sectionContainer}
            lightColor="#FFFFFF"
            darkColor="#1F2937"
          >
            <ThemedView
              style={styles.sectionHeader}
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedView
                style={styles.sectionIconBadge}
                lightColor="#DBEAFE"
                darkColor="#1E3A8A"
              >
                <MaterialCommunityIcons
                  name="tools"
                  size={20}
                  color="#3B82F6"
                />
              </ThemedView>
              <ThemedText
                style={styles.sectionTitle}
                lightColor="#111827"
                darkColor="#F9FAFB"
              >
                Dados do Equipamento
              </ThemedText>
            </ThemedView>

            <ThemedView
              style={styles.sectionContent}
              lightColor="transparent"
              darkColor="transparent"
            >
              {service.equipamento_tipo && (
                <ThemedView
                  style={styles.infoRow}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedView
                    style={styles.infoIconContainer}
                    lightColor="#F3F4F6"
                    darkColor="#374151"
                  >
                    <MaterialCommunityIcons
                      name="washing-machine"
                      size={18}
                      color="#6B7280"
                    />
                  </ThemedView>
                  <ThemedView
                    style={styles.infoTextContainer}
                    lightColor="transparent"
                    darkColor="transparent"
                  >
                    <ThemedText
                      style={styles.infoLabel}
                      lightColor="#6B7280"
                      darkColor="#9CA3AF"
                    >
                      Tipo
                    </ThemedText>
                    <ThemedText
                      style={styles.infoValue}
                      lightColor="#111827"
                      darkColor="#F9FAFB"
                    >
                      {service.equipamento_tipo}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              )}

              {service.equipamento_marca && (
                <ThemedView
                  style={styles.infoRow}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedView
                    style={styles.infoIconContainer}
                    lightColor="#F3F4F6"
                    darkColor="#374151"
                  >
                    <MaterialCommunityIcons
                      name="tag"
                      size={18}
                      color="#6B7280"
                    />
                  </ThemedView>
                  <ThemedView
                    style={styles.infoTextContainer}
                    lightColor="transparent"
                    darkColor="transparent"
                  >
                    <ThemedText
                      style={styles.infoLabel}
                      lightColor="#6B7280"
                      darkColor="#9CA3AF"
                    >
                      Marca
                    </ThemedText>
                    <ThemedText
                      style={styles.infoValue}
                      lightColor="#111827"
                      darkColor="#F9FAFB"
                    >
                      {service.equipamento_marca}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              )}

              {service.equipamento_modelo && (
                <ThemedView
                  style={styles.infoRow}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedView
                    style={styles.infoIconContainer}
                    lightColor="#F3F4F6"
                    darkColor="#374151"
                  >
                    <MaterialCommunityIcons
                      name="label"
                      size={18}
                      color="#6B7280"
                    />
                  </ThemedView>
                  <ThemedView
                    style={styles.infoTextContainer}
                    lightColor="transparent"
                    darkColor="transparent"
                  >
                    <ThemedText
                      style={styles.infoLabel}
                      lightColor="#6B7280"
                      darkColor="#9CA3AF"
                    >
                      Modelo
                    </ThemedText>
                    <ThemedText
                      style={styles.infoValue}
                      lightColor="#111827"
                      darkColor="#F9FAFB"
                    >
                      {service.equipamento_modelo}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              )}

              {service.equipamento_serie && (
                <ThemedView
                  style={styles.infoRow}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedView
                    style={styles.infoIconContainer}
                    lightColor="#F3F4F6"
                    darkColor="#374151"
                  >
                    <MaterialCommunityIcons
                      name="barcode"
                      size={18}
                      color="#6B7280"
                    />
                  </ThemedView>
                  <ThemedView
                    style={styles.infoTextContainer}
                    lightColor="transparent"
                    darkColor="transparent"
                  >
                    <ThemedText
                      style={styles.infoLabel}
                      lightColor="#6B7280"
                      darkColor="#9CA3AF"
                    >
                      Número de Série
                    </ThemedText>
                    <ThemedText
                      style={styles.infoValue}
                      lightColor="#111827"
                      darkColor="#F9FAFB"
                    >
                      {service.equipamento_serie}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              )}

              {!service.equipamento_tipo &&
                !service.equipamento_marca &&
                !service.equipamento_modelo &&
                !service.equipamento_serie && (
                  <ThemedView
                    style={styles.emptyStateContainer}
                    lightColor="#F9FAFB"
                    darkColor="#374151"
                  >
                    <MaterialCommunityIcons
                      name="information-outline"
                      size={20}
                      color="#9CA3AF"
                    />
                    <ThemedText
                      style={styles.emptyText}
                      lightColor="#6B7280"
                      darkColor="#9CA3AF"
                    >
                      Nenhuma informação de equipamento cadastrada
                    </ThemedText>
                  </ThemedView>
                )}
            </ThemedView>
          </ThemedView>

          {/* Seção Ordem de Serviço */}
          <ThemedView
            style={styles.sectionContainer}
            lightColor="#FFFFFF"
            darkColor="#1F2937"
          >
            <ThemedView
              style={styles.sectionHeader}
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedView
                style={styles.sectionIconBadge}
                lightColor="#D1FAE5"
                darkColor="#064E3B"
              >
                <MaterialCommunityIcons
                  name="clipboard-text"
                  size={20}
                  color="#10B981"
                />
              </ThemedView>
              <ThemedText
                style={styles.sectionTitle}
                lightColor="#111827"
                darkColor="#F9FAFB"
              >
                Detalhes do Serviço
              </ThemedText>
            </ThemedView>

            <ThemedView
              style={styles.sectionContent}
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedView
                style={styles.infoRow}
                lightColor="transparent"
                darkColor="transparent"
              >
                <ThemedView
                  style={styles.infoIconContainer}
                  lightColor="#F3F4F6"
                  darkColor="#374151"
                >
                  <MaterialCommunityIcons
                    name="calendar"
                    size={18}
                    color="#6B7280"
                  />
                </ThemedView>
                <ThemedView
                  style={styles.infoTextContainer}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedText
                    style={styles.infoLabel}
                    lightColor="#6B7280"
                    darkColor="#9CA3AF"
                  >
                    Data do Serviço
                  </ThemedText>
                  <ThemedText
                    style={styles.infoValue}
                    lightColor="#111827"
                    darkColor="#F9FAFB"
                  >
                    {formatDate(service.data_servico)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {service.servicos_realizados && (
                <ThemedView
                  style={styles.serviceDescriptionBox}
                  lightColor="#F0FDF4"
                  darkColor="#064E3B"
                >
                  <ThemedView
                    style={styles.descriptionHeader}
                    lightColor="transparent"
                    darkColor="transparent"
                  >
                    <MaterialCommunityIcons
                      name="text-box-check"
                      size={18}
                      color="#10B981"
                    />
                    <ThemedText
                      style={styles.serviceDescriptionLabel}
                      lightColor="#065F46"
                      darkColor="#86EFAC"
                    >
                      Serviços Realizados
                    </ThemedText>
                  </ThemedView>
                  <ThemedText
                    style={styles.serviceDescriptionText}
                    lightColor="#047857"
                    darkColor="#D1FAE5"
                  >
                    {service.servicos_realizados}
                  </ThemedText>
                </ThemedView>
              )}

              <ThemedView
                style={styles.valuesContainer}
                lightColor="#F9FAFB"
                darkColor="#111827"
              >
                <ThemedView
                  style={styles.valueRow}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedText
                    style={styles.valueLabel}
                    lightColor="#6B7280"
                    darkColor="#9CA3AF"
                  >
                    Valor dos Serviços
                  </ThemedText>
                  <ThemedText
                    style={styles.valueAmount}
                    lightColor="#111827"
                    darkColor="#F9FAFB"
                  >
                    R$ {formatCurrency(service.valor_servicos)}
                  </ThemedText>
                </ThemedView>

                {service.desconto > 0 && (
                  <ThemedView
                    style={styles.valueRow}
                    lightColor="transparent"
                    darkColor="transparent"
                  >
                    <ThemedText
                      style={styles.valueLabel}
                      lightColor="#6B7280"
                      darkColor="#9CA3AF"
                    >
                      Desconto
                    </ThemedText>
                    <ThemedText style={styles.discountText}>
                      - R$ {formatCurrency(service.desconto)}
                    </ThemedText>
                  </ThemedView>
                )}

                <ThemedView
                  style={styles.divider}
                  lightColor="#E5E7EB"
                  darkColor="#374151"
                />

                <ThemedView
                  style={styles.totalRow}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedView
                    style={styles.totalLeft}
                    lightColor="transparent"
                    darkColor="transparent"
                  >
                    <MaterialCommunityIcons
                      name="cash-multiple"
                      size={24}
                      color="#3B82F6"
                    />
                    <ThemedText
                      style={styles.totalLabel}
                      lightColor="#111827"
                      darkColor="#F9FAFB"
                    >
                      Valor Total
                    </ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.totalAmount}>
                    R$ {formatCurrency(service.valor_total)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {service.observacoes && (
                <ThemedView
                  style={styles.observationsBox}
                  lightColor="#FFFBEB"
                  darkColor="#78350F"
                >
                  <ThemedView
                    style={styles.descriptionHeader}
                    lightColor="transparent"
                    darkColor="transparent"
                  >
                    <MaterialCommunityIcons
                      name="note-text"
                      size={18}
                      color="#F59E0B"
                    />
                    <ThemedText
                      style={styles.observationsLabel}
                      lightColor="#92400E"
                      darkColor="#FDE68A"
                    >
                      Observações
                    </ThemedText>
                  </ThemedView>
                  <ThemedText
                    style={styles.observationsText}
                    lightColor="#B45309"
                    darkColor="#FEF3C7"
                  >
                    {service.observacoes}
                  </ThemedText>
                </ThemedView>
              )}

              {service.garantia_dias > 0 && (
                <ThemedView
                  style={styles.warrantyBox}
                  lightColor="#D1FAE5"
                  darkColor="#064E3B"
                >
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={22}
                    color="#10B981"
                  />
                  <ThemedText
                    style={styles.warrantyText}
                    lightColor="#065F46"
                    darkColor="#86EFAC"
                  >
                    Garantia de {service.garantia_dias} dias
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>

          {/* Seção de Ações */}
          <ThemedView
            style={styles.actionsContainer}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={styles.statusSelectContainer}
              lightColor="#FFFFFF"
              darkColor="#1F2937"
            >
              <ThemedView
                style={styles.statusSelectHeader}
                lightColor="transparent"
                darkColor="transparent"
              >
                <MaterialCommunityIcons name="sync" size={20} color="#3B82F6" />
                <ThemedText
                  style={styles.statusSelectTitle}
                  lightColor="#111827"
                  darkColor="#F9FAFB"
                >
                  Atualizar Status
                </ThemedText>
              </ThemedView>
              <UISelect
                label=""
                value={service.status!}
                options={statusOptions}
                onValueChange={handleStatusChange}
                icon="sync"
              />
            </ThemedView>

            <ThemedView
              style={styles.actionButtons}
              lightColor="transparent"
              darkColor="transparent"
            >
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.editButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleEdit}
              >
                <ThemedView
                  style={styles.editButtonIcon}
                  lightColor="#EFF6FF"
                  darkColor="#1E3A8A"
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="#3B82F6"
                  />
                </ThemedView>
                <ThemedText style={styles.editButtonText}>Editar</ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.whatsappButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleWhatsAppPress}
              >
                <ThemedView
                  style={styles.whatsappButtonIcon}
                  lightColor="#128C7E"
                  darkColor="#075E54"
                >
                  <MaterialCommunityIcons
                    name="whatsapp"
                    size={20}
                    color="white"
                  />
                </ThemedView>
                <ThemedText style={styles.whatsappButtonText}>
                  WhatsApp
                </ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.shareButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleShare}
              >
                <ThemedView
                  style={styles.shareButtonIcon}
                  lightColor="#2563EB"
                  darkColor="#1E40AF"
                >
                  <MaterialCommunityIcons
                    name="share-variant"
                    size={20}
                    color="white"
                  />
                </ThemedView>
                <ThemedText style={styles.shareButtonText}>PDF</ThemedText>
              </Pressable>
            </ThemedView>

            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
              ]}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={20}
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
  // headerSection: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   padding: 20,
  //   borderRadius: 16,
  //   marginBottom: 20,
  //   elevation: 3,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.08,
  //   shadowRadius: 8,
  // },
  // osNumberContainer: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   gap: 12,
  // },
  // osIconBadge: {
  //   width: 56,
  //   height: 56,
  //   borderRadius: 14,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // osLabel: {
  //   fontSize: 12,
  //   fontWeight: "600",
  //   marginBottom: 2,
  // },
  // osNumber: {
  //   fontSize: 22,
  //   fontWeight: "bold",
  // },
  // statusBadge: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   gap: 8,
  //   paddingHorizontal: 12,
  //   paddingVertical: 10,
  //   borderRadius: 12,
  // },
  // statusText: {
  //   fontSize: 15,
  //   fontWeight: "600",
  // },

  // Sections
  sectionContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  sectionIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionContent: {
    gap: 16,
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextContainer: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyStateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
  },

  // Service Description
  serviceDescriptionBox: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  serviceDescriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  serviceDescriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },

  // Values
  valuesContainer: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valueLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  discountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
  divider: {
    height: 2,
    borderRadius: 1,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  totalLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3B82F6",
    letterSpacing: -0.5,
  },

  // Observations
  observationsBox: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  observationsLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  observationsText: {
    fontSize: 14,
    lineHeight: 22,
  },

  // Warranty
  warrantyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
  },
  warrantyText: {
    fontSize: 15,
    fontWeight: "600",
  },

  // Actions
  actionsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  statusSelectContainer: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statusSelectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  statusSelectTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  editButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  editButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B82F6",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  whatsappButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  whatsappButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },
  shareButton: {
    backgroundColor: "#3B82F6",
  },
  shareButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  deleteButtonPressed: {
    opacity: 0.7,
    backgroundColor: "#FEE2E2",
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
});
