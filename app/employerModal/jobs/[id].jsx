import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { initialJobList } from "../../../data/employer_data/employer_data";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState(
    initialJobList.find((j) => j.id === id) || initialJobList[0]
  );

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [title, setTitle] = useState(job.title);
  const [position, setPosition] = useState(job.position);
  const [salary, setSalary] = useState(job.salary);
  const [description, setDescription] = useState(job.description);
  const [requirements, setRequirements] = useState(job.requirements);
  const [skills, setSkills] = useState(job.skillRequirements);

  const handleUpdateJob = () => {
    setJob({
      ...job,
      title,
      position,
      salary,
      description,
      requirements,
      skillRequirements: skills,
    });
    setEditModalVisible(false);
    Alert.alert("Success", "Job listing updated successfully!");
  };

  const handleDeleteJob = () => {
    Alert.alert(
      "Delete Job Listing",
      "Are you sure you want to permanently delete this posting? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Deleted", "Job position removed.");
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* Local custom header removed completely since layout handles it */}
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions Floating Bar (Edit / Delete) */}
        <View style={styles.actionToolbar}>
          <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.toolbarBtn}>
            <Feather name="edit-2" size={16} color="#2623D3" />
            <Text style={styles.toolbarEditText}>Edit Job</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteJob} style={[styles.toolbarBtn, styles.deleteToolbarBtn]}>
            <Feather name="trash-2" size={16} color="#DC2626" />
            <Text style={styles.toolbarDeleteText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Company Header Card */}
        <View style={styles.heroCard}>
          <View style={styles.mainAvatarBox}>
            <Text style={styles.mainAvatarText}>{job.companyName[0]}</Text>
          </View>
          <Text style={styles.roleTitle}>{job.title}</Text>
          <Text style={styles.companySubtitle}>{job.companyName}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#2623D3" />
            <Text style={styles.locationText}>Cagayan de Oro • On-Site / Remote</Text>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="cash-outline" size={18} color="#2623D3" />
              <Text style={styles.statLabel}>Salary (Monthly)</Text>
              <Text style={styles.statValue}>{job.salary}</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="briefcase-outline" size={18} color="#2623D3" />
              <Text style={styles.statLabel}>Job Type</Text>
              <Text style={styles.statValue}>{job.position}</Text>
            </View>
          </View>
        </View>

        {/* Detailed Sections */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>About the Role</Text>
          <Text style={styles.bodyText}>{job.description}</Text>

          <Text style={styles.sectionHeading}>Requirements & Credentials</Text>
          <Text style={styles.bodyText}>{job.requirements}</Text>

          <Text style={styles.sectionHeading}>Key Skill Requirements</Text>
          <View style={styles.skillChipRow}>
            {job.skillRequirements.split(",").map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{skill.trim()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Navigate to Candidates Button */}
        <TouchableOpacity
          style={styles.applicantsJumpBtn}
          onPress={() => router.push(`/(tabs)/(employer)/applicants`)}
        >
          <Ionicons name="people" size={20} color="#FFF" />
          <Text style={styles.applicantsJumpText}>View Applicants for this Role ({job.applicantsCount})</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Job Position</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Job Title</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} />

              <Text style={styles.label}>Employment Type</Text>
              <TextInput style={styles.input} value={position} onChangeText={setPosition} />

              <Text style={styles.label}>Salary Range</Text>
              <TextInput style={styles.input} value={salary} onChangeText={setSalary} />

              <Text style={styles.label}>Job Description</Text>
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline value={description} onChangeText={setDescription} />

              <Text style={styles.label}>Requirements</Text>
              <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} multiline value={requirements} onChangeText={setRequirements} />

              <Text style={styles.label}>Skill Requirements</Text>
              <TextInput style={styles.input} value={skills} onChangeText={setSkills} />

              <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateJob}>
                <Text style={styles.submitBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 16, paddingBottom: 40 },
  actionToolbar: { flexDirection: "row", gap: 10, marginBottom: 14 },
  toolbarBtn: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, backgroundColor: "#EEF2FF", paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#C7D2FE" },
  deleteToolbarBtn: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  toolbarEditText: { color: "#2623D3", fontWeight: "700", fontSize: 13 },
  toolbarDeleteText: { color: "#DC2626", fontWeight: "700", fontSize: 13 },
  heroCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#0F172A", shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  mainAvatarBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#2623D3", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  mainAvatarText: { color: "#FFF", fontSize: 26, fontWeight: "bold" },
  roleTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A", textAlign: "center" },
  companySubtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  locationText: { fontSize: 12, color: "#475569", fontWeight: "500" },
  statsGrid: { flexDirection: "row", gap: 12, width: "100%", marginTop: 20 },
  statBox: { flex: 1, backgroundColor: "#F8FAFC", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 6 },
  statValue: { fontSize: 13, fontWeight: "700", color: "#2623D3", marginTop: 2 },
  sectionCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, marginTop: 14, borderWidth: 1, borderColor: "#E2E8F0" },
  sectionHeading: { fontSize: 15, fontWeight: "700", color: "#0F172A", marginTop: 12, marginBottom: 6 },
  bodyText: { fontSize: 13, color: "#475569", lineHeight: 20 },
  skillChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  skillChip: { backgroundColor: "#EEF2FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  skillChipText: { fontSize: 12, fontWeight: "600", color: "#2623D3" },
  applicantsJumpBtn: { backgroundColor: "#2623D3", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, padding: 16, borderRadius: 16, marginTop: 16 },
  applicantsJumpText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%" },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  label: { fontSize: 12, fontWeight: "600", color: "#334155", marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 10, fontSize: 14, backgroundColor: "#F8FAFC" },
  submitBtn: { backgroundColor: "#2623D3", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 20, marginBottom: 20 },
  submitBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 }
});