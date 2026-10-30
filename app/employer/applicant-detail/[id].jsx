import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { initialApplicants } from "../../../data/employer_data/employer_data";

export default function ApplicantDetailScreen() {
  const { id } = useLocalSearchParams();
  const applicantData = initialApplicants.find(a => a.id === id) || initialApplicants[0];

  const [status, setStatus] = useState(applicantData.status);
  const [replyMessage, setReplyMessage] = useState(applicantData.reply_from_employer || "");

  const handleUpdateStatus = (newStatus) => {
    // Check if status was already finalized
    if (status === "accepted" || status === "rejected") {
      Alert.alert(
        "Action Locked", 
        `This application has already been ${status}. Status updates are locked and cannot be changed anymore.`
      );
      return;
    }

    Alert.alert(
      "Confirm Update",
      `Are you sure you want to mark this applicant as ${newStatus}? This action is final.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => {
            setStatus(newStatus);
            Alert.alert("Success", `Applicant status updated to ${newStatus}.`);
          } 
        }
      ]
    );
  };

  const isLocked = status === "accepted" || status === "rejected";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Applicant Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.name}>{applicantData.applicantName}</Text>
          
          {/* Fixed SubText string rendering */}
          <Text style={styles.subText}>
            ID: {applicantData.applicantID} • Applied: {applicantData.date_applied}
          </Text>
          
          <View style={styles.divider} />

          <Text style={styles.label}>Application Message</Text>
          <Text style={styles.value}>{applicantData.application_message}</Text>

          <Text style={styles.label}>Attached Credentials / File</Text>
          <View style={styles.fileContainer}>
            <Ionicons name="document-text" size={20} color="#2623D3" />
            <Text style={styles.fileName}>{applicantData.attached_files}</Text>
          </View>

          <Text style={styles.label}>Current Status</Text>
          <View style={[styles.badge, status === 'accepted' ? styles.accepted : status === 'rejected' ? styles.rejected : styles.pending]}>
            <Text style={[styles.badgeText, status === 'accepted' ? styles.acceptedText : status === 'rejected' ? styles.rejectedText : styles.pendingText]}>
              {status.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.label}>Employer Reply Note</Text>
          <TextInput
            style={[styles.input, isLocked && styles.disabledInput]}
            placeholder="Enter feedback or offer details..."
            placeholderTextColor="#9CA3AF"
            value={replyMessage}
            onChangeText={setReplyMessage}
            editable={!isLocked}
            multiline
          />

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.acceptBtn, isLocked && status !== 'accepted' && styles.disabledBtn]} 
              onPress={() => handleUpdateStatus("accepted")}
            >
              <Text style={styles.btnText}>Accept Candidate</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.rejectBtn, isLocked && status !== 'rejected' && styles.disabledBtn]} 
              onPress={() => handleUpdateStatus("rejected")}
            >
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
          </View>

          {isLocked && (
            <Text style={styles.lockNotice}>🔒 Status is finalized and locked.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#EEF0F8" },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  content: { padding: 16 },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 6, elevation: 2 },
  name: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  subText: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 16 },
  label: { fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 12 },
  value: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
  fileContainer: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F3F4F6", padding: 12, borderRadius: 8, marginTop: 4 },
  fileName: { fontSize: 14, fontWeight: "500", color: "#111827" },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  pending: { backgroundColor: "#FEF3C7" },
  accepted: { backgroundColor: "#DCFCE7" },
  rejected: { backgroundColor: "#FEE2E2" },
  badgeText: { fontSize: 11, fontWeight: "bold" },
  pendingText: { color: "#B45309" },
  acceptedText: { color: "#166534" },
  rejectedText: { color: "#991B1B" },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, padding: 12, fontSize: 14, backgroundColor: "#F9FAFB", marginTop: 4, minHeight: 80, textAlignVertical: 'top' },
  disabledInput: { backgroundColor: "#F3F4F6", color: "#6B7280" },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  actionBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center" },
  acceptBtn: { backgroundColor: "#16A34A" },
  rejectBtn: { backgroundColor: "#DC2626" },
  disabledBtn: { opacity: 0.5 },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  lockNotice: { textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 14, fontStyle: "italic" }
});