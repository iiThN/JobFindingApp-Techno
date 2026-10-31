
import { Ionicons } from "@expo/vector-icons";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../../../lib/supabase";

export default function ApplicantDetailScreen() {
  const { id } = useLocalSearchParams();

  const [applicantData, setApplicantData] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openingFile, setOpeningFile] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadApplicant = async () => {
        setLoading(true);

        try {
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser();

          if (authError) throw authError;

          if (!user) {
            throw new Error("Please log in again.");
          }

          const { data, error } = await supabase
            .from("applications")
            .select(`
              id,
              job_id,
              applicant_id,
              full_name,
              email,
              note,
              attachment_paths,
              reply_from_employer,
              status,
              created_at,
              jobs:job_id (
                id,
                title,
                employer_id
              )
            `)
            .eq("id", id)
            .maybeSingle();

          if (error) throw error;

          if (!data || data.jobs?.employer_id !== user.id) {
            throw new Error(
              "Application not found or access denied."
            );
          }

          if (!active) return;

          setApplicantData(data);
          setStatus(data.status);
          setReplyMessage(data.reply_from_employer || "");
        } catch (error) {
          console.log("Applicant detail error:", error);

          if (active) {
            setApplicantData(null);

            Alert.alert(
              "Unable to Load",
              error.message || "Failed to load applicant."
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      loadApplicant();

      return () => {
        active = false;
      };
    }, [id])
  );

  const openAttachment = async (path) => {
    if (openingFile) return;

    setOpeningFile(path);

    try {
      // Temporary link para sa private attachment.
      const { data, error } = await supabase.storage
        .from("application-documents")
        .createSignedUrl(path, 300);

      if (error) throw error;

      if (!data?.signedUrl) {
        throw new Error("Unable to generate file link.");
      }

      await Linking.openURL(data.signedUrl);
    } catch (error) {
      console.log("Open attachment error:", error);

      Alert.alert(
        "Unable to Open File",
        error.message || "Please try again."
      );
    } finally {
      setOpeningFile("");
    }
  };

  const handleUpdateStatus = (newStatus) => {
    if (saving || status !== "Pending") {
      Alert.alert(
        "Action Locked",
        "This application has already been finalized."
      );
      return;
    }

    Alert.alert(
      "Confirm Update",
      `Are you sure you want to mark this applicant as ${newStatus.toLowerCase()}? This action is final.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            setSaving(true);

            try {
              // Save ang final decision sa Supabase.
              const { error } = await supabase.rpc(
                "review_job_application",
                {
                  p_application_id: id,
                  p_status: newStatus,
                  p_reply: replyMessage.trim(),
                }
              );

              if (error) throw error;

              setStatus(newStatus);

              Alert.alert(
                "Success",
                `Applicant status updated to ${newStatus}.`
              );
            } catch (error) {
              console.log("Update application error:", error);

              Alert.alert(
                "Update Failed",
                error.message || "Please try again."
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const isLocked = status !== "Pending";

  const attachments = applicantData?.attachment_paths || [];

  const getFileName = (path) => {
    const fileName = path.split("/").pop();

    try {
      return decodeURIComponent(fileName || "Attachment");
    } catch {
      return fileName || "Attachment";
    }
  };

  const appliedDate = applicantData
    ? new Date(applicantData.created_at).toLocaleDateString(
        "en-PH",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      )
    : "";

  return (
    <SafeAreaView
      style={styles.container}
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen
        options={{
          title: "Applicant Profile",
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator
            size="large"
            color="#2623D3"
          />
        </View>
      ) : !applicantData ? (
        <View style={styles.empty}>
          <Ionicons
            name="document-text-outline"
            size={48}
            color="#9CA3AF"
          />
          <Text style={styles.emptyText}>
            Application unavailable.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.name}>
              {applicantData.full_name}
            </Text>

            <Text style={styles.subText}>
              ID: {applicantData.applicant_id.slice(0, 8)}
              {" • "}Applied: {appliedDate}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.label}>
              Applied Position
            </Text>
            <Text style={styles.value}>
              {applicantData.jobs?.title || "Job unavailable"}
            </Text>

            <Text style={styles.label}>
              Email Address
            </Text>
            <Text style={styles.value}>
              {applicantData.email}
            </Text>

            <Text style={styles.label}>
              Application Message
            </Text>
            <Text style={styles.value}>
              {applicantData.note || "No message provided."}
            </Text>

            <Text style={styles.label}>
              Attached Credentials / Files
            </Text>

            {attachments.length === 0 ? (
              <Text style={styles.value}>
                No attachments.
              </Text>
            ) : (
              attachments.map((path, index) => (
                <TouchableOpacity
                  key={`${path}-${index}`}
                  style={styles.fileContainer}
                  onPress={() => openAttachment(path)}
                  disabled={!!openingFile}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="document-text"
                    size={20}
                    color="#2623D3"
                  />

                  <Text
                    style={styles.fileName}
                    numberOfLines={2}
                  >
                    {getFileName(path)}
                  </Text>

                  {openingFile === path ? (
                    <ActivityIndicator
                      size="small"
                      color="#2623D3"
                    />
                  ) : (
                    <Ionicons
                      name="open-outline"
                      size={18}
                      color="#2623D3"
                    />
                  )}
                </TouchableOpacity>
              ))
            )}

            <Text style={styles.label}>
              Current Status
            </Text>

            <View
              style={[
                styles.badge,
                status === "Accepted"
                  ? styles.accepted
                  : status === "Rejected"
                  ? styles.rejected
                  : styles.pending,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  status === "Accepted"
                    ? styles.acceptedText
                    : status === "Rejected"
                    ? styles.rejectedText
                    : styles.pendingText,
                ]}
              >
                {status.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.label}>
              Employer Reply Note
            </Text>

            <TextInput
              style={[
                styles.input,
                isLocked && styles.disabledInput,
              ]}
              placeholder="Enter feedback or offer details..."
              placeholderTextColor="#9CA3AF"
              value={replyMessage}
              onChangeText={setReplyMessage}
              editable={!isLocked && !saving}
              multiline
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.acceptBtn,
                  (isLocked || saving) && styles.disabledBtn,
                ]}
                disabled={isLocked || saving}
                onPress={() =>
                  handleUpdateStatus("Accepted")
                }
              >
                <Text style={styles.btnText}>
                  Accept Candidate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.rejectBtn,
                  (isLocked || saving) && styles.disabledBtn,
                ]}
                disabled={isLocked || saving}
                onPress={() =>
                  handleUpdateStatus("Rejected")
                }
              >
                <Text style={styles.btnText}>
                  Reject
                </Text>
              </TouchableOpacity>
            </View>

            {saving && (
              <ActivityIndicator
                size="small"
                color="#2623D3"
                style={{ marginTop: 12 }}
              />
            )}

            {isLocked && (
              <Text style={styles.lockNotice}>
                🔒 Status is finalized and locked.
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  subText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 12,
  },
  value: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  pending: {
    backgroundColor: "#FEF3C7",
  },
  accepted: {
    backgroundColor: "#DCFCE7",
  },
  rejected: {
    backgroundColor: "#FEE2E2",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  pendingText: {
    color: "#B45309",
  },
  acceptedText: {
    color: "#166534",
  },
  rejectedText: {
    color: "#991B1B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
    marginTop: 4,
    minHeight: 80,
    textAlignVertical: "top",
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  actionBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptBtn: {
    backgroundColor: "#16A34A",
  },
  rejectBtn: {
    backgroundColor: "#DC2626",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  btnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  lockNotice: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 14,
    fontStyle: "italic",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
