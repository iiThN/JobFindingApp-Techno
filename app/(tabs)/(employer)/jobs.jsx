import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { TopNav } from "../../../components/Navigations";
import { initialJobList } from "../../../data/employer_data/employer_data";
import styles from "../../../components/stylesIn";

const SUGGESTED_SKILLS = [
  "React Native", "React.js", "Node.js", "TypeScript", "JavaScript",
  "UI/UX Design", "Figma", "Python", "PostgreSQL", "Flutter", "Tailwind CSS"
];

const SUGGESTED_REQUIREMENTS = [
  "Bachelor's Degree in IT/CS", "2+ Years Experience", "Strong Portfolio",
  "Good Communication Skills", "Problem Solving Mindset", "Team Collaboration"
];

export default function EmployerJobsScreen() {
  const [jobs, setJobs] = useState([...initialJobList]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // Create Form State
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("Full-Time");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryInterval, setSalaryInterval] = useState("mo");
  const [description, setDescription] = useState("");

  // Requirements Pills State
  const [reqInput, setReqInput] = useState("");
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  
  // Skill Pills State
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);

  useFocusEffect(
    useCallback(() => {
      setJobs([...initialJobList]);
    }, [])
  );

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleCreateJob = () => {
    if (!title || !salaryMin || !salaryMax) {
      Alert.alert("Missing Fields", "Please fill in the Job Title and Salary range.");
      return;
    }

    const formattedSalary = `$${salaryMin} - $${salaryMax} / ${salaryInterval}`;

    const newJob = {
      id: Date.now().toString(),
      title,
      position,
      companyName: "BrioSoft Solutions",
      salary: formattedSalary,
      status: "open",
      applicantsCount: 0,
      description,
      requirements: selectedRequirements.join(", "),
      skillRequirements: selectedSkills.join(", "),
    };

    initialJobList.unshift(newJob);
    setJobs([...initialJobList]);

    // Reset Form
    setModalVisible(false);
    setTitle("");
    setSalaryMin("");
    setSalaryMax("");
    setDescription("");
    setSelectedRequirements([]);
    setSelectedSkills([]);
    
    Alert.alert("Success", "New job position published successfully!");
  };

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
    <SafeAreaView style={styles.homeContainer}>
      <TopNav />

      {/* Header Banner */}
      <View style={styles.employerHeader}>
        <View>
          <Text style={styles.employerHeaderTitle}>My Job Postings</Text>
          <Text style={styles.employerHeaderSubtitle}>Manage and review active vacancies</Text>
        </View>
        <TouchableOpacity style={styles.employerPostBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.employerPostBtnText}>Post Job</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <View style={styles.homeSearchBox}>
          <Ionicons name="search-outline" size={18} color="#7381A2" />
          <TextInput
            style={styles.homeSearchInput}
            placeholder="Search job title or company..."
            placeholderTextColor="#7381A2"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#7381A2" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Job List Feed */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60 }}>
            <Ionicons name="briefcase-outline" size={48} color="#CBD5E1" />
            <Text style={{ fontSize: 14, color: "#7381A2", marginTop: 8, fontWeight: "600" }}>No job postings found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.jobCardCard}
            activeOpacity={0.9}
            onPress={() => router.push(`/employer/jobList/${item.id}`)}
          >
            <View style={styles.jobCardIconBox}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#2623D3" }}>
                {item.companyName[0]}
              </Text>
            </View>

            <View style={styles.jobCardInfo}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Text style={styles.jobCardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: item.status === 'open' ? "#DCFCE7" : "#FEE2E2"
                }}>
                  <Text style={{
                    fontSize: 9,
                    fontWeight: "700",
                    color: item.status === 'open' ? "#166534" : "#991B1B"
                  }}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.jobCardCompany}>{item.companyName}</Text>

              <View style={styles.jobCardMeta}>
                <Text style={styles.jobCardTag}>{item.position}</Text>
                <Text style={styles.jobCardSalary}>{item.salary}</Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 }}>
                <Ionicons name="people-outline" size={13} color="#2623D3" />
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#2623D3" }}>
                  {item.applicantsCount} Applicants
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Fullscreen Enhanced Create Modal with Sticky Bottom Action */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.employerModalContainer} edges={['top', 'bottom', 'left', 'right']}>
          
          <View style={styles.employerModalTopBar}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#111C4B" }}>Create Job Vacancy</Text>
              <Text style={{ fontSize: 12, color: "#7381A2", marginTop: 2 }}>Fill in details to publish your listing</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              style={styles.employerCloseModalBtn}
            >
              <Ionicons name="close" size={20} color="#111C4B" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Content */}
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.employerLabel}>Job Title</Text>
            <TextInput 
              style={styles.employerInput} 
              placeholder="e.g. Senior Full Stack Developer" 
              placeholderTextColor="#94A3B8" 
              value={title} 
              onChangeText={setTitle} 
            />

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

            <Text style={styles.employerLabel}>Salary Range (Automatic Formatting)</Text>
            <View style={styles.employerSalaryRow}>
              <View style={styles.employerCurrencyBox}><Text style={styles.employerCurrencyText}>$</Text></View>
              <TextInput 
                style={[styles.employerInput, { flex: 1, marginTop: 0 }]} 
                placeholder="Min (e.g. 40k)" 
                placeholderTextColor="#94A3B8" 
                keyboardType="numeric"
                value={salaryMin} 
                onChangeText={setSalaryMin} 
              />
              <Text style={{ color: "#7381A2", fontWeight: "700" }}>to</Text>
              <TextInput 
                style={[styles.employerInput, { flex: 1, marginTop: 0 }]} 
                placeholder="Max (e.g. 60k)" 
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
              placeholder="Describe core responsibilities and team context..." 
              placeholderTextColor="#94A3B8" 
              value={description} 
              onChangeText={setDescription} 
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

          {/* Sticky Bottom Action Footer */}
          <View style={styles.detailsFooter}>
            <TouchableOpacity style={styles.detailsApply} onPress={handleCreateJob} activeOpacity={0.85}>
              <Text style={styles.detailsApplyText}>Publish Job Listing</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}