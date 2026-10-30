import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { initialApplicants } from "../../../data/employer_data/employer_data";

export default function ApplicantsListScreen() {
  const { id } = useLocalSearchParams();
  const [applicants] = useState(initialApplicants.filter(app => app.jobId === id || !id));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Applicants</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={applicants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/employer/applicant-detail/${item.id}`)}
          >
            <View style={styles.row}>
              <View>
                <Text style={styles.name}>{item.applicantName}</Text>
                <Text style={styles.subText}>{item.applicantID} • Applied {item.date_applied}</Text>
              </View>
              <View style={[styles.statusBadge, item.status === 'accepted' ? styles.accepted : item.status === 'rejected' ? styles.rejected : styles.pending]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text numberOfLines={2} style={styles.message}>{item.application_message}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#EEF0F8" },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  list: { padding: 16 },
  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  subText: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  pending: { backgroundColor: "#FEF3C7" },
  accepted: { backgroundColor: "#DCFCE7" },
  rejected: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 10, fontWeight: "bold", color: "#374151" },
  message: { fontSize: 13, color: "#4B5563", marginTop: 8 }
});