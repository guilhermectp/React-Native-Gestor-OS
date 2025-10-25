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
        {/* Header do Formulário */}
        <ThemedView
          style={styles.formHeader}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedView
            style={styles.headerIconContainer}
            lightColor="#EFF6FF"
            darkColor="#1E3A8A"
          >
            <MaterialCommunityIcons
              name={id ? "account-edit" : "account-plus"}
              size={32}
              color="#3B82F6"
            />
          </ThemedView>

          <ThemedView
            style={styles.headerTextContainer}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedText
              style={styles.formTitle}
              lightColor="#111827"
              darkColor="#F9FAFB"
            >
              {id ? "Editar Cliente" : "Novo Cliente"}
            </ThemedText>
            <ThemedText
              style={styles.formSubtitle}
              lightColor="#6B7280"
              darkColor="#9CA3AF"
            >
              Preencha os dados abaixo para {id ? "atualizar" : "cadastrar"} o
              cliente
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Campos do Formulário */}
        <ThemedView
          style={styles.formFields}
          lightColor="transparent"
          darkColor="transparent"
        >
          {/* Seção Dados Pessoais */}
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
                Dados Pessoais
              </ThemedText>
            </ThemedView>

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
          </ThemedView>

          {/* Seção de Endereço */}
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
                <MaterialCommunityIcons name="home" size={20} color="#10B981" />
              </ThemedView>
              <ThemedText
                style={styles.sectionTitle}
                lightColor="#111827"
                darkColor="#F9FAFB"
              >
                Endereço
              </ThemedText>
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
              placeholder="Nome do bairro"
              value={bairro}
              onChangeText={setBairro}
              icon="map-marker"
            />

            <UIInput
              label="Complemento"
              placeholder="Apartamento, bloco, etc."
              value={complemento}
              onChangeText={setComplemento}
              icon="information"
            />
          </ThemedView>
        </ThemedView>

        {/* Botões de Ação */}
        <ThemedView
          style={styles.buttonContainer}
          lightColor="transparent"
          darkColor="transparent"
        >
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              pressed && styles.cancelButtonPressed,
            ]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <ThemedText
              style={styles.cancelButtonText}
              lightColor="#6B7280"
              darkColor="#9CA3AF"
            >
              Cancelar
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.saveButton,
              loading && styles.buttonDisabled,
              pressed && !loading && styles.saveButtonPressed,
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <ThemedText style={styles.saveButtonText}>
                {id ? "Atualizar" : "Cadastrar"}
              </ThemedText>
            )}
          </Pressable>
        </ThemedView>
      </PageContainer>
    </>
  );
}

const styles = StyleSheet.create({
  // Header do Formulário
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    gap: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  formSubtitle: {
    fontSize: 15,
  },

  // Form Fields
  formFields: {
    gap: 20,
  },

  sectionContainer: {
    padding: 20,
    borderRadius: 12,
    gap: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
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

  // Botões
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonPressed: {
    opacity: 0.7,
    backgroundColor: "#F9FAFB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
});
