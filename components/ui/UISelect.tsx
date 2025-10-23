import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

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
}

const UISelect: React.FC<UISelectProps> = ({
  label,
  placeholder = "Selecione uma opção",
  value,
  options,
  onValueChange,
  icon,
  disabled,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}

      <Pressable
        disabled={disabled}
        style={[styles.selectButton, isFocused && styles.selectButtonFocused]}
        onPress={() => setModalVisible(true)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon as any}
            size={20}
            color={isFocused ? "#3B82F6" : "#6B7280"}
            style={styles.icon}
          />
        )}

        <ThemedText
          style={[
            styles.selectText,
            !selectedOption && styles.placeholderText,
            icon && styles.selectTextWithIcon,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </ThemedText>

        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={isFocused ? "#3B82F6" : "#6B7280"}
        />
      </Pressable>

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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {label || "Selecione uma opção"}
              </ThemedText>
              <Pressable onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#6B7280"
                />
              </Pressable>
            </View>

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
                <ThemedText
                  style={[
                    styles.optionText,
                    value === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </ThemedText>
                {value === option.value && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color="#3B82F6"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    height: 50,
    paddingHorizontal: 16,
    gap: 8,
  },
  selectButtonFocused: {
    borderColor: "#3B82F6",
    backgroundColor: "white",
  },
  icon: {
    marginRight: 4,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  selectTextWithIcon: {
    marginLeft: 0,
  },
  placeholderText: {
    color: "#9CA3AF",
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
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  optionTextSelected: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});

export default UISelect;
