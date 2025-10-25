import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, useColorScheme } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={[
          styles.inputContainer,
          error && styles.inputError,
          isHovered && !isFocused && styles.inputHover,
          isFocused && styles.inputFocus,
          !editable && styles.inputDisabled,
        ]}
      >
        <ThemedView
          style={styles.inputWrapper}
          lightColor={error ? "#FEF2F2" : "#FFFFFF"}
          darkColor={error ? "#7F1D1D" : "#1F2937"}
        >
          <MaterialCommunityIcons
            name={icon as any}
            size={20}
            color={error ? "#EF4444" : isFocused ? "#3B82F6" : "#6B7280"}
            style={styles.inputIcon}
          />

          <TextInput
            style={[
              styles.input,
              { color: isDark ? "#F9FAFB" : "#1F2937" },
              !editable && styles.inputTextDisabled,
            ]}
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

          {value.length > 0 && maxLength && (
            <ThemedText
              style={styles.charCounter}
              lightColor="#9CA3AF"
              darkColor="#6B7280"
            >
              {value.length}/{maxLength}
            </ThemedText>
          )}
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
    borderColor: "#D1D5DB",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 7,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  inputTextDisabled: {
    opacity: 0.6,
  },
  charCounter: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
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

export default UIInput;
