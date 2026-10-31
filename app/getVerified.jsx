
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import * as DocumentPicker from "expo-document-picker";

import FormButton from "../components/Button";
import InputField from "../components/InputField";
import { supabase } from "../lib/supabase";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function GetVerified() {
  const [companyName, setCompanyName] = useState("");
  const [branch, setBranch] = useState("");
  const [companyLoc, setCompanyLoc] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pick and test documents
  const handlePickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets) return;

      const newFiles = result.assets;

      if (selectedFiles.length + newFiles.length > MAX_FILES) {
        setError(`You can only upload up to ${MAX_FILES} files.`);
        return;
      }

      const readableFiles = [];

      for (const file of newFiles) {
        if (
          typeof file.size !== "number" ||
          file.size <= 0 ||
          file.size > MAX_FILE_SIZE
        ) {
          setError(`${file.name} must be 10 MB or less.`);
          return;
        }

        if (!ALLOWED_TYPES.includes(file.mimeType)) {
          setError(
            "Only PDF, JPG, PNG, and WebP files are allowed."
          );
          return;
        }

        console.log("Selected file:", file.name);
        console.log("File URI:", file.uri);

        try {
          // Test reading the selected file using fetch
          const response = await fetch(file.uri);

          if (!response.ok) {
            throw new Error("Unable to access selected file.");
          }

          const bytes = await response.arrayBuffer();

          console.log(
            "Fetch read successful:",
            bytes.byteLength
          );

          readableFiles.push(file);
        } catch (readError) {
          console.log(
            "Fetch read failed:",
            readError.message
          );

          setError(
            `Unable to read ${file.name}. Please try another file.`
          );
          return;
        }
      }

      setSelectedFiles((previous) => [
        ...previous,
        ...readableFiles,
      ]);

      setError("");
    } catch (err) {
      console.log("Document picker error:", err);

      setError(
        err.message || "Unable to select documents."
      );
    }
  };

  // Remove a selected document
  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((previous) =>
      previous.filter((_, index) => index !== indexToRemove)
    );
  };

  // Submit employer verification
  const handleSubmitVerification = async () => {
    if (submitting) return;

    if (!companyName.trim()) {
      setError("Please enter your company name.");
      return;
    }

    if (!companyLoc.trim()) {
      setError("Please enter your company location.");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Please upload at least one document.");
      return;
    }

    setError("");
    setSubmitting(true);

    const uploadedPaths = [];

    try {
      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Please log in first.");
      }

      // Check employer verification status
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role, verification_status")
          .eq("id", user.id)
          .single();

      if (profileError) throw profileError;

      if (profile.role !== "Employer") {
        throw new Error(
          "Only employers can submit verification."
        );
      }

      if (profile.verification_status === "Verified") {
        throw new Error(
          "Your employer account is already verified."
        );
      }

      if (profile.verification_status === "Pending") {
        throw new Error(
          "Your verification request is already under review."
        );
      }

      // Upload documents to Supabase Storage
      for (const selectedFile of selectedFiles) {
        const response = await fetch(selectedFile.uri);

        if (!response.ok) {
          throw new Error(
            `Unable to read ${selectedFile.name}.`
          );
        }

        const bytes = await response.arrayBuffer();

        const safeName = selectedFile.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

        const uniqueName =
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}-${safeName}`;

        const filePath = `${user.id}/${uniqueName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("employer-documents")
            .upload(filePath, bytes, {
              contentType: selectedFile.mimeType,
              upsert: false,
            });

        if (uploadError) {
          throw new Error(
            `Failed to upload ${selectedFile.name}: ${uploadError.message}`
          );
        }

        uploadedPaths.push(filePath);
      }

      // Save verification request
      const { error: insertError } = await supabase
        .from("employer_verifications")
        .insert({
          employer_id: user.id,
          company_name: companyName.trim(),
          branch: branch.trim(),
          company_location: companyLoc.trim(),
          document_paths: uploadedPaths,
          status: "Pending",
        });

      if (insertError) throw insertError;

      Alert.alert(
        "Verification Submitted",
        "Your verification request has been submitted successfully. You can continue exploring the app while waiting for approval.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      console.log("Verification error:", err);

      setError(
        err.message ||
          "Something went wrong while submitting verification."
      );

      // Remove uploaded files if submission fails
      if (uploadedPaths.length > 0) {
        const { error: cleanupError } =
          await supabase.storage
            .from("employer-documents")
            .remove(uploadedPaths);

        if (cleanupError) {
          console.log(
            "Upload cleanup failed:",
            cleanupError.message
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={32}
                color="#2623D3"
              />
            </View>

            <Text style={styles.title}>
              Verify Employer Account
            </Text>

            <Text style={styles.subtitle}>
              Submit your business details and documents
              to unlock job posting.
            </Text>

            <View style={styles.form}>
              <InputField
                label="Company Name"
                placeholder="Enter your company name"
                value={companyName}
                onChangeText={setCompanyName}
              />

              <InputField
                label="Branch (Optional)"
                placeholder="Enter company branch"
                value={branch}
                onChangeText={setBranch}
              />

              <InputField
                label="Company Location"
                placeholder="Enter complete company address"
                value={companyLoc}
                onChangeText={setCompanyLoc}
              />

              <Text style={styles.uploadLabel}>
                Business Requirements & Clearances
              </Text>

              <TouchableOpacity
                style={styles.uploadBox}
                onPress={handlePickDocuments}
                disabled={submitting}
              >
                <MaterialCommunityIcons
                  name="cloud-upload-outline"
                  size={32}
                  color="#2623D3"
                />

                <Text style={styles.uploadText}>
                  Tap to upload documents
                </Text>

                <Text style={styles.uploadHint}>
                  PDF or Images • Maximum 10 files • 10 MB each
                </Text>
              </TouchableOpacity>

              {selectedFiles.length > 0 && (
                <View style={styles.filesContainer}>
                  <Text style={styles.filesHeading}>
                    Selected Documents ({selectedFiles.length}/{MAX_FILES})
                  </Text>

                  {selectedFiles.map((file, index) => (
                    <View
                      key={`${file.uri}-${index}`}
                      style={styles.fileItem}
                    >
                      <MaterialCommunityIcons
                        name={
                          file.mimeType === "application/pdf"
                            ? "file-pdf-box"
                            : "file-image-outline"
                        }
                        size={23}
                        color="#2623D3"
                      />

                      <View style={styles.fileInfo}>
                        <Text
                          style={styles.fileName}
                          numberOfLines={1}
                        >
                          {file.name}
                        </Text>

                        <Text style={styles.fileSize}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleRemoveFile(index)}
                        disabled={submitting}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={22}
                          color="#DC2626"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {error !== "" && (
                <Text style={styles.errorText}>
                  {error}
                </Text>
              )}

              {submitting ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator
                    size="small"
                    color="#2623D3"
                  />
                  <Text style={styles.loadingText}>
                    Uploading documents...
                  </Text>
                </View>
              ) : (
                <FormButton
                  btnTitle="Submit for Verification"
                  onPress={handleSubmitVerification}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111C4B",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  form: {
    gap: 12,
  },
  uploadLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginTop: 8,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#A5B4FC",
    borderRadius: 14,
    backgroundColor: "#F8FAFF",
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2623D3",
  },
  uploadHint: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
  },
  filesContainer: {
    marginTop: 8,
    gap: 8,
  },
  filesHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
  fileSize: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 10,
  },
  loadingText: {
    color: "#2623D3",
    fontSize: 13,
    fontWeight: "600",
  },
});
