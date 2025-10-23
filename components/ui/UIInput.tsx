import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../themed-text";

interface UIInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  icon: string;
  keyboardType?: any;
  maxLength?: number;
  required?: boolean;
  editable?: boolean;
}

const UIInput: React.FC<UIInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  icon,
  keyboardType = "default",
  maxLength,
  required = false,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      {label && (
        <ThemedText style={styles.fieldLabel}>
          {label}{" "}
          {required && <ThemedText style={styles.required}>*</ThemedText>}
        </ThemedText>
      )}

      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={[
          styles.inputContainer,
          error && styles.inputError,
          isHovered && styles.inputHover,
          isFocused && styles.inputFocus,
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={error ? "#EF4444" : isFocused ? "#3B82F6" : "#6B7280"}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          placeholderTextColor="#9CA3AF"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
        />
      </Pressable>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
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
  inputIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
    top: "50%",
    marginTop: -10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 0,
    paddingLeft: 48,
    paddingRight: 16,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  errorText: {
    fontSize: 14,
    paddingLeft: 8,
    color: "#EF4444",
  },
});

export default UIInput;
