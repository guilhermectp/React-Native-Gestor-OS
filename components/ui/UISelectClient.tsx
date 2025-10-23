import useClientDatabase, {
  IClientDatabase,
} from "@/database/useClientDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";
import UISelectClientModal from "./UISelectClientModal";

interface UIInputProps {
  label?: string;
  clientId?: number;
  onChangeClientId: (text: number) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const UISelectClient: React.FC<UIInputProps> = ({
  label,
  onChangeClientId,
  error,
  required = false,
  disabled,
  clientId,
}) => {
  const clientDatabase = useClientDatabase();

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Cliente
  const [clientNome, setClientNome] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSelectClient(client: IClientDatabase) {
    setClientNome(client.nome);
    setShowClientModal(false);

    if (errors.clientId) {
      setErrors((prev) => ({ ...prev, clientId: "" }));
    }

    onChangeClientId(client.id);
  }

  async function loadInitialClient(clientId: number) {
    try {
      const client = await clientDatabase.getById(clientId);
      if (client) {
        setClientNome(client.nome);
      }
    } catch (error) {
      setClientNome("Erro ao retornar nome do cliente.");
      console.log("Erro ao carregar cliente:", error);
    }
  }

  useEffect(() => {
    if (clientId) {
      loadInitialClient(clientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return (
    <View style={styles.fieldContainer}>
      {label && (
        <ThemedText style={styles.fieldLabel}>
          {label}{" "}
          {required && <ThemedText style={styles.required}>*</ThemedText>}
        </ThemedText>
      )}

      <Pressable
        disabled={disabled}
        onPress={() => setShowClientModal(true)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.inputContainer,
          error && styles.inputError,
          isHovered && styles.inputHover,
          isFocused && styles.inputFocus,
        ]}
      >
        <MaterialCommunityIcons
          name="account"
          size={20}
          color={error ? "#EF4444" : isFocused ? "#3B82F6" : "#6B7280"}
          style={styles.inputIconLeft}
        />

        <ThemedText
          style={[
            styles.clientSelectorText,
            !clientNome && styles.clientSelectorPlaceholder,
          ]}
        >
          {clientNome || "Selecione um cliente"}
        </ThemedText>

        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={error ? "#EF4444" : isFocused ? "#3B82F6" : "#6B7280"}
          style={styles.inputIconRight}
        />
      </Pressable>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      <UISelectClientModal
        visible={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSelectClient={handleSelectClient}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    flex: 1,
    gap: 2,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  required: {
    color: "#EF4444",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    height: 50,
    position: "relative",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputHover: {
    borderColor: "#9CA3AF",
    backgroundColor: "#F3F4F6",
  },
  inputFocus: {
    borderColor: "#3B82F6",
  },
  inputIconLeft: {
    position: "absolute",
    left: 16,
    zIndex: 1,
    top: "50%",
    marginTop: -10,
  },
  inputIconRight: {
    position: "absolute",
    right: 16,
    zIndex: 1,
    top: "50%",
    marginTop: -10,
  },

  clientSelectorText: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 0,
    paddingLeft: 48,
    paddingRight: 48,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  clientSelectorPlaceholder: {
    color: "#9CA3AF",
  },

  errorText: {
    fontSize: 14,
    paddingLeft: 8,
    color: "#EF4444",
  },
});

export default UISelectClient;
