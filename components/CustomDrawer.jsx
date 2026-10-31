
import { Feather, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import styles from "./drawerStyles";

const menuItems = [
  { label: "Help & Support", icon: "help-circle" },
  { label: "About Us", icon: "info" },
  { label: "Privacy Policy", icon: "shield" },
  { label: "Terms of Service", icon: "file-text" },
];

export default function CustomDrawer(props) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const [verificationStatus, setVerificationStatus] =
    useState(null);

  const isAdmin =
    String(currentUser?.role || "").toLowerCase() === "admin";

  const isEmployer =
    String(currentUser?.role || "")
      .toLowerCase()
      .includes("employer");

  const name =
    (isEmployer && currentUser?.companyName) ||
    currentUser?.name ||
    "Your Account";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const drawerOpen =
    props.state?.history?.some(
      (item) => item.type === "drawer"
    ) || false;

  // Refresh verification status when drawer opens.
  useEffect(() => {
    if (!isEmployer || !currentUser?.id) {
      setVerificationStatus(null);
      return;
    }

    let active = true;

    const loadVerification = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("verification_status")
        .eq("id", currentUser.id)
        .single();

      if (!active) return;

      if (error) {
        setVerificationStatus(null);
        return;
      }

      setVerificationStatus(
        data?.verification_status || "Unverified"
      );
    };

    loadVerification();

    return () => {
      active = false;
    };
  }, [currentUser?.id, isEmployer, drawerOpen]);

  const normalizedStatus = String(
    verificationStatus || ""
  ).toLowerCase();

  const getVerificationBadge = () => {
    switch (normalizedStatus) {
      case "verified":
        return {
          label: "Verified",
          color: "#15803D",
          background: "#DCFCE7",
          icon: "check-circle",
        };

      case "pending":
        return {
          label: "Pending",
          color: "#B45309",
          background: "#FEF3C7",
          icon: "clock",
        };

      case "rejected":
        return {
          label: "Rejected",
          color: "#B91C1C",
          background: "#FEE2E2",
          icon: "x-circle",
        };

      default:
        return {
          label: "Unverified",
          color: "#64748B",
          background: "#F1F5F9",
          icon: "alert-circle",
        };
    }
  };

  const badge = getVerificationBadge();

  const handleLogout = async () => {
    props.navigation.closeDrawer();

    try {
      const result = await logout();

      if (result?.success === false) {
        throw new Error(
          result.message || "Unable to log out."
        );
      }

      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "Logout Failed",
        error.message || "Please try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Brand */}
        <View style={styles.brandRow}>
          <Image
            source={require("../assets/images/inJob-horizontal-dark.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity
            onPress={() => props.navigation.closeDrawer()}
            accessibilityLabel="Close menu"
          >
            <Feather
              name="x"
              size={23}
              color="#111C4B"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.tagline}>
          Find your next opportunity
        </Text>

        {/* Account Information */}
        <View style={styles.accountRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initials}
            </Text>
          </View>

          <View
            style={[
              styles.accountInfo,
              { flex: 1, minWidth: 0 },
            ]}
          >
            {/* Flexible name and verification badge */}
            <View style={localStyles.nameContainer}>
              <Text style={localStyles.accountName}>
                {name}
              </Text>

              {isEmployer && (
                <View
                  style={[
                    localStyles.verificationBadge,
                    {
                      backgroundColor: badge.background,
                    },
                  ]}
                >
                  <Feather
                    name={badge.icon}
                    size={11}
                    color={badge.color}
                  />

                  <Text
                    style={[
                      localStyles.badgeText,
                      { color: badge.color },
                    ]}
                  >
                    {badge.label}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.role}>
              {isAdmin
                ? "Administrator"
                : isEmployer
                ? "Employer"
                : "Job Seeker"}
            </Text>

            {!!currentUser?.email && (
              <Text
                style={styles.email}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {currentUser.email}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* General Menu */}
        <Text style={styles.section}>
          GENERAL
        </Text>

        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(item.label, "Coming soon.")
            }
          >
            <Feather
              name={item.icon}
              size={21}
              color="#59688B"
            />

            <Text style={styles.menuText}>
              {item.label}
            </Text>

            <Feather
              name="chevron-right"
              size={18}
              color="#9AA6C1"
            />
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLogout}
        >
          <Feather
            name="log-out"
            size={21}
            color="#E13F58"
          />

          <Text style={styles.logoutText}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Octicons
          name="briefcase"
          size={24}
          color="#2623D3"
        />

        <Text style={styles.footerText}>
          More opportunities. A brighter future.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  nameContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: 7,
    rowGap: 5,
    width: "100%",
  },

  accountName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111C4B",
    flexShrink: 1,
  },

  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
