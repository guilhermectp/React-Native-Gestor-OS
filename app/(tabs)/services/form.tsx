import PageContainer from "@/components/page-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import UIInput from "@/components/ui/UIInput";
import UISelectClient from "@/components/ui/UISelectClient";
import useServiceOrderDatabase, {
  IServiceDatabase,
} from "@/database/useServiceOrderDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";

export default function ServiceFormPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ serviceId: string }>();
  const serviceDatabase = useServiceOrderDatabase();

  const isEditing = !!params.serviceId;

  useEffect(() => {
    if (params.serviceId) {
      loadService(Number(params.serviceId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.serviceId]);

  const loadService = async (id: number) => {
    try {
      const service = await serviceDatabase.getById(id);
      if (service) loadServiceData(service);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar a OS", error as any);
      router.back();
    }
  };

  async function loadServiceData(item: IServiceDatabase) {
    setId(item.id);
    setClientId(item.client_id);
    setNumeroOs(item.numero_os);

    // Converter data ISO para DD/MM/YYYY
    const [year, month, day] = item.data_servico.split("-");
    setDataServico(`${day}/${month}/${year}`);

    setEquipamentoTipo(item.equipamento_tipo);
    setEquipamentoMarca(item.equipamento_marca);
    setEquipamentoModelo(item.equipamento_modelo);
    setEquipamentoSerie(item.equipamento_serie);
    setServicosRealizados(item.servicos_realizados);

    // Converter números para string com 2 casas decimais
    setValorServicos(item.valor_servicos.toFixed(2));
    setDesconto(item.desconto.toFixed(2));
    setValorTotal(item.valor_total.toFixed(2));

    setObservacoes(item.observacoes);
    setGarantiaDias(String(item.garantia_dias));
  }

  // Cliente
  const [clientId, setClientId] = useState(0);

  // OS
  const [id, setId] = useState(0);
  const [numeroOs, setNumeroOs] = useState("");
  const [dataServico, setDataServico] = useState("");

  // Equipamento
  const [equipamentoTipo, setEquipamentoTipo] = useState("");
  const [equipamentoMarca, setEquipamentoMarca] = useState("");
  const [equipamentoModelo, setEquipamentoModelo] = useState("");
  const [equipamentoSerie, setEquipamentoSerie] = useState("");

  // Serviços - mantém como STRING no formulário para facilitar input
  const [servicosRealizados, setServicosRealizados] = useState("");
  const [valorServicos, setValorServicos] = useState("");
  const [desconto, setDesconto] = useState("");
  const [valorTotal, setValorTotal] = useState("");

  // Outros
  const [observacoes, setObservacoes] = useState("");
  const [garantiaDias, setGarantiaDias] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const serviceOrderDatabase = useServiceOrderDatabase();

  // Calcular valor total
  useEffect(() => {
    const valor = parseFloat(valorServicos || "0");
    const desc = parseFloat(desconto || "0");
    const total = valor - desc;
    setValorTotal(total.toFixed(2));
  }, [valorServicos, desconto]);

  // Gerar número da OS
  useEffect(() => {
    if (!id) {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(4, "0");
      setNumeroOs(`${year}${month}${day}-${random}`);
    }
  }, [id]);

  // Preencher data atual
  useEffect(() => {
    if (!id) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      setDataServico(`${day}/${month}/${year}`);
    }
  }, [id]);

  const formatDate = (text: string) => {
    const numbers = text.replace(/\D/g, "");
    const limitedNumbers = numbers.slice(0, 8);

    if (limitedNumbers.length === 0) return "";
    if (limitedNumbers.length <= 2) return limitedNumbers;
    if (limitedNumbers.length <= 4) {
      return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2)}`;
    }
    return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(
      2,
      4
    )}/${limitedNumbers.slice(4)}`;
  };

  const formatCurrency = (text: string) => {
    const numbers = text.replace(/\D/g, "");
    if (!numbers) return "0.00";
    const amount = parseFloat(numbers) / 100;
    return amount.toFixed(2);
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!clientId) {
      newErrors.clientId = "Selecione um cliente";
    }

    if (!numeroOs.trim()) {
      newErrors.numeroOs = "Número da OS é obrigatório";
    }

    if (!dataServico.trim()) {
      newErrors.dataServico = "Data do serviço é obrigatória";
    } else if (dataServico.replace(/\D/g, "").length !== 8) {
      newErrors.dataServico = "Data inválida (use DD/MM/AAAA)";
    }

    const valorNum = parseFloat(valorServicos || "0");
    if (!valorServicos || valorNum <= 0) {
      newErrors.valorServicos = "Valor do serviço é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function create() {
    try {
      setLoading(true);

      const [day, month, year] = dataServico.split("/");
      const isoDate = `${year}-${month}-${day}`;

      await serviceOrderDatabase.create({
        client_id: clientId,
        numero_os: numeroOs,
        data_servico: isoDate,
        equipamento_tipo: equipamentoTipo,
        equipamento_marca: equipamentoMarca,
        equipamento_modelo: equipamentoModelo,
        equipamento_serie: equipamentoSerie,
        servicos_realizados: servicosRealizados,
        valor_servicos: parseFloat(valorServicos || ""),
        desconto: parseFloat(desconto || ""),
        valor_total: parseFloat(valorTotal || ""),
        observacoes: observacoes,
        garantia_dias: parseInt(garantiaDias || ""),
        status: "pendente",
      });

      Alert.alert(
        "Sucesso! 🎉",
        `Ordem de Serviço "${numeroOs}" foi cadastrada com sucesso!`
      );

      clearForm();
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro ❌",
        "Não foi possível cadastrar a ordem de serviço. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  async function update() {
    try {
      setLoading(true);

      const [day, month, year] = dataServico.split("/");
      const isoDate = `${year}-${month}-${day}`;

      await serviceOrderDatabase.update({
        id: id,
        data_servico: isoDate,
        equipamento_tipo: equipamentoTipo,
        equipamento_marca: equipamentoMarca,
        equipamento_modelo: equipamentoModelo,
        equipamento_serie: equipamentoSerie,
        servicos_realizados: servicosRealizados,
        valor_servicos: parseFloat(valorServicos || ""),
        desconto: parseFloat(desconto || ""),
        valor_total: parseFloat(valorTotal || ""),
        observacoes: observacoes,
        garantia_dias: parseInt(garantiaDias || ""),
      });

      Alert.alert(
        "Atualizado! ✅",
        `Ordem de Serviço "${numeroOs}" foi atualizada com sucesso!`
      );

      clearForm();
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro ❌",
        "Não foi possível atualizar a ordem de serviço. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!validateFields()) return;

    if (id) {
      await update();
    } else {
      await create();
    }
  }

  function clearForm() {
    setId(0);
    setClientId(0);
    setNumeroOs("");
    setDataServico("");
    setEquipamentoTipo("");
    setEquipamentoMarca("");
    setEquipamentoModelo("");
    setEquipamentoSerie("");
    setServicosRealizados("");
    setValorServicos("");
    setDesconto("");
    setValorTotal("");
    setObservacoes("");
    setGarantiaDias("");
    setErrors({});
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: isEditing
            ? "Editar  Ordem de Serviço"
            : "Nova Ordem de Serviço",
        }}
      />

      <PageContainer edges={["left", "right"]}>
        {/* <View style={styles.formHeader}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={id ? "file-document-edit" : "file-document-plus"}
                  size={32}
                  color="#3B82F6"
                />
              </View>

              <View style={styles.titleContainer}>
                <Text style={styles.formTitle}>
                  {id ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
                </Text>
                <Text style={styles.formSubtitle}>
                  Preencha os dados abaixo para {id ? "atualizar" : "cadastrar"}{" "}
                  a OS.
                </Text>
              </View>
            </View> */}

        {/* Campos do Formulário */}
        <ThemedView style={styles.formFields}>
          {/* Seção Cliente */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="account"
                size={20}
                color="#6B7280"
              />
              <ThemedText style={styles.sectionTitle}>Cliente</ThemedText>
            </ThemedView>

            <UISelectClient
              onChangeClientId={setClientId}
              error={errors.clientId}
              clientId={clientId}
              disabled={!!id}
            />
          </ThemedView>

          {/* Seção OS */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="file-document"
                size={20}
                color="#6B7280"
              />
              <ThemedText style={styles.sectionTitle}>
                Ordem de Serviço
              </ThemedText>
            </ThemedView>

            <UIInput
              label="Número da OS"
              placeholder="0001-25"
              value={numeroOs}
              onChangeText={setNumeroOs}
              error={errors.numeroOs}
              icon="pound"
              editable={false}
            />

            <UIInput
              label="Data do Serviço"
              placeholder="DD/MM/AAAA"
              value={dataServico}
              onChangeText={(text) => {
                const formatted = formatDate(text);
                setDataServico(formatted);
                if (errors.dataServico) {
                  setErrors((prev) => ({ ...prev, dataServico: "" }));
                }
              }}
              error={errors.dataServico}
              icon="calendar"
              keyboardType="numeric"
              maxLength={10}
              required
            />
          </ThemedView>

          {/* Seção Equipamento */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialCommunityIcons name="tools" size={20} color="#6B7280" />
              <ThemedText style={styles.sectionTitle}>Equipamento</ThemedText>
            </ThemedView>

            <UIInput
              label="Tipo"
              placeholder="Ex: Freezer, Geladeira, Ar Condicionado"
              value={equipamentoTipo}
              onChangeText={setEquipamentoTipo}
              icon="washing-machine"
            />

            <UIInput
              label="Marca"
              placeholder="Ex: Electrolux, Brastemp, Samsung"
              value={equipamentoMarca}
              onChangeText={setEquipamentoMarca}
              icon="tag"
            />

            <UIInput
              label="Modelo"
              placeholder="Ex: H400"
              value={equipamentoModelo}
              onChangeText={setEquipamentoModelo}
              icon="label"
            />

            <UIInput
              label="Número de Série"
              placeholder="Ex: 41200706"
              value={equipamentoSerie}
              onChangeText={setEquipamentoSerie}
              icon="barcode"
            />
          </ThemedView>

          {/* Seção Serviços */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialCommunityIcons name="wrench" size={20} color="#6B7280" />
              <ThemedText style={styles.sectionTitle}>Serviços</ThemedText>
            </ThemedView>

            <UIInput
              label="Serviços Realizados"
              placeholder="Descreva os serviços realizados..."
              value={servicosRealizados}
              onChangeText={setServicosRealizados}
              icon="clipboard-text"
            />

            <UIInput
              label="Valor dos Serviços"
              placeholder="0,00"
              value={valorServicos}
              onChangeText={(text) => {
                const formatted = formatCurrency(text);
                setValorServicos(formatted);
                if (errors.valorServicos) {
                  setErrors((prev) => ({ ...prev, valorServicos: "" }));
                }
              }}
              error={errors.valorServicos}
              icon="currency-usd"
              keyboardType="numeric"
              required
            />

            <UIInput
              label="Desconto"
              placeholder="0,00"
              value={desconto}
              onChangeText={(text) => {
                const formatted = formatCurrency(text);
                setDesconto(formatted);
              }}
              icon="sale"
              keyboardType="numeric"
            />

            <ThemedView style={styles.totalContainer}>
              <ThemedText style={styles.totalLabel}>Valor Total:</ThemedText>
              <ThemedText style={styles.totalValue}>
                R${" "}
                {parseFloat(valorTotal || "0")
                  .toFixed(2)
                  .replace(".", ",")}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Seção Observações */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="note-text"
                size={20}
                color="#6B7280"
              />
              <ThemedText style={styles.sectionTitle}>Observações</ThemedText>
            </ThemedView>

            <UIInput
              label="Observações"
              placeholder="Observações adicionais..."
              value={observacoes}
              onChangeText={setObservacoes}
              icon="text"
            />

            <UIInput
              label="Garantia (dias)"
              placeholder="Ex: 30, 90, 180"
              value={garantiaDias}
              onChangeText={(text) => {
                const numbers = text.replace(/\D/g, "");
                setGarantiaDias(numbers);
              }}
              icon="shield-check"
              keyboardType="numeric"
            />
          </ThemedView>
        </ThemedView>

        {/* Botões de Ação */}
        <ThemedView style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
            <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              styles.saveButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <MaterialCommunityIcons
                name={id ? "content-save" : "plus"}
                size={20}
                color="white"
              />
            )}
            <ThemedText style={styles.saveButtonText}>
              {loading ? "Salvando..." : id ? "Atualizar" : "Cadastrar"}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </PageContainer>
    </>
  );
}

const styles = StyleSheet.create({
  // Form Fields
  formFields: {
    gap: 36,
  },

  sectionContainer: {
    // paddingTop: 12,
    borderRadius: 12,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
    elevation: 1,
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#EBF4FF",
    borderRadius: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B82F6",
  },
});
