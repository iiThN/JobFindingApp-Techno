import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import FormButton from "../components/Button";

import InputField from "../components/InputField";
import styles from "../components/styles";

import { useAuth } from "../context/AuthContext";
import { validateGetVerified } from "../validations/authValidation";

export default function GetVerified() {
  const { role, name, email, password } = useLocalSearchParams();
  const { register } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [branch, setBranch] = useState("");
  const [companyLoc, setCompanyLoc] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");

  const handlePickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        setSelectedFiles((previousFiles) => [
          ...previousFiles,
          ...result.assets,
        ]);

        setError("");
      }
    } catch (error) {
      console.log("Error picking file:", error);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((previousFiles) =>
      previousFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleRegisterEmployer = () => {
    const validationError = validateGetVerified(
      companyName,
      companyLoc,
      selectedFiles
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    const result = register({
      name: String(name),
      email: String(email),
      password: String(password),
      role: String(role || "Employer"),
      companyName,
      companyLoc,
      branch,
      verificationPending: true,
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    Alert.alert(
      "Account Created Successfully",
      "Your registration was successful, but your verification request is still being processed. We'll get back to you soon.",
      [
        {
          text: "OK",
          onPress: () => router.replace("/login"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Verify Employer Account</Text>

            <Text style={styles.subtitle}>
              Submit your business details and compliance documents for
              verification.
            </Text>

            <View style={styles.form}>
              <InputField
                label="Company Name"
                placeholder="Enter your company name"
                value={companyName}
                onChangeText={(text) => {
                  setCompanyName(text);
                  setError("");
                }}
              />

              <InputField
                label="Branch"
                placeholder="Enter branch, leave blank if none"
                value={branch}
                onChangeText={(text) => {
                  setBranch(text);
                  setError("");
                }}
              />

              <InputField
                label="Company Location"
                placeholder="Complete address of the company"
                value={companyLoc}
                onChangeText={(text) => {
                  setCompanyLoc(text);
                  setError("");
                }}
              />

              <View style={styles.uploadContainer}>
                <Text style={styles.uploadLabel}>
                  Business Requirements & Clearances
                </Text>

                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={handlePickDocuments}
                >
                  <MaterialCommunityIcons
                    name="file-multiple-outline"
                    size={28}
                    color="#2623D3"
                  />

                  <Text style={styles.uploadText}>
                    Tap to upload PDFs or Images
                  </Text>
                </TouchableOpacity>

                {selectedFiles.map((file, index) => (
                  <View key={`${file.uri}-${index}`} style={styles.fileItem}>
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={20}
                      color="#2623D3"
                    />

                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>

                    <TouchableOpacity
                      onPress={() => handleRemoveFile(index)}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={20}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {error !== "" && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <FormButton
                btnTitle="Register"
                onPress={handleRegisterEmployer}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}