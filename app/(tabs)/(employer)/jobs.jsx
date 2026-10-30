import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { TopNav } from "../../../components/Navigations";
import { initialJobList } from "../../../data/employer_data/employer_data";

export default function EmployerJobsScreen() {
  const [jobs, setJobs] = useState(initialJobList);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // Create Form State
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("Full-Time");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [skills, setSkills] = useState("");

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateJob = () => {
    if (!title || !salary) {
      Alert.alert("Error", "Please fill in the Job Title and Salary fields.");
      return;
    }

    const newJob = {
      id: Date.now().toString(),
      title,
      position,
      companyName: "BrioSoft Solutions",
      salary,
      status: "open",
      applicantsCount: 0,
      description,
      requirements,
      skillRequirements: skills,
    };

    setJobs([newJob, ...jobs]);
    setModalVisible(false);
    // Reset form
    setTitle("");
    setSalary("");
    setDescription("");
    setRequirements("");
    setSkills("");
    Alert.alert("Success", "New job position posted successfully!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav />

      {/* Header Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Job Postings</Text>
          <Text style={styles.headerSubtitle}>Manage and review active vacancies</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.createButtonText}>Post Job</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#8993A8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search job title or company..."
          placeholderTextColor="#8993A8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={16} color="#8993A8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Job List Feed */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No job postings found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.jobCard}
            activeOpacity={0.9}
            onPress={() => router.push(`/employer/jobs/${item.id}`)}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.companyIconBox}>
                <Text style={styles.companyIconText}>{item.companyName[0]}</Text>
              </View>
              <View style={styles.titleArea}>
                <Text style={styles.jobTitleText}>{item.title}</Text>
                <Text style={styles.companyNameText}>{item.companyName}</Text>
              </View>
              <View style={[styles.statusBadge, item.status === 'open' ? styles.openBadge : styles.closeBadge]}>
                <Text style={[styles.statusBadgeText, item.status === 'open' ? styles.openText : styles.closeText]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Badges Info Row */}
            <View style={styles.badgeRow}>
              <View style={styles.pillTag}>
                <Text style={styles.pillTagText}>{item.position}</Text>
              </View>
              <View style={styles.pillTag}>
                <Text style={styles.pillTagText}>Remote / Hybrid</Text>
              </View>
            </View>

            {/* Card Footer Metric */}
            <View style={styles.cardFooter}>
              <View style={styles.applicantMetric}>
                <Ionicons name="people-outline" size={14} color="#2623D3" />
                <Text style={styles.applicantMetricText}>{item.applicantsCount} Applicants</Text>
              </View>
              <Text style={styles.salaryText}>{item.salary}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Create Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Post New Job Listing</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Job Title</Text>
              <TextInput style={styles.input} placeholder="e.g. Senior Product Designer" value={title} onChangeText={setTitle} />

              <Text style={styles.label}>Employment Type</Text>
              <TextInput style={styles.input} placeholder="Full-Time / Contract" value={position} onChangeText={setPosition} />

              <Text style={styles.label}>Salary Range</Text>
              <TextInput style={styles.input} placeholder="e.g. $40k - $50k / mo" value={salary} onChangeText={setSalary} />

              <Text style={styles.label}>Job Description</Text>
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline placeholder="Describe role responsibilities..." value={description} onChangeText={setDescription} />

              <Text style={styles.label}>Requirements</Text>
              <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} multiline placeholder="Credentials needed..." value={requirements} onChangeText={setRequirements} />

              <Text style={styles.label}>Skill Requirements</Text>
              <TextInput style={styles.input} placeholder="e.g. React Native, Figma, Node.js" value={skills} onChangeText={setSkills} />

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateJob}>
                <Text style={styles.submitBtnText}>Publish Job</Text>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#0F172A" },
  headerSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
  createButton: { backgroundColor: "#2623D3", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  createButtonText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", marginHorizontal: 20, marginTop: 4, height: 46, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: "#0F172A" },
  listContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30 },
  jobCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#F1F5F9", shadowColor: "#0F172A", shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center" },
  companyIconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#EEF2FF", justifyContent: "center", alignItems: "center" },
  companyIconText: { fontSize: 18, fontWeight: "bold", color: "#2623D3" },
  titleArea: { flex: 1, marginLeft: 12 },
  jobTitleText: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  companyNameText: { fontSize: 12, color: "#64748B", marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  openBadge: { backgroundColor: "#DCFCE7" },
  closeBadge: { backgroundColor: "#FEE2E2" },
  statusBadgeText: { fontSize: 10, fontWeight: "700" },
  openText: { color: "#166534" },
  closeText: { color: "#991B1B" },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 12 },
  pillTag: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pillTagText: { fontSize: 11, fontWeight: "500", color: "#475569" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  applicantMetric: { flexDirection: "row", alignItems: "center", gap: 6 },
  applicantMetricText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  salaryText: { fontSize: 14, fontWeight: "700", color: "#2623D3" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { fontSize: 14, color: "#94A3B8", marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%" },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  label: { fontSize: 12, fontWeight: "600", color: "#334155", marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 10, fontSize: 14, backgroundColor: "#F8FAFC" },
  submitBtn: { backgroundColor: "#2623D3", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 20, marginBottom: 20 },
  submitBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 }
});