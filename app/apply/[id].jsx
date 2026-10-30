
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApplications } from "../../context/ApplicationsContext";
import { useAuth } from "../../context/AuthContext";
import jobs from "../../data/jobs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

const formatSize = (size) =>
  size == null ? "Unknown size" : `${(size / 1024 / 1024).toFixed(2)} MB`;

export default function ApplyForJob() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { hasApplied, applyToJob } = useApplications();

  const job = jobs.find((item) => String(item.id) === String(id));

  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [attachments, setAttachments] = useState([]);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});

  const clearError = (key) =>
    setErrors((prev) => ({ ...prev, [key]: undefined }));

  const pickAttachments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
        ],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const next = [...attachments];
      const rejected = [];

      for (const file of result.assets) {
        const extension = file.name?.split(".").pop()?.toLowerCase();

        const duplicate = next.some(
          (item) => item.name === file.name && item.size === file.size
        );

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
          rejected.push(`${file.name}: unsupported format`);
        } else if (file.size == null) {
          rejected.push(`${file.name}: file size unavailable`);
        } else if (file.size > MAX_FILE_SIZE) {
          rejected.push(`${file.name}: exceeds 10 MB`);
        } else if (duplicate) {
          rejected.push(`${file.name}: already attached`);
        } else if (next.length >= MAX_FILES) {
          rejected.push(`${file.name}: maximum of 10 files`);
        } else {
          next.push({
            name: file.name,
            uri: file.uri,
            size: file.size,
            mimeType: file.mimeType,
          });
        }
      }

      setAttachments(next);

      if (next.length > 0) clearError("attachments");

      if (rejected.length > 0) {
        Alert.alert("Some files were not added", rejected.join("\n"));
      }
    } catch {
      Alert.alert(
        "Attachment failed",
        "We couldn't open those files. Please try again."
      );
    }
  };

  const removeAttachment = (uri) => {
    setAttachments((previous) =>
      previous.filter((file) => file.uri !== uri)
    );
  };

  const handleSubmit = () => {
    const nextErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Please enter your full name.";
    }

    if (!email.trim()) {
      nextErrors.email = "Please enter your email.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Please enter a valid email.";
    }

    if (attachments.length === 0) {
      nextErrors.attachments = "Please attach at least one file.";
    }

    setErrors(nextErrors);

    if (nextErrors.attachments) {
      Alert.alert("Attachment required", nextErrors.attachments);
    }

    if (Object.keys(nextErrors).length > 0) return;

    const result = applyToJob(job.id, {
      fullName: fullName.trim(),
      email: email.trim(),
      attachments,
      note: note.trim(),
    });

    if (!result.success) {
      Alert.alert("Already applied", result.message);
      return;
    }

    Alert.alert(
      "Application sent",
      "You can track it in the Applications tab.",
      [
        { text: "Stay here", onPress: () => router.back() },
        {
          text: "View applications",
          onPress: () => router.navigate("/jobApps"),
        },
      ]
    );
  };

  const alreadyApplied = job ? hasApplied(job.id) : false;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color="#14204A" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Apply for Job</Text>
        <View style={{ width: 42 }} />
      </View>

      {!job ? (
        <View style={styles.center}>
          <Text style={styles.jobTitle}>Job not found</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.jobTitle} numberOfLines={1}>
              {job.title}
            </Text>
            <Text style={styles.jobCompany}>{job.company}</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="John Doe"
              placeholderTextColor="#9AA1B2"
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                clearError("fullName");
              }}
            />
            {!!errors.fullName && (
              <Text style={styles.error}>{errors.fullName}</Text>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="example@gmail.com"
              placeholderTextColor="#9AA1B2"
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(t) => {
                setEmail(t);
                clearError("email");
              }}
            />
            {!!errors.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}

            <Text style={styles.label}>
              Attachments ({attachments.length}/{MAX_FILES})
            </Text>

            <Text style={styles.uploadHint}>
              Add your resume or other supporting documents.
              PDF, DOC, DOCX, JPG, PNG (10 MB each).
            </Text>

            <TouchableOpacity
              style={[
                styles.upload,
                errors.attachments && styles.inputError,
              ]}
              activeOpacity={0.8}
              onPress={pickAttachments}
              disabled={attachments.length >= MAX_FILES}
            >
              <MaterialCommunityIcons
                name="file-plus-outline"
                size={34}
                color="#2623D3"
              />
              <Text style={styles.uploadText}>
                {attachments.length >= MAX_FILES
                  ? "Maximum attachments reached"
                  : "Add Attachments"}
              </Text>
            </TouchableOpacity>

            {!!errors.attachments && (
              <Text style={styles.error}>{errors.attachments}</Text>
            )}

            {attachments.map((file) => (
              <View key={file.uri} style={styles.fileRow}>
                <Feather
                  name="file-text"
                  size={20}
                  color="#2623D3"
                />

                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatSize(file.size)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => removeAttachment(file.uri)}
                  accessibilityLabel={`Remove ${file.name}`}
                  style={styles.removeButton}
                >
                  <Feather name="x" size={20} color="#B42318" />
                </TouchableOpacity>
              </View>
            ))}

            <Text style={styles.label}>Add Text</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write Something here.."
              placeholderTextColor="#9AA1B2"
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submit,
                alreadyApplied && { backgroundColor: "#A1AAC0" },
              ]}
              activeOpacity={0.8}
              disabled={alreadyApplied}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>
                {alreadyApplied ? "Applied" : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#E6E9F2",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#14204A",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111C4B",
    marginTop: 8,
  },
  jobCompany: {
    fontSize: 13,
    color: "#5B6788",
    marginTop: 2,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#14204A",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    color: "#111C4B",
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: { borderColor: "#B42318" },
  textArea: { height: 180, paddingTop: 14 },
  upload: {
    height: 100,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  uploadText: {
    fontSize: 12,
    color: "#5B6788",
    maxWidth: "90%",
  },
  uploadHint: {
    fontSize: 11,
    color: "#8993A8",
    marginBottom: 8,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  fileInfo: { flex: 1 },
  fileName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#14204A",
  },
  fileSize: {
    fontSize: 11,
    color: "#8993A8",
    marginTop: 3,
  },
  removeButton: { padding: 6 },
  error: {
    fontSize: 12,
    color: "#B42318",
    marginTop: 6,
  },
  footer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  submit: {
    backgroundColor: "#2623D3",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
