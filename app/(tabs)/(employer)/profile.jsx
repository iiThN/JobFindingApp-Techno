
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TopNav } from "../../../components/Navigations";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

export default function EmployerProfile() {
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");


  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadProfile = async () => {
        setLoading(true);
        setErrorMessage("");

        try {
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser();

          if (authError) throw authError;
          if (!user) throw new Error("Please log in again.");

          // Kuhaon ang employer account information.
          const { data: profileData, error: profileError } =
            await supabase
              .from("profiles")
              .select("id, name, email, role, verification_status")
              .eq("id", user.id)
              .single();

          if (profileError) throw profileError;

          // Kuhaon ang latest company verification.
          const {
            data: verificationData,
            error: verificationError,
          } = await supabase
            .from("employer_verifications")
            .select(`
              company_name,
              branch,
              company_location,
              status,
              created_at
            `)
            .eq("employer_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (verificationError) throw verificationError;

          if (active) {
            setProfile(profileData);
            setVerification(verificationData);
          }
        } catch (error) {
          if (active) {
            setErrorMessage(
              error.message || "Unable to load employer profile."
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      loadProfile();

      return () => {
        active = false;
      };
    }, [currentUser?.id])
  );


  const name = profile?.name || currentUser?.name || "Employer";
  const email = profile?.email || currentUser?.email || "";
  const verificationStatus =
    profile?.verification_status ||
    verification?.status ||
    "Not Submitted";

  const isVerified =
    verificationStatus.toLowerCase() === "verified";

  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "EM";

  const getStatusStyle = () => {
    switch (verificationStatus.toLowerCase()) {
      case "verified":
        return {
          backgroundColor: "#DCFCE7",
          color: "#15803D",
          icon: "checkmark-circle",
        };
      case "pending":
        return {
          backgroundColor: "#FEF3C7",
          color: "#B45309",
          icon: "time",
        };
      case "rejected":
        return {
          backgroundColor: "#FEE2E2",
          color: "#B91C1C",
          icon: "close-circle",
        };
      default:
        return {
          backgroundColor: "#F1F5F9",
          color: "#64748B",
          icon: "information-circle",
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopNav />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Employer Profile</Text>
          <Text style={styles.subtitle}>
            Your account and company information
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#2623D3" />
            <Text style={styles.stateText}>
              Loading profile...
            </Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerState}>
            <Ionicons
              name="alert-circle-outline"
              size={45}
              color="#B91C1C"
            />
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.replace("/(tabs)/(employer)/profile")}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Account Header */}
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileEmail}>{email}</Text>

              <View style={styles.roleBadge}>
                <Ionicons
                  name="briefcase-outline"
                  size={13}
                  color="#2623D3"
                />
                <Text style={styles.roleText}>
                  Employer Account
                </Text>
              </View>
            </View>

            {/* Personal Information */}
            <Text style={styles.sectionTitle}>
              Account Information
            </Text>

            <View style={styles.infoCard}>
              <InfoRow
                icon="person-outline"
                label="Full Name"
                value={name}
              />
              <View style={styles.divider} />
              <InfoRow
                icon="mail-outline"
                label="Email Address"
                value={email}
              />
              <View style={styles.divider} />
              <InfoRow
                icon="shield-checkmark-outline"
                label="Account Role"
                value={profile?.role || "Employer"}
              />
            </View>

            {/* Company Information */}
            <Text style={styles.sectionTitle}>
              Company Information
            </Text>

            <View style={styles.infoCard}>
              <InfoRow
                icon="business-outline"
                label="Company Name"
                value={verification?.company_name}
              />
              <View style={styles.divider} />
              <InfoRow
                icon="git-branch-outline"
                label="Branch"
                value={verification?.branch}
              />
              <View style={styles.divider} />
              <InfoRow
                icon="location-outline"
                label="Company Location"
                value={verification?.company_location}
              />
            </View>

            {/* Verification Status */}
            <Text style={styles.sectionTitle}>
              Employer Verification
            </Text>

            <View style={styles.verificationCard}>
              <View style={styles.verificationTop}>
                <View
                  style={[
                    styles.verificationIcon,
                    {
                      backgroundColor:
                        statusStyle.backgroundColor,
                    },
                  ]}
                >
                  <Ionicons
                    name={statusStyle.icon}
                    size={25}
                    color={statusStyle.color}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.verificationTitle}>
                    Verification Status
                  </Text>
                  <Text
                    style={[
                      styles.verificationValue,
                      { color: statusStyle.color },
                    ]}
                  >
                    {verificationStatus}
                  </Text>
                </View>
              </View>

              <Text style={styles.verificationDescription}>
                {isVerified
                  ? "Your employer account is verified. You can publish and manage job postings."
                  : verificationStatus.toLowerCase() === "pending"
                  ? "Your verification request is currently under review."
                  : verificationStatus.toLowerCase() === "rejected"
                  ? "Your verification request was rejected. You may submit a new request."
                  : "Complete employer verification to start publishing job postings."}
              </Text>

              {!isVerified &&
                verificationStatus.toLowerCase() !== "pending" && (
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => router.push("/getVerified")}
                  >
                    <Text style={styles.verifyButtonText}>
                      {verificationStatus.toLowerCase() === "rejected"
                        ? "Submit New Verification"
                        : "Get Verified"}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                )}
            </View>

          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={19} color="#2623D3" />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>
          {value || "Not provided"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111C4B",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    gap: 12,
  },
  stateText: {
    fontSize: 13,
    color: "#64748B",
  },
  errorText: {
    fontSize: 13,
    color: "#B91C1C",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2623D3",
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 8,
    elevation: 2,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  avatarText: {
    fontSize: 27,
    fontWeight: "800",
    color: "#2623D3",
  },
  profileName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111C4B",
    textAlign: "center",
  },
  profileEmail: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
    textAlign: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 13,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2623D3",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111C4B",
    marginTop: 24,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111C4B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  verificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  verificationTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  verificationIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  verificationTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111C4B",
  },
  verificationValue: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  verificationDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 19,
    marginTop: 14,
  },
  verifyButton: {
    backgroundColor: "#2623D3",
    paddingVertical: 13,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
