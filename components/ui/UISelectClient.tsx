import useClientDatabase, {
  IClientDatabase,
} from "@/database/useClientDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
    <ThemedView
      style={styles.fieldContainer}
      lightColor="transparent"
      darkColor="transparent"
    >
      {label && (
        <ThemedView
          style={styles.labelContainer}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText
            type="defaultSemiBold"
            lightColor="#111827"
            darkColor="#F9FAFB"
          >
            {label}
          </ThemedText>
          {required && <ThemedText style={styles.requiredText}>*</ThemedText>}
        </ThemedView>
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
          isHovered && !isFocused && styles.inputHover,
          isFocused && styles.inputFocus,
          disabled && styles.inputDisabled,
        ]}
      >
        <ThemedView
          style={styles.inputWrapper}
          lightColor={error ? "#FEF2F2" : "#FFFFFF"}
          darkColor={error ? "#7F1D1D" : "#1F2937"}
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
              { color: isDark ? "#F9FAFB" : "#1F2937" },
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
        </ThemedView>
      </Pressable>

      {error && (
        <ThemedView
          style={styles.errorContainer}
          lightColor="transparent"
          darkColor="transparent"
        >
          <MaterialCommunityIcons
            name="alert-circle"
            size={16}
            color="#EF4444"
            style={styles.errorIcon}
          />
          <ThemedText
            style={styles.errorText}
            lightColor="#EF4444"
            darkColor="#FCA5A5"
          >
            {error}
          </ThemedText>
        </ThemedView>
      )}

      <UISelectClientModal
        visible={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSelectClient={handleSelectClient}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    flex: 1,
    gap: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  requiredText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#EF4444",
  },

  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    height: 50,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputHover: {
    borderColor: "#E5E7EB",
  },
  inputFocus: {
    borderColor: "#3B82F6",
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 7,
    paddingHorizontal: 16,
  },
  inputIconLeft: {
    marginRight: 8,
  },
  inputIconRight: {
    marginLeft: 8,
  },

  clientSelectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  clientSelectorPlaceholder: {
    color: "#9CA3AF",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  errorIcon: {
    marginTop: 1,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
  },
});

export default UISelectClient;
