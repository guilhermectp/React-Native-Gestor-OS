import PageContainer from "@/components/page-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import UIInput from "@/components/ui/UIInput";
import useClientDatabase, {
  IClientDatabase,
} from "@/database/useClientDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";

export default function ClientFormPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ clientId?: string }>();
  const clientDatabase = useClientDatabase();

  const isEditing = !!params.clientId;

  useEffect(() => {
    if (params.clientId) {
      loadClient(Number(params.clientId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.clientId]);

  const loadClient = async (clientId: number) => {
    try {
      const client = await clientDatabase.getById(clientId);

      if (client) loadClientData(client);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar o cliente", error as any);
      router.back();
    }
  };

  function loadClientData(item: IClientDatabase) {
    setId(item.id);
    setNome(item.nome);
    setTelefone(item.telefone);
    setRua(item.rua);
    setNumero(item.numero);
    setBairro(item.bairro);
    setComplemento(item.complemento);
  }

  const [id, setId] = useState(0);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [complemento, setComplemento] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhone = (text: string) => {
    const numbers = text.replace(/\D/g, "");

    const limitedNumbers = numbers.slice(0, 11);

    if (limitedNumbers.length === 0) return "";

    if (limitedNumbers.length <= 2) return limitedNumbers;

    if (limitedNumbers.length <= 6) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    }

    if (limitedNumbers.length <= 10) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(
        2,
        6
      )}-${limitedNumbers.slice(6)}`;
    }

    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(
      2,
      7
    )}-${limitedNumbers.slice(7)}`;
  };

  const formatNumberAddress = (text: string) => {
    const numbers = text.replace(/\D/g, "");

    return numbers;
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    } else {
      const numbers = telefone.replace(/\D/g, "");
      if (numbers.length < 10) {
        newErrors.telefone = "Telefone deve ter pelo menos 10 dígitos";
      }
    }

    if (!rua.trim()) {
      newErrors.rua = "Rua é obrigatória";
    }

    if (!numero.trim()) {
      newErrors.numero = "Número é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function create() {
    try {
      setLoading(true);
      await clientDatabase.create({
        nome,
        telefone,
        rua,
        numero,
        bairro,
        complemento,
      });

      Alert.alert(
        "Sucesso! 🎉",
        `Cliente "${nome}" foi cadastrado com sucesso!`
      );
      router.back();
    } catch (error) {
      Alert.alert(
        "Erro ❌",
        "Não foi possível cadastrar o cliente. Tente novamente.",
        error as any
      );
    } finally {
      setLoading(false);
    }
  }

  async function update() {
    try {
      setLoading(true);
      await clientDatabase.update({
        id: id,
        nome,
        telefone,
        rua,
        numero,
        bairro,
        complemento,
      });

      Alert.alert(
        "Atualizado! ✅",
        `Cliente "${nome}" foi atualizado com sucesso!`
      );
      router.back();
    } catch (error) {
      Alert.alert(
        "Erro ❌",
        "Não foi possível atualizar o cliente. Tente novamente.",
        error as any
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

    clearForm();
  }

  function clearForm() {
    setId(0);
    setNome("");
    setTelefone("");
    setRua("");
    setNumero("");
    setBairro("");
    setComplemento("");
    setErrors({});
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: isEditing ? "Editar Cliente" : "Novo Cliente",
        }}
      />

      <PageContainer edges={["left", "right"]}>
        {/* <ThemedView style={styles.formHeader}>
          <ThemedView style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={id ? "account-edit" : "account-plus"}
              size={32}
              color="#3B82F6"
            />
          </ThemedView>

          <ThemedView style={styles.titleContainer}>
            <ThemedText style={styles.formTitle}>
              {id ? "Editar Cliente" : "Novo Cliente"}
            </ThemedText>
            <ThemedText style={styles.formSubtitle}>
              Preencha os dados abaixo para {id ? "atualizar" : "cadastrar"} o
              cliente.
            </ThemedText>
          </ThemedView>
        </ThemedView> */}

        {/* Campos do Formulário */}
        <ThemedView style={styles.formFields}>
          <UIInput
            label="Nome Completo"
            placeholder="Digite o nome completo"
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              if (errors.nome) setErrors((prev) => ({ ...prev, nome: "" }));
            }}
            error={errors.nome}
            icon="account"
            required
          />

          <UIInput
            label="Telefone"
            placeholder="(67) 99999-9999"
            value={telefone}
            onChangeText={(text) => {
              if (text === telefone) return;

              const formattedText = formatPhone(text);

              setTelefone(formattedText);

              if (errors.telefone)
                setErrors((prev) => ({ ...prev, telefone: "" }));
            }}
            error={errors.telefone}
            icon="phone"
            keyboardType="phone-pad"
            maxLength={15}
            required
          />

          {/* Seção de Endereço */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialCommunityIcons name="home" size={20} color="#6B7280" />
              <ThemedText style={styles.sectionTitle}>Endereço</ThemedText>
            </ThemedView>

            <UIInput
              label="Rua"
              placeholder="Digite o nome da rua"
              value={rua}
              onChangeText={(text) => {
                setRua(text);
                if (errors.rua) setErrors((prev) => ({ ...prev, rua: "" }));
              }}
              error={errors.rua}
              icon="road"
              required
            />

            <UIInput
              label="Número"
              placeholder="123"
              value={numero}
              onChangeText={(text) => {
                const formatNumber = formatNumberAddress(text);
                setNumero(formatNumber);

                if (errors.numero)
                  setErrors((prev) => ({ ...prev, numero: "" }));
              }}
              error={errors.numero}
              icon="numeric"
              keyboardType="numeric"
              required
            />

            <UIInput
              label="Bairro"
              placeholder="Digite o bairro (opcional)"
              value={bairro}
              onChangeText={setBairro}
              icon="map-marker"
            />

            <UIInput
              label="Complemento"
              placeholder="Apartamento, bloco, etc. (opcional)"
              value={complemento}
              onChangeText={setComplemento}
              icon="information"
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
  // Header Styles
  // formHeader: {
  //   flexDirection: "row",
  //   gap: 16,
  //   alignItems: "center",
  //   marginBottom: 32,
  //   // width: "100%",
  // },
  // iconContainer: {
  //   backgroundColor: "#EBF4FF",
  //   padding: 16,
  //   borderRadius: 50,
  // },
  // titleContainer: {
  //   flex: 1,
  //   gap: 4,
  // },
  // formTitle: {
  //   fontSize: 22,
  //   fontWeight: "bold",
  //   color: "#1F2937",
  //   flexWrap: "wrap",
  // },
  // formSubtitle: {
  //   fontSize: 16,
  //   color: "#6B7280",
  //   flexWrap: "wrap",
  // },

  // Form Fields
  formFields: {
    gap: 16,
  },

  // Section Styles
  sectionContainer: {
    paddingTop: 12,
    borderRadius: 12,
    gap: 16,
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

  // Button Styles
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
    backgroundColor: "#1E40AF",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
});
