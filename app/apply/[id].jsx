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
import jobs from "../../data/jobseeker_data/jobs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function ApplyForJob() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { hasApplied, applyToJob } = useApplications();

  const job = jobs.find((item) => String(item.id) === String(id));

  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [resume, setResume] = useState(null);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});

  const clearError = (key) => setErrors((prev) => ({ ...prev, [key]: undefined }));

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (file.size && file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({ ...prev, resume: "File is too large. Maximum size is 5 MB." }));
        return;
      }

      setResume({ name: file.name, uri: file.uri, size: file.size });
      clearError("resume");
    } catch {
      Alert.alert("Upload failed", "We couldn't open that file. Please try again.");
    }
  };

  const handleSubmit = () => {
    const nextErrors = {};

    if (!fullName.trim()) nextErrors.fullName = "Please enter your full name.";
    if (!email.trim()) nextErrors.email = "Please enter your email.";
    else if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Please enter a valid email.";
    if (!resume) nextErrors.resume = "Uploading your CV/Resume is required to submit an application.";

    setErrors(nextErrors);

    if (nextErrors.resume) {
      Alert.alert(
        "Resume required",
        "Uploading a resume is required before you can submit a job application."
      );
    }
    if (Object.keys(nextErrors).length > 0) return;

    const result = applyToJob(job.id, {
      fullName: fullName.trim(),
      email: email.trim(),
      resume,
      note: note.trim(),
    });

    if (!result.success) {
      Alert.alert("Already applied", result.message);
      return;
    }

    Alert.alert("Application sent", "You can track it in the Applications tab.", [
      { text: "Stay here", onPress: () => router.back() },
      { text: "View applications", onPress: () => router.navigate("/jobApps") },
    ]);
  };

  const alreadyApplied = job ? hasApplied(job.id) : false;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
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
            {!!errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}

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
            {!!errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <Text style={styles.label}>Upload CV/Resume</Text>
            <TouchableOpacity
              style={[styles.upload, errors.resume && styles.inputError]}
              activeOpacity={0.8}
              onPress={pickResume}
            >
              <MaterialCommunityIcons
                name={resume ? "file-check" : "file-upload"}
                size={34}
                color="#2623D3"
              />
              <Text style={styles.uploadText} numberOfLines={1}>
                {resume ? resume.name : "Browse File"}
              </Text>
              {resume && <Text style={styles.uploadHint}>Tap to replace</Text>}
            </TouchableOpacity>
            {!!errors.resume && <Text style={styles.error}>{errors.resume}</Text>}

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
              style={[styles.submit, alreadyApplied && { backgroundColor: "#A1AAC0" }]}
              activeOpacity={0.8}
              disabled={alreadyApplied}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>{alreadyApplied ? "Applied" : "Submit"}</Text>
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
  topTitle: { fontSize: 16, fontWeight: "600", color: "#14204A" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  jobTitle: { fontSize: 18, fontWeight: "800", color: "#111C4B", marginTop: 8 },
  jobCompany: { fontSize: 13, color: "#5B6788", marginTop: 2, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: "600", color: "#14204A", marginTop: 16, marginBottom: 8 },
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
  uploadText: { fontSize: 12, color: "#5B6788", maxWidth: "90%" },
  uploadHint: { fontSize: 11, color: "#8993A8" },
  error: { fontSize: 12, color: "#B42318", marginTop: 6 },
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
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});