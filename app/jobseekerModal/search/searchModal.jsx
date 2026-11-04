import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import styles from "../../../components/stylesIn";

const JOB_TYPES = ["All", "Full-Time", "Part-Time", "Internship / OJT", "Contract"];

export default function SearchModal() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [query, setQuery] = useState(params.query || "");
  const [selectedType, setSelectedType] = useState(params.jobType || "All");
  const [location, setLocation] = useState(params.location || "");
  const [skill, setSkill] = useState(params.skill || "");

  const handleSearch = () => {
    router.replace({
      pathname: "/jobseekerModal/search/searchedDisplay",
      params: {
        query: query.trim(),
        jobType: selectedType,
        location: location.trim(),
        skill: skill.trim(),
      },
    });
  };

  const handleReset = () => {
    setQuery("");
    setSelectedType("All");
    setLocation("");
    setSkill("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top Header */}
        <View style={styles.employerModalTopBar}>
          <TouchableOpacity
            style={styles.employerCloseModalBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={22} color="#111C4B" />
          </TouchableOpacity>
          <Text style={styles.employerModalTitle}>Search Jobs</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={{ color: "#2623D3", fontWeight: "700", fontSize: 13 }}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Search Input */}
          <View>
            <Text style={styles.employerLabel}>Keywords</Text>
            <View style={styles.homeSearchBox}>
              <Feather name="search" size={20} color="#7D87A0" />
              <TextInput
                style={styles.homeSearchInput}
                placeholder="Job title, company, or keyword"
                placeholderTextColor="#9299AB"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                autoFocus
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#9299AB" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Job Type Filter Chips */}
          <View>
            <Text style={styles.employerLabel}>Job Type</Text>
            <View style={styles.employerToggleRow}>
              {JOB_TYPES.map((type) => {
                const active = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.employerToggleChip,
                      active && styles.employerToggleChipActive,
                    ]}
                    onPress={() => setSelectedType(type)}
                  >
                    <Text
                      style={[
                        styles.employerToggleChipText,
                        active && styles.employerToggleChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Location Filter */}
          <View>
            <Text style={styles.employerLabel}>Location</Text>
            <View style={styles.homeSearchBox}>
              <Feather name="map-pin" size={18} color="#7D87A0" />
              <TextInput
                style={styles.homeSearchInput}
                placeholder="City, state, or remote"
                placeholderTextColor="#9299AB"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Skill Filter */}
          <View>
            <Text style={styles.employerLabel}>Specific Skill</Text>
            <View style={styles.homeSearchBox}>
              <Feather name="code" size={18} color="#7D87A0" />
              <TextInput
                style={styles.homeSearchInput}
                placeholder="e.g. React Native, Figma, Python"
                placeholderTextColor="#9299AB"
                value={skill}
                onChangeText={setSkill}
              />
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.employerSubmitBtn}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Text style={styles.employerSubmitBtnText}>Search Jobs</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}