import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { initialJobList } from "../../../data/employer_data/employer_data";
import styles from "../../../components/stylesIn";

const SUGGESTED_REQUIREMENTS = [
  "Bachelor's Degree in IT/CS", "2+ Years Experience", "Strong Portfolio",
  "Good Communication Skills", "Problem Solving Mindset", "Team Collaboration"
];

const SUGGESTED_SKILLS = [
  "React Native", "React.js", "Node.js", "TypeScript", "JavaScript",
  "UI/UX Design", "Figma", "Python", "PostgreSQL", "Flutter", "Tailwind CSS"
];

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [job, setJob] = useState(
    initialJobList.find((j) => j.id === id) || initialJobList[0]
  );

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [title, setTitle] = useState(job.title);
  const [position, setPosition] = useState(job.position);
  const [status, setStatus] = useState(job.status || "open");
  
  const [salaryMin, setSalaryMin] = useState(job.salary ? job.salary.replace(/[^0-9]/g, "").slice(0, 3) : "");
  const [salaryMax, setSalaryMax] = useState(job.salary ? job.salary.replace(/[^0-9]/g, "").slice(3) : "");
  const [salaryInterval, setSalaryInterval] = useState(job.salary?.includes("yr") ? "yr" : "mo");
  
  const [description, setDescription] = useState(job.description);

  const [reqInput, setReqInput] = useState("");
  const [selectedRequirements, setSelectedRequirements] = useState(
    job.requirements ? job.requirements.split(/,|\n/).map(r => r.trim()).filter(Boolean) : []
  );

  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState(
    job.skillRequirements ? job.skillRequirements.split(",").map(s => s.trim()).filter(Boolean) : []
  );

  const handleAddRequirement = (reqToAdd) => {
    const formatted = reqToAdd.trim();
    if (formatted && !selectedRequirements.includes(formatted)) {
      setSelectedRequirements([...selectedRequirements, formatted]);
    }
    setReqInput("");
  };

  const handleRemoveRequirement = (reqToRemove) => {
    setSelectedRequirements(selectedRequirements.filter((r) => r !== reqToRemove));
  };

  const handleAddSkill = (skillToAdd) => {
    const formatted = skillToAdd.trim();
    if (formatted && !selectedSkills.includes(formatted)) {
      setSelectedSkills([...selectedSkills, formatted]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skillToRemove));
  };

  const handleUpdateJob = () => {
    if (!title) {
      Alert.alert("Error", "Job Title cannot be empty.");
      return;
    }

    const formattedSalary = salaryMin && salaryMax 
      ? `$${salaryMin} - $${salaryMax} / ${salaryInterval}` 
      : job.salary;

    const updatedData = {
      ...job,
      title,
      position,
      status,
      salary: formattedSalary,
      description,
      requirements: selectedRequirements.join(", "),
      skillRequirements: selectedSkills.join(", "),
    };

    setJob(updatedData);
    const index = initialJobList.findIndex((j) => j.id === id);
    if (index !== -1) {
      initialJobList[index] = updatedData;
    }

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
            const index = initialJobList.findIndex((j) => j.id === id);
            if (index !== -1) {
              initialJobList.splice(index, 1);
            }
            router.back();
          },
        },
      ]
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={localStyles.headerRightContainer}>
          <TouchableOpacity 
            onPress={() => setEditModalVisible(true)} 
            style={localStyles.headerPillBtn}
            activeOpacity={0.7}
          >
            <Text style={localStyles.headerEditText}>Edit</Text>
            <Feather name="edit-2" size={13} color="#2623D3" />
          </TouchableOpacity>
  
          <TouchableOpacity 
            onPress={handleDeleteJob} 
            style={[localStyles.headerPillBtn, localStyles.deleteHeaderBtn]}
            activeOpacity={0.7}
          >
            <Text style={localStyles.headerDeleteText}>Delete</Text>
            <Feather name="trash-2" size={13} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [title, position, status, description, selectedRequirements, selectedSkills]);

  const matchingReqSuggestions = reqInput.trim().length > 0
    ? SUGGESTED_REQUIREMENTS.filter(
        (r) => r.toLowerCase().includes(reqInput.toLowerCase()) && !selectedRequirements.includes(r)
      )
    : [];

  const matchingSkillSuggestions = skillInput.trim().length > 0
    ? SUGGESTED_SKILLS.filter(
        (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !selectedSkills.includes(s)
      )
    : [];

  return (
    <SafeAreaView style={localStyles.safeAreaContainer} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={localStyles.scrollContentArea} showsVerticalScrollIndicator={false}>
        
        {/* Hero Header Card */}
        <View style={styles.detailsHero}>
          <View style={[styles.detailsLogo, { backgroundColor: "#EEF2FF" }]}>
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#2623D3" }}>
              {job.companyName[0]}
            </Text>
          </View>
          <Text style={styles.detailsTitle}>{job.title}</Text>
          <Text style={styles.detailsCompany}>{job.companyName}</Text>

          <View style={{
            marginTop: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: job.status === 'open' ? "#DCFCE7" : "#FEE2E2"
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: "700",
              color: job.status === 'open' ? "#166534" : "#991B1B"
            }}>
              STATUS: {job.status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.detailsLocation}>
            <Ionicons name="location-outline" size={14} color="#7381A2" />
            <Text style={{ fontSize: 12, color: "#7381A2", fontWeight: "600" }}>Cagayan de Oro • On-Site / Remote</Text>
          </View>
        </View>

        {/* Quick Facts Grid */}
        <View style={styles.detailsFacts}>
          <View style={styles.detailsFact}>
            <Ionicons name="cash-outline" size={18} color="#2623D3" />
            <Text style={styles.detailsFactLabel}>Salary (Monthly)</Text>
            <Text style={styles.detailsFactValue}>{job.salary}</Text>
          </View>
          <View style={styles.detailsFact}>
            <Ionicons name="briefcase-outline" size={18} color="#2623D3" />
            <Text style={styles.detailsFactLabel}>Employment Type</Text>
            <Text style={styles.detailsFactValue}>{job.position}</Text>
          </View>
        </View>

        {/* About the Role Panel */}
        <View style={styles.detailsPanel}>
          <View style={localStyles.panelHeaderRow}>
            <Ionicons name="document-text-outline" size={18} color="#2623D3" />
            <Text style={styles.detailsSectionTitle}>About the Role</Text>
          </View>
          <Text style={styles.detailsBody}>{job.description}</Text>
        </View>

        {/* Requirements & Credentials Panel */}
        <View style={styles.detailsPanel}>
          <View style={localStyles.panelHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#2623D3" />
            <Text style={styles.detailsSectionTitle}>Requirements & Credentials</Text>
          </View>
          <View style={localStyles.skillChipRow}>
            {selectedRequirements.map((req, index) => (
              <View key={index} style={[localStyles.skillChip, { backgroundColor: "#F1F5F9", borderColor: "#CBD5E1" }]}>
                <Ionicons name="checkmark-circle" size={12} color="#0F172A" />
                <Text style={[localStyles.skillChipText, { color: "#0F172A" }]}>{req}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Key Skill Requirements Panel */}
        <View style={styles.detailsPanel}>
          <View style={localStyles.panelHeaderRow}>
            <Ionicons name="code-slash-outline" size={18} color="#2623D3" />
            <Text style={styles.detailsSectionTitle}>Key Skill Requirements</Text>
          </View>
          <View style={localStyles.skillChipRow}>
            {selectedSkills.map((skill, index) => (
              <View key={index} style={localStyles.skillChip}>
                <Text style={localStyles.skillChipText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Non-scrollable Fixed Bottom Action Bar */}
      <View style={styles.detailsFooter}>
        <TouchableOpacity
          style={styles.detailsApply}
          activeOpacity={0.85}
          onPress={() => router.push(`/employer/applicants`)}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Ionicons name="people" size={18} color="#FFF" />
            <Text style={styles.detailsApplyText}>View Applicants</Text>
            
            <View style={localStyles.countBadgePill}>
              <Text style={localStyles.countBadgeText}>{job.applicantsCount}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Enhanced Edit Modal with Sticky Bottom Save Action */}
      <Modal visible={editModalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.employerModalContainer} edges={['top', 'bottom', 'left', 'right']}>
          
          <View style={styles.employerModalTopBar}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#111C4B" }}>Edit Job Position</Text>
              <Text style={{ fontSize: 12, color: "#7381A2", marginTop: 2 }}>Modify details and listing status</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setEditModalVisible(false)}
              style={styles.employerCloseModalBtn}
            >
              <Ionicons name="close" size={20} color="#111C4B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.employerLabel}>Job Title</Text>
            <TextInput style={styles.employerInput} value={title} onChangeText={setTitle} placeholderTextColor="#94A3B8" />

            <Text style={styles.employerLabel}>Listing Status</Text>
            <View style={styles.employerToggleRow}>
              {["open", "closed"].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.employerToggleChip, status === s && styles.employerToggleChipActive]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.employerToggleChipText, status === s && styles.employerToggleChipTextActive]}>
                    {s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.employerLabel}>Employment Type</Text>
            <View style={styles.employerToggleRow}>
              {["Full-Time", "Part-Time", "Contract", "Internship"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.employerToggleChip, position === type && styles.employerToggleChipActive]}
                  onPress={() => setPosition(type)}
                >
                  <Text style={[styles.employerToggleChipText, position === type && styles.employerToggleChipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.employerLabel}>Salary Range</Text>
            <View style={styles.employerSalaryRow}>
              <View style={styles.employerCurrencyBox}><Text style={styles.employerCurrencyText}>$</Text></View>
              <TextInput 
                style={[styles.employerInput, { flex: 1, marginTop: 0 }]} 
                placeholder="Min" 
                placeholderTextColor="#94A3B8" 
                keyboardType="numeric"
                value={salaryMin} 
                onChangeText={setSalaryMin} 
              />
              <Text style={{ color: "#7381A2", fontWeight: "700" }}>to</Text>
              <TextInput 
                style={[styles.employerInput, { flex: 1, marginTop: 0 }]} 
                placeholder="Max" 
                placeholderTextColor="#94A3B8" 
                keyboardType="numeric"
                value={salaryMax} 
                onChangeText={setSalaryMax} 
              />
              <TouchableOpacity 
                style={styles.employerIntervalBadge}
                onPress={() => setSalaryInterval(salaryInterval === "mo" ? "yr" : "mo")}
              >
                <Text style={styles.employerIntervalText}>/{salaryInterval}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.employerLabel}>Job Description</Text>
            <TextInput 
              style={[styles.employerInput, { height: 100, textAlignVertical: 'top' }]} 
              multiline 
              value={description} 
              onChangeText={setDescription} 
              placeholderTextColor="#94A3B8" 
            />

            <Text style={styles.employerLabel}>Requirements & Credentials (Interactive Pills)</Text>
            <View style={styles.employerSkillInputContainer}>
              <TextInput 
                style={{ flex: 1, fontSize: 13, color: "#111C4B", paddingVertical: 4 }}
                placeholder="Type requirement & press enter..." 
                placeholderTextColor="#94A3B8"
                value={reqInput}
                onChangeText={setReqInput}
                onSubmitEditing={() => handleAddRequirement(reqInput)}
              />
              <TouchableOpacity onPress={() => handleAddRequirement(reqInput)} style={styles.employerAddSkillBtn}>
                <Ionicons name="add" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            {matchingReqSuggestions.length > 0 && (
              <View style={styles.employerSuggestionsDropdown}>
                {matchingReqSuggestions.map((suggestion) => (
                  <TouchableOpacity 
                    key={suggestion} 
                    style={styles.employerSuggestionItem}
                    onPress={() => handleAddRequirement(suggestion)}
                  >
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
                    <TouchableOpacity onPress={() => handleRemoveRequirement(req)}>
                      <Ionicons name="close-circle" size={14} color="#0F172A" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.employerLabel, { marginTop: 16 }]}>Key Skill Requirements (Interactive Pills)</Text>
            <View style={styles.employerSkillInputContainer}>
              <TextInput 
                style={{ flex: 1, fontSize: 13, color: "#111C4B", paddingVertical: 4 }}
                placeholder="Type skill & press enter..." 
                placeholderTextColor="#94A3B8"
                value={skillInput}
                onChangeText={setSkillInput}
                onSubmitEditing={() => handleAddSkill(skillInput)}
              />
              <TouchableOpacity onPress={() => handleAddSkill(skillInput)} style={styles.employerAddSkillBtn}>
                <Ionicons name="add" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            {matchingSkillSuggestions.length > 0 && (
              <View style={styles.employerSuggestionsDropdown}>
                {matchingSkillSuggestions.map((suggestion) => (
                  <TouchableOpacity 
                    key={suggestion} 
                    style={styles.employerSuggestionItem}
                    onPress={() => handleAddSkill(suggestion)}
                  >
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
                    <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                      <Ionicons name="close-circle" size={14} color="#2623D3" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

          </ScrollView>

          {/* Sticky Bottom Save Action Footer */}
          <View style={styles.detailsFooter}>
            <TouchableOpacity style={styles.detailsApply} onPress={handleUpdateJob} activeOpacity={0.85}>
              <Text style={styles.detailsApplyText}>Save Changes</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#F6F8FF",
  },
  scrollContentArea: {
    padding: 20,
    paddingBottom: 30,
  },
  panelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  skillChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2623D3",
  },
  countBadgePill: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 4,
  },
  headerPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  deleteHeaderBtn: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  headerEditText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2623D3",
  },
  headerDeleteText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
});