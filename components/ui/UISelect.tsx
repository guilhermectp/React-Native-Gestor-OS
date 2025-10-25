import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

interface Option {
  label: string;
  value: string;
}

interface UISelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  options: Option[];
  onValueChange: (value: string) => void;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const UISelect: React.FC<UISelectProps> = ({
  label,
  placeholder = "Selecione uma opção",
  value,
  options,
  onValueChange,
  icon,
  disabled,
  required = false,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <ThemedView
      style={styles.container}
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
          {required && (
            <ThemedView
              style={styles.requiredBadge}
              lightColor="#FEE2E2"
              darkColor="#7F1D1D"
            >
              <ThemedText style={styles.requiredText}>Obrigatório</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      )}

      <Pressable
        disabled={disabled}
        style={[
          styles.selectButton,
          error && styles.selectButtonError,
          isHovered && !isFocused && styles.selectButtonHover,
          isFocused && styles.selectButtonFocused,
          disabled && styles.selectButtonDisabled,
        ]}
        onPress={() => setModalVisible(true)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <ThemedView
          style={styles.selectContent}
          lightColor={error ? "#FEF2F2" : "#FFFFFF"}
          darkColor={error ? "#7F1D1D" : "#1F2937"}
        >
          {icon && (
            <MaterialCommunityIcons
              name={icon as any}
              size={20}
              color={error ? "#EF4444" : isFocused ? "#3B82F6" : "#6B7280"}
              style={styles.icon}
            />
          )}

          <ThemedText
            style={[
              styles.selectText,
              { color: isDark ? "#F9FAFB" : "#1F2937" },
              !selectedOption && styles.placeholderText,
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </ThemedText>

          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={error ? "#EF4444" : isFocused ? "#3B82F6" : "#6B7280"}
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

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedView
              style={styles.modalInner}
              lightColor="#FFFFFF"
              darkColor="#1F2937"
            >
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  <MaterialCommunityIcons
                    name={(icon as any) || "format-list-bulleted"}
                    size={24}
                    color="#3B82F6"
                  />
                  <ThemedText
                    style={styles.modalTitle}
                    lightColor="#111827"
                    darkColor="#F9FAFB"
                  >
                    {label || "Selecione uma opção"}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color="#6B7280"
                  />
                </Pressable>
              </View>

              <View style={styles.optionsList}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      value === option.value && styles.optionItemSelected,
                    ]}
                    onPress={() => {
                      onValueChange(option.value);
                      setModalVisible(false);
                    }}
                  >
                    <ThemedView
                      style={styles.optionItemContent}
                      lightColor={
                        value === option.value ? "#EFF6FF" : "transparent"
                      }
                      darkColor={
                        value === option.value ? "#1E3A8A" : "transparent"
                      }
                    >
                      <ThemedText
                        style={[
                          styles.optionText,
                          value === option.value && styles.optionTextSelected,
                        ]}
                        lightColor={
                          value === option.value ? "#3B82F6" : "#374151"
                        }
                        darkColor={
                          value === option.value ? "#60A5FA" : "#D1D5DB"
                        }
                      >
                        {option.label}
                      </ThemedText>
                      {value === option.value && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={20}
                          color="#3B82F6"
                        />
                      )}
                    </ThemedView>
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
  },
  selectButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    height: 50,
  },
  selectButtonError: {
    borderColor: "#EF4444",
  },
  selectButtonHover: {
    borderColor: "#E5E7EB",
  },
  selectButtonFocused: {
    borderColor: "#3B82F6",
  },
  selectButtonDisabled: {
    opacity: 0.6,
  },
  selectContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 7,
    paddingHorizontal: 16,
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  placeholderText: {
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalInner: {
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    gap: 4,
  },
  optionItem: {
    borderRadius: 8,
  },
  optionItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  optionItemSelected: {},
  optionText: {
    fontSize: 16,
  },
  optionTextSelected: {
    fontWeight: "600",
  },
});

export default UISelect;
