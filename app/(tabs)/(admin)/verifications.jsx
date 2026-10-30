import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "../../../components/Navigations";
import adminStyles, { STATUS_COLORS } from "../../../components/adminStyles";
import { useAuth } from "../../../context/AuthContext";

const FILTERS = ["Pending", "Verified", "Rejected"];
const isEmployer = (account) => String(account.role || "").toLowerCase().includes("employer");

const formatSize = (bytes) => {
  if (!bytes) return "";
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "—");

function DocumentRow({ file }) {
  const isImage = String(file.mimeType || "").startsWith("image/");

  return (
    <View style={local.docRow}>
      {isImage ? (
        <Image source={{ uri: file.uri }} style={local.thumb} />
      ) : (
        <View style={[local.thumb, local.thumbIcon]}>
          <MaterialCommunityIcons name="file-pdf-box" size={26} color="#E13F58" />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={local.docName} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={adminStyles.meta}>{formatSize(file.size)}</Text>
      </View>
    </View>
  );
}

export default function VerifyEmployers() {
  const { accounts, reviewEmployer } = useAuth();
  const [filter, setFilter] = useState("Pending");

  const employers = accounts.filter(
    (a) => isEmployer(a) && (a.verificationStatus || "Pending") === filter
  );

  const decide = (employer, decision) => {
    const approve = decision === "Verified";

    Alert.alert(
      approve ? "Verify employer?" : "Reject employer?",
      approve
        ? `Confirm that ${employer.companyName || employer.name}'s requirements are valid.`
        : `${employer.companyName || employer.name}'s verification request will be rejected.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: approve ? "Verify" : "Reject",
          style: approve ? "default" : "destructive",
          onPress: () => {
            const result = reviewEmployer(employer.email, decision);
            if (!result.success) Alert.alert("Error", result.message);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={adminStyles.container} edges={["top"]}>
      <TopNav />
      <ScrollView contentContainerStyle={adminStyles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={adminStyles.title}>Verify Employers</Text>
          <Text style={adminStyles.subtitle}>
            Review the requirements employers submitted and approve or reject them.
          </Text>
        </View>

        <View style={adminStyles.chips}>
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[adminStyles.chip, filter === item && adminStyles.chipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[adminStyles.chipText, filter === item && adminStyles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {employers.length === 0 && (
          <Text style={adminStyles.empty}>No {filter.toLowerCase()} employers.</Text>
        )}

        {employers.map((employer) => {
          const status = employer.verificationStatus || "Pending";
          const colors = STATUS_COLORS[status];
          const documents = employer.documents || [];

          return (
            <View key={employer.email} style={adminStyles.card}>
              <View style={adminStyles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={adminStyles.name}>{employer.companyName || employer.name}</Text>
                  {!!employer.branch && <Text style={adminStyles.meta}>Branch: {employer.branch}</Text>}
                  <Text style={adminStyles.meta}>{employer.companyLoc}</Text>
                </View>
                <View style={[adminStyles.badge, { backgroundColor: colors.bg }]}>
                  <Text style={[adminStyles.badgeText, { color: colors.fg }]}>{status}</Text>
                </View>
              </View>

              <Text style={adminStyles.meta}>
                Owner: {employer.name} · {employer.email}
              </Text>
              <Text style={adminStyles.meta}>
                Submitted: {formatDate(employer.verificationSubmittedAt)}
              </Text>

              <Text style={local.docsTitle}>Submitted requirements ({documents.length})</Text>
              {documents.length === 0 ? (
                <Text style={adminStyles.meta}>No documents on file.</Text>
              ) : (
                documents.map((file, index) => (
                  <DocumentRow key={`${file.uri}-${index}`} file={file} />
                ))
              )}

              {status === "Pending" ? (
                <View style={adminStyles.actions}>
                  <TouchableOpacity
                    style={[adminStyles.btn, { borderColor: "#E13F58" }]}
                    onPress={() => decide(employer, "Rejected")}
                  >
                    <Text style={[adminStyles.btnText, { color: "#E13F58" }]}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[adminStyles.btn, { borderColor: "#2623D3", backgroundColor: "#2623D3" }]}
                    onPress={() => decide(employer, "Verified")}
                  >
                    <Text style={[adminStyles.btnText, { color: "#FFFFFF" }]}>Verify</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={adminStyles.meta}>
                  {status} by {employer.reviewedByName || "an admin"} on{" "}
                  {formatDate(employer.reviewedAt)}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  docsTitle: { fontSize: 13, fontWeight: "700", color: "#111C4B", marginTop: 4 },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 8,
  },
  thumb: { width: 44, height: 44, borderRadius: 6, backgroundColor: "#E2E8F0" },
  thumbIcon: { alignItems: "center", justifyContent: "center" },
  docName: { fontSize: 13, color: "#334155", fontWeight: "600" },
});
