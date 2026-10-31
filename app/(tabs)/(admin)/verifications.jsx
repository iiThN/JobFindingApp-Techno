
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "../../../components/Navigations";
import adminStyles, { STATUS_COLORS } from "../../../components/adminStyles";
import { supabase } from "../../../lib/supabase";

const FILTERS = ["Pending", "Verified", "Rejected"];
const BUCKET = "employer-documents";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "—";

function DocumentRow({ file }) {
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.name);

  const openDocument = async () => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(file.path, 60);

      if (error) throw error;

      await Linking.openURL(data.signedUrl);
    } catch (error) {
      Alert.alert("Document Error", error.message);
    }
  };

  return (
    <TouchableOpacity style={local.docRow} onPress={openDocument}>
      {isImage && file.previewUrl ? (
        <Image source={{ uri: file.previewUrl }} style={local.thumb} />
      ) : (
        <View style={[local.thumb, local.thumbIcon]}>
          <MaterialCommunityIcons
            name={isImage ? "file-image" : "file-pdf-box"}
            size={26}
            color={isImage ? "#2623D3" : "#E13F58"}
          />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={local.docName} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={adminStyles.meta}>Tap to view document</Text>
      </View>

      <MaterialCommunityIcons
        name="open-in-new"
        size={18}
        color="#67759A"
      />
    </TouchableOpacity>
  );
}

export default function VerifyEmployers() {
  const [filter, setFilter] = useState("Pending");
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadVerifications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setErrorMessage("");

    try {
      const { data: requests, error: requestsError } = await supabase
        .from("employer_verifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email");

      if (profilesError) throw profilesError;

      const profileMap = {};
      (profiles || []).forEach((profile) => {
        profileMap[profile.id] = profile;
      });

      const formatted = await Promise.all(
        (requests || []).map(async (request) => {
          const documents = await Promise.all(
            (request.document_paths || []).map(async (path) => {
              const name = path.split("/").pop();
              const isImage = /\.(jpg|jpeg|png|webp)$/i.test(name);

              let previewUrl = null;

              if (isImage) {
                const { data } = await supabase.storage
                  .from(BUCKET)
                  .createSignedUrl(path, 3600);

                previewUrl = data?.signedUrl || null;
              }

              return { path, name, previewUrl };
            })
          );

          return {
            ...request,
            owner: profileMap[request.employer_id],
            reviewer: profileMap[request.reviewed_by],
            documents,
          };
        })
      );

      setEmployers(formatted);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVerifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadVerifications(false);
  };

  const decide = (employer, decision) => {
    const approve = decision === "Verified";

    Alert.alert(
      approve ? "Verify employer?" : "Reject employer?",
      approve
        ? `Confirm that ${employer.company_name}'s requirements are valid.`
        : `${employer.company_name}'s verification request will be rejected.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: approve ? "Verify" : "Reject",
          style: approve ? "default" : "destructive",
          onPress: async () => {
            setReviewingId(employer.id);

            try {
              const { error } = await supabase.rpc("review_employer", {
                p_verification_id: employer.id,
                p_decision: decision,
              });

              if (error) throw error;

              Alert.alert(
                "Success",
                `Employer ${approve ? "verified" : "rejected"} successfully.`
              );

              await loadVerifications(false);
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setReviewingId(null);
            }
          },
        },
      ]
    );
  };

  const filteredEmployers = employers.filter(
    (employer) => employer.status === filter
  );

  return (
    <SafeAreaView style={adminStyles.container} edges={["top"]}>
      <TopNav />

      <ScrollView
        contentContainerStyle={adminStyles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
              style={[
                adminStyles.chip,
                filter === item && adminStyles.chipActive,
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  adminStyles.chipText,
                  filter === item && adminStyles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <ActivityIndicator size="large" color="#2623D3" />}

        {!!errorMessage && (
          <View style={adminStyles.card}>
            <Text style={{ color: "#E13F58" }}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => loadVerifications()}>
              <Text style={{ color: "#2623D3", marginTop: 10 }}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !errorMessage && filteredEmployers.length === 0 && (
          <Text style={adminStyles.empty}>
            No {filter.toLowerCase()} verification requests.
          </Text>
        )}

        {!loading &&
          !errorMessage &&
          filteredEmployers.map((employer) => {
            const status = employer.status;
            const colors = STATUS_COLORS[status] || {
              bg: "#E2E8F0",
              fg: "#334155",
            };

            return (
              <View key={employer.id} style={adminStyles.card}>
                <View style={adminStyles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={adminStyles.name}>
                      {employer.company_name}
                    </Text>

                    {!!employer.branch && (
                      <Text style={adminStyles.meta}>
                        Branch: {employer.branch}
                      </Text>
                    )}

                    <Text style={adminStyles.meta}>
                      {employer.company_location}
                    </Text>
                  </View>

                  <View
                    style={[
                      adminStyles.badge,
                      { backgroundColor: colors.bg },
                    ]}
                  >
                    <Text
                      style={[
                        adminStyles.badgeText,
                        { color: colors.fg },
                      ]}
                    >
                      {status}
                    </Text>
                  </View>
                </View>

                <Text style={adminStyles.meta}>
                  Owner: {employer.owner?.name || "Unknown"} ·{" "}
                  {employer.owner?.email || "No email"}
                </Text>

                <Text style={adminStyles.meta}>
                  Submitted: {formatDate(employer.created_at)}
                </Text>

                <Text style={local.docsTitle}>
                  Submitted requirements ({employer.documents.length})
                </Text>

                {employer.documents.length === 0 ? (
                  <Text style={adminStyles.meta}>
                    No documents on file.
                  </Text>
                ) : (
                  employer.documents.map((file) => (
                    <DocumentRow key={file.path} file={file} />
                  ))
                )}

                {status === "Pending" ? (
                  <View style={adminStyles.actions}>
                    <TouchableOpacity
                      disabled={reviewingId !== null}
                      style={[
                        adminStyles.btn,
                        { borderColor: "#E13F58" },
                      ]}
                      onPress={() => decide(employer, "Rejected")}
                    >
                      <Text
                        style={[
                          adminStyles.btnText,
                          { color: "#E13F58" },
                        ]}
                      >
                        Reject
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={reviewingId !== null}
                      style={[
                        adminStyles.btn,
                        {
                          borderColor: "#2623D3",
                          backgroundColor: "#2623D3",
                        },
                      ]}
                      onPress={() => decide(employer, "Verified")}
                    >
                      <Text
                        style={[
                          adminStyles.btnText,
                          { color: "#FFFFFF" },
                        ]}
                      >
                        {reviewingId === employer.id
                          ? "Processing..."
                          : "Verify"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={adminStyles.meta}>
                    {status} by {employer.reviewer?.name || "an admin"} on{" "}
                    {formatDate(employer.reviewed_at)}
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
  docsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111C4B",
    marginTop: 4,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 8,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
  },
  thumbIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  docName: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
});
