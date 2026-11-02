import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../../components/stylesIn";
import { supabase } from "../../../lib/supabase";

const SUGGESTED_REQUIREMENTS = [
  "Bachelor's Degree in IT/CS", "2+ Years Experience", "Strong Portfolio",
  "Good Communication Skills", "Problem Solving Mindset", "Team Collaboration",
];
const SUGGESTED_SKILLS = [
  "React Native", "React.js", "Node.js", "TypeScript", "JavaScript",
  "UI/UX Design", "Figma", "Python", "PostgreSQL", "Flutter", "Tailwind CSS",
];

const splitItems = (value) =>
  (value || "").split(/,|\n/).map((item) => item.trim()).filter(Boolean);

const parseSalary = (value) => {
  const match = (value || "").match(/\$?\s*([\d,.]+)\s*-\s*\$?\s*([\d,.]+)\s*\/\s*(mo|yr)/i);
  return {
    min: match?.[1] || "",
    max: match?.[2] || "",
    interval: match?.[3]?.toLowerCase() || "mo",
  };
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("Full-Time");
  const [status, setStatus] = useState("Open");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryInterval, setSalaryInterval] = useState("mo");
  const [description, setDescription] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);

  const fillForm = (record) => {
    const salary = parseSalary(record.salary);
    setTitle(record.title || "");
    setPosition(record.job_type || "Full-Time");
    setStatus(record.status || "Open");
    setLocation(record.location || "");
    setSalaryMin(salary.min);
    setSalaryMax(salary.max);
    setSalaryInterval(salary.interval);
    setDescription(record.description || "");
    setSelectedRequirements(splitItems(record.requirements));
    setSelectedSkills(splitItems(record.skills));
    setReqInput("");
    setSkillInput("");
  };

  const loadJob = useCallback(async () => {
    if (typeof id !== "string") return;
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please log in again.");
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("employer_id", user.id)
        .single();
      if (error) throw error;
      setJob(data);
      fillForm(data);
    } catch (error) {
      Alert.alert("Unable to load job", error.message);
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { loadJob(); }, [loadJob]));

  const handleAddRequirement = (value) => {
    const formatted = value.trim();
    if (formatted && !selectedRequirements.includes(formatted)) {
      setSelectedRequirements((prev) => [...prev, formatted]);
    }
    setReqInput("");
  };
  const handleAddSkill = (value) => {
    const formatted = value.trim();
    if (formatted && !selectedSkills.includes(formatted)) {
      setSelectedSkills((prev) => [...prev, formatted]);
    }
    setSkillInput("");
  };

  const handleUpdateJob = async () => {
    if (saving || !job) return;
    if (!title.trim() || !location.trim() || !description.trim()) {
      Alert.alert("Missing Fields", "Please enter a title, location, and description.");
      return;
    }
    if ((salaryMin && !salaryMax) || (!salaryMin && salaryMax)) {
      Alert.alert("Invalid Salary", "Enter both minimum and maximum salary, or leave both empty.");
      return;
    }
    const salary = salaryMin && salaryMax
      ? `$${salaryMin.trim()} - $${salaryMax.trim()} / ${salaryInterval}`
      : null;
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from("jobs")
        .update({
          title: title.trim(),
          job_type: position,
          status,
          location: location.trim(),
          salary,
          description: description.trim(),
          requirements: selectedRequirements.join(", "),
          skills: selectedSkills.join(", "),
        })
        .eq("id", job.id)
        .eq("employer_id", job.employer_id)
        .select()
        .single();
      if (error) throw error;
      setJob(data);
      fillForm(data);
      setEditModalVisible(false);
      Alert.alert("Success", "Job listing updated successfully!");
    } catch (error) {
      Alert.alert("Update Failed", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = () => {
    if (!job || deleting) return;
    Alert.alert(
      "Delete Job Listing",
      "Are you sure you want to permanently delete this posting? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
            const { data, error } = await supabase
              .from("jobs")
              .update({ is_archived: true })
              .eq("id", job.id)
              .eq("employer_id", job.employer_id)
              .select("id");
              if (error) throw error;
              if (!data?.length) throw new Error("The job could not be deleted.");
              router.back();
            } catch (error) {
              Alert.alert("Delete Failed", error.message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => job ? (
        <View style={localStyles.headerRightContainer}>
          <TouchableOpacity
            onPress={() => { fillForm(job); setEditModalVisible(true); }}
            style={localStyles.headerPillBtn}
            activeOpacity={0.7}
          >
            <Text style={localStyles.headerEditText}>Edit</Text>
            <Feather name="edit-2" size={13} color="#2623D3" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteJob}
            style={[localStyles.headerPillBtn, localStyles.deleteHeaderBtn]}
            disabled={deleting}
            activeOpacity={0.7}
          >
            <Text style={localStyles.headerDeleteText}>{deleting ? "Deleting..." : "Delete"}</Text>
            <Feather name="trash-2" size={13} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ) : null,
    });
  }, [navigation, job, deleting]);

  const matchingReqSuggestions = reqInput.trim()
    ? SUGGESTED_REQUIREMENTS.filter((r) => r.toLowerCase().includes(reqInput.toLowerCase()) && !selectedRequirements.includes(r))
    : [];
  const matchingSkillSuggestions = skillInput.trim()
    ? SUGGESTED_SKILLS.filter((s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !selectedSkills.includes(s))
    : [];

  if (loading) {
    return <SafeAreaView style={localStyles.center}><ActivityIndicator size="large" color="#2623D3" /><Text>Loading job...</Text></SafeAreaView>;
  }
  if (!job) {
    return <SafeAreaView style={localStyles.center}><Text>Job not found or access denied.</Text><TouchableOpacity onPress={() => router.back()}><Text style={{ color: "#2623D3", marginTop: 12 }}>Go Back</Text></TouchableOpacity></SafeAreaView>;
  }

  const companyName = "Your Company"; // Company name is not yet stored in jobs/profiles.
  const requirements = splitItems(job.requirements);
  const skills = splitItems(job.skills);
  const isOpen = job.status === "Open";

  return (
    <SafeAreaView style={localStyles.safeAreaContainer} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={localStyles.scrollContentArea} showsVerticalScrollIndicator={false}>
        <View style={styles.detailsHero}>
          <View style={[styles.detailsLogo, { backgroundColor: "#EEF2FF" }]}>
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#2623D3" }}>{companyName[0]}</Text>
          </View>
          <Text style={styles.detailsTitle}>{job.title}</Text>
          <Text style={styles.detailsCompany}>{companyName}</Text>
          <View style={{ marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: isOpen ? "#DCFCE7" : "#FEE2E2" }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: isOpen ? "#166534" : "#991B1B" }}>
              STATUS: {job.status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailsLocation}>
            <Ionicons name="location-outline" size={14} color="#7381A2" />
            <Text style={{ fontSize: 12, color: "#7381A2", fontWeight: "600" }}>{job.location}</Text>
          </View>
        </View>

        <View style={styles.detailsFacts}>
          <View style={styles.detailsFact}>
            <Ionicons name="cash-outline" size={18} color="#2623D3" />
            <Text style={styles.detailsFactLabel}>Salary</Text>
            <Text style={styles.detailsFactValue}>{job.salary || "Not specified"}</Text>
          </View>
          <View style={styles.detailsFact}>
            <Ionicons name="briefcase-outline" size={18} color="#2623D3" />
            <Text style={styles.detailsFactLabel}>Employment Type</Text>
            <Text style={styles.detailsFactValue}>{job.job_type}</Text>
          </View>
        </View>

        <View style={styles.detailsPanel}>
          <View style={localStyles.panelHeaderRow}>
            <Ionicons name="document-text-outline" size={18} color="#2623D3" />
            <Text style={styles.detailsSectionTitle}>About the Role</Text>
          </View>
          <Text style={styles.detailsBody}>{job.description}</Text>
        </View>

        <View style={styles.detailsPanel}>
          <View style={localStyles.panelHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#2623D3" />
            <Text style={styles.detailsSectionTitle}>Requirements & Credentials</Text>
          </View>
          <View style={localStyles.skillChipRow}>
            {requirements.map((req, index) => (
              <View key={`${req}-${index}`} style={[localStyles.skillChip, { backgroundColor: "#F1F5F9", borderColor: "#CBD5E1" }]}>
                <Ionicons name="checkmark-circle" size={12} color="#0F172A" />
                <Text style={[localStyles.skillChipText, { color: "#0F172A" }]}>{req}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.detailsPanel}>
          <View style={localStyles.panelHeaderRow}>
            <Ionicons name="code-slash-outline" size={18} color="#2623D3" />
            <Text style={styles.detailsSectionTitle}>Key Skill Requirements</Text>
          </View>
          <View style={localStyles.skillChipRow}>
            {skills.map((skill, index) => (
              <View key={`${skill}-${index}`} style={localStyles.skillChip}>
                <Text style={localStyles.skillChipText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.detailsFooter}>
        <TouchableOpacity style={styles.detailsApply} activeOpacity={0.85} onPress={() => router.push("/(tabs)/(employer)/applicants")}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Ionicons name="people" size={18} color="#FFF" />
            <Text style={styles.detailsApplyText}>View Applicants</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={editModalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.employerModalContainer} edges={["top", "bottom", "left", "right"]}>
          <View style={styles.employerModalTopBar}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#111C4B" }}>Edit Job Position</Text>
              <Text style={{ fontSize: 12, color: "#7381A2", marginTop: 2 }}>Modify details and listing status</Text>
            </View>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.employerCloseModalBtn} disabled={saving}>
              <Ionicons name="close" size={20} color="#111C4B" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.employerLabel}>Job Title</Text>
            <TextInput style={styles.employerInput} value={title} onChangeText={setTitle} placeholder="Job title" />

            <Text style={styles.employerLabel}>Listing Status</Text>
            <View style={styles.employerToggleRow}>
              {["Open", "Closed"].map((s) => (
                <TouchableOpacity key={s} style={[styles.employerToggleChip, status === s && styles.employerToggleChipActive]} onPress={() => setStatus(s)}>
                  <Text style={[styles.employerToggleChipText, status === s && styles.employerToggleChipTextActive]}>{s.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.employerLabel}>Employment Type</Text>
            <View style={styles.employerToggleRow}>
              {["Full-Time", "Part-Time", "Contract", "Internship"].map((type) => (
                <TouchableOpacity key={type} style={[styles.employerToggleChip, position === type && styles.employerToggleChipActive]} onPress={() => setPosition(type)}>
                  <Text style={[styles.employerToggleChipText, position === type && styles.employerToggleChipTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.employerLabel}>Job Location</Text>
            <TextInput style={styles.employerInput} value={location} onChangeText={setLocation} placeholder="e.g. Cagayan de Oro" />

            <Text style={styles.employerLabel}>Salary Range</Text>
            <View style={styles.employerSalaryRow}>
              <View style={styles.employerCurrencyBox}><Text style={styles.employerCurrencyText}>$</Text></View>
              <TextInput style={[styles.employerInput, { flex: 1, marginTop: 0 }]} placeholder="Min" keyboardType="numeric" value={salaryMin} onChangeText={setSalaryMin} />
              <Text style={{ color: "#7381A2", fontWeight: "700" }}>to</Text>
              <TextInput style={[styles.employerInput, { flex: 1, marginTop: 0 }]} placeholder="Max" keyboardType="numeric" value={salaryMax} onChangeText={setSalaryMax} />
              <TouchableOpacity style={styles.employerIntervalBadge} onPress={() => setSalaryInterval(salaryInterval === "mo" ? "yr" : "mo")}>
                <Text style={styles.employerIntervalText}>/{salaryInterval}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.employerLabel}>Job Description</Text>
            <TextInput style={[styles.employerInput, { height: 100, textAlignVertical: "top" }]} multiline value={description} onChangeText={setDescription} />

            <Text style={styles.employerLabel}>Requirements & Credentials (Interactive Pills)</Text>
            <View style={styles.employerSkillInputContainer}>
              <TextInput style={{ flex: 1, fontSize: 13, color: "#111C4B", paddingVertical: 4 }} placeholder="Type requirement & press enter..." value={reqInput} onChangeText={setReqInput} onSubmitEditing={() => handleAddRequirement(reqInput)} />
              <TouchableOpacity onPress={() => handleAddRequirement(reqInput)} style={styles.employerAddSkillBtn}><Ionicons name="add" size={16} color="#FFF" /></TouchableOpacity>
            </View>
            {matchingReqSuggestions.length > 0 && (
              <View style={styles.employerSuggestionsDropdown}>
                {matchingReqSuggestions.map((suggestion) => (
                  <TouchableOpacity key={suggestion} style={styles.employerSuggestionItem} onPress={() => handleAddRequirement(suggestion)}>
                    <Ionicons name="checkmark-circle-outline" size={13} color="#0F172A" />
                    <Text style={styles.employerSuggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {selectedRequirements.length > 0 && (
              <View style={styles.employerPillsContainer}>
                {selectedRequirements.map((req) => (
                  <View key={req} style={[styles.employerSkillPill, { backgroundColor: "#F1F5F9", borderColor: "#CBD5E1" }]}>
                    <Ionicons name="checkmark-circle" size={12} color="#0F172A" />
                    <Text style={[styles.employerSkillPillText, { color: "#0F172A" }]}>{req}</Text>
                    <TouchableOpacity onPress={() => setSelectedRequirements((prev) => prev.filter((r) => r !== req))}><Ionicons name="close-circle" size={14} color="#0F172A" /></TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.employerLabel, { marginTop: 16 }]}>Key Skill Requirements (Interactive Pills)</Text>
            <View style={styles.employerSkillInputContainer}>
              <TextInput style={{ flex: 1, fontSize: 13, color: "#111C4B", paddingVertical: 4 }} placeholder="Type skill & press enter..." value={skillInput} onChangeText={setSkillInput} onSubmitEditing={() => handleAddSkill(skillInput)} />
              <TouchableOpacity onPress={() => handleAddSkill(skillInput)} style={styles.employerAddSkillBtn}><Ionicons name="add" size={16} color="#FFF" /></TouchableOpacity>
            </View>
            {matchingSkillSuggestions.length > 0 && (
              <View style={styles.employerSuggestionsDropdown}>
                {matchingSkillSuggestions.map((suggestion) => (
                  <TouchableOpacity key={suggestion} style={styles.employerSuggestionItem} onPress={() => handleAddSkill(suggestion)}>
                    <Ionicons name="sparkles" size={12} color="#2623D3" />
                    <Text style={styles.employerSuggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {selectedSkills.length > 0 && (
              <View style={styles.employerPillsContainer}>
                {selectedSkills.map((skill) => (
                  <View key={skill} style={styles.employerSkillPill}>
                    <Text style={styles.employerSkillPillText}>{skill}</Text>
                    <TouchableOpacity onPress={() => setSelectedSkills((prev) => prev.filter((s) => s !== skill))}><Ionicons name="close-circle" size={14} color="#2623D3" /></TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          <View style={styles.detailsFooter}>
            <TouchableOpacity style={styles.detailsApply} onPress={handleUpdateJob} disabled={saving} activeOpacity={0.85}>
              <Text style={styles.detailsApplyText}>{saving ? "Saving..." : "Save Changes"}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeAreaContainer: { flex: 1, backgroundColor: "#F6F8FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, backgroundColor: "#F6F8FF" },
  scrollContentArea: { padding: 20, paddingBottom: 30 },
  panelHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  skillChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  skillChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EEF2FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#E0E7FF" },
  skillChipText: { fontSize: 12, fontWeight: "700", color: "#2623D3" },
  headerRightContainer: { flexDirection: "row", alignItems: "center", gap: 8, marginRight: 4 },
  headerPillBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#EEF2FF", borderWidth: 1, borderColor: "#C7D2FE" },
  deleteHeaderBtn: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  headerEditText: { fontSize: 12, fontWeight: "700", color: "#2623D3" },
  headerDeleteText: { fontSize: 12, fontWeight: "700", color: "#DC2626" },
});
