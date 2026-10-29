import { Feather } from "@expo/vector-icons";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "../../../components/Navigations";
import styles from "../../../components/stylesIn";
import { useAuth } from "../../../context/AuthContext";

/* ---------- Menus per role ---------- */

const SEEKER_MENU = [
  { icon: "file-text", label: "My Resume", hint: "Upload or replace your CV" },
  { icon: "bookmark", label: "Saved Jobs", hint: "Jobs you bookmarked" },
  { icon: "bell", label: "Job Alerts", hint: "Get notified about new jobs" },
  { icon: "settings", label: "Settings", hint: "Account and privacy" },
  { icon: "help-circle", label: "Help & Support", hint: "Get help with the app" },
];

const EMPLOYER_MENU = [
  { icon: "briefcase", label: "My Job Posts", hint: "Edit, close or reopen jobs" },
  { icon: "users", label: "Applicants", hint: "Review people who applied" },
  { icon: "home", label: "Company Profile", hint: "Logo, about and website" },
  { icon: "bell", label: "Notifications", hint: "New applicants and updates" },
  { icon: "settings", label: "Settings", hint: "Account and privacy" },
  { icon: "help-circle", label: "Help & Support", hint: "Get help with the app" },
];

/* ---------- Small reusable pieces ---------- */

function Stat({ value, label }) {
  return (
    <View style={local.statBox}>
      <Text style={local.statNum}>{value}</Text>
      <Text style={local.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <View style={[styles.homeHeadingRow, { marginBottom: 12 }]}>
      <Feather name={icon} size={20} color="#2623D3" />
      <Text style={styles.homeHeading}>{title}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={local.infoRow}>
      <Feather name={icon} size={17} color="#7381A2" />
      <Text style={local.infoLabel}>{label}</Text>
      <Text style={local.infoValue} numberOfLines={1}>
        {value || "Not set"}
      </Text>
    </View>
  );
}

function MenuList({ items, onPress }) {
  return (
    <View style={local.menuCard}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          style={[
            local.row,
            index < items.length - 1 && local.rowBorder,
          ]}
          onPress={() => onPress(item.label)}
        >
          <View style={local.rowIcon}>
            <Feather name={item.icon} size={20} color="#2623D3" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={local.rowLabel}>{item.label}</Text>
            <Text style={local.rowHint}>{item.hint}</Text>
          </View>

          <Feather name="chevron-right" size={18} color="#8993A8" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ---------- Screen ---------- */

export default function Profile() {
  const { currentUser } = useAuth();

  const isEmployer = String(currentUser?.role || "")
    .toLowerCase()
    .includes("employer");

  const name =
    (isEmployer ? currentUser?.company : null) ||
    currentUser?.name ||
    (isEmployer ? "Your Company" : "Your Name");
  const email = currentUser?.email || "";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Job seeker profile completion (based on whatever fields exist).
  const skills = currentUser?.skills || [];
  const checks = [
    currentUser?.name,
    currentUser?.email,
    currentUser?.phone,
    currentUser?.location,
    skills.length > 0,
    currentUser?.resume,
  ];
  const completion = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );

  const comingSoon = (label) => Alert.alert(label, "Coming soon.");


  return (
    <SafeAreaView style={styles.homeContainer} edges={["top"]}>
      <TopNav />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeContent}
      >
        <View style={styles.homeHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.homeGreeting}>Profile</Text>
            <Text style={styles.homeSubtitle}>
              {isEmployer
                ? "Manage your company and hiring."
                : "Manage your account and job profile."}
            </Text>
          </View>
        </View>

        {/* Header card */}
        <View style={local.profileCard}>
          <View style={[local.avatar, isEmployer && local.avatarSquare]}>
            <Text style={local.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={local.name} numberOfLines={1}>
              {name}
            </Text>
            {!!email && (
              <Text style={local.email} numberOfLines={1}>
                {email}
              </Text>
            )}
            <View style={local.roleBadge}>
              <Text style={local.roleText}>
                {isEmployer ? "Employer" : "Job Seeker"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={local.editBtn}
            onPress={() => comingSoon("Edit profile")}
          >
            <Feather name="edit-2" size={18} color="#2623D3" />
          </TouchableOpacity>
        </View>

        {isEmployer ? (
          <>
            {/* EMPLOYER */}
            <View style={local.statsRow}>
              <Stat value={currentUser?.activeJobs ?? 0} label="Active jobs" />
              <Stat value={currentUser?.applicants ?? 0} label="Applicants" />
              <Stat value={currentUser?.hired ?? 0} label="Hired" />
            </View>

            <TouchableOpacity
              style={local.primaryBtn}
              onPress={() => comingSoon("Post a job")}
            >
              <Feather name="plus-circle" size={19} color="#FFFFFF" />
              <Text style={local.primaryBtnText}>Post a new job</Text>
            </TouchableOpacity>

            <SectionTitle icon="home" title="Company info" />
            <View style={local.panel}>
              <InfoRow icon="tag" label="Industry" value={currentUser?.industry} />
              <InfoRow icon="users" label="Size" value={currentUser?.companySize} />
              <InfoRow icon="map-pin" label="Location" value={currentUser?.location} />
              <InfoRow icon="globe" label="Website" value={currentUser?.website} />
            </View>

            <MenuList items={EMPLOYER_MENU} onPress={comingSoon} />
          </>
        ) : (
          <>
            {/* JOB SEEKER */}
            <View style={local.panel}>
              <View style={local.completionTop}>
                <Text style={local.completionTitle}>Profile completion</Text>
                <Text style={local.completionPct}>{completion}%</Text>
              </View>
              <View style={local.barBg}>
                <View style={[local.barFill, { width: `${completion}%` }]} />
              </View>
              <Text style={local.completionHint}>
                A complete profile gets noticed by employers faster.
              </Text>
            </View>

            <View style={local.statsRow}>
              <Stat value={currentUser?.appliedCount ?? 0} label="Applied" />
              <Stat value={currentUser?.savedCount ?? 0} label="Saved" />
            </View>

            <SectionTitle icon="user" title="About me" />
            <View style={local.panel}>
              <InfoRow icon="phone" label="Phone" value={currentUser?.phone} />
              <InfoRow icon="map-pin" label="Location" value={currentUser?.location} />
              <InfoRow
                icon="briefcase"
                label="Looking for"
                value={currentUser?.desiredJob}
              />
            </View>

            <SectionTitle icon="award" title="Skills" />
            <View style={[local.panel, local.chipWrap]}>
              {skills.length === 0 ? (
                <TouchableOpacity onPress={() => comingSoon("Add skills")}>
                  <Text style={local.addText}>+ Add your skills</Text>
                </TouchableOpacity>
              ) : (
                skills.map((s) => (
                  <View key={s} style={local.chip}>
                    <Text style={local.chipText}>{s}</Text>
                  </View>
                ))
              )}
            </View>

            <MenuList items={SEEKER_MENU} onPress={comingSoon} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDF0F7",
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2623D3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSquare: { borderRadius: 16 },
  avatarText: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  name: { fontSize: 18, fontWeight: "800", color: "#111C4B" },
  email: { fontSize: 13, color: "#7381A2", marginTop: 2 },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E9ECFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: { fontSize: 11, fontWeight: "700", color: "#2623D3" },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E9ECFF",
    alignItems: "center",
    justifyContent: "center",
  },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDF0F7",
  },
  statNum: { fontSize: 20, fontWeight: "800", color: "#111C4B" },
  statLabel: { fontSize: 11, fontWeight: "600", color: "#7381A2", marginTop: 2 },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#2623D3",
    marginBottom: 24,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },

  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDF0F7",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  infoLabel: { fontSize: 13, color: "#7381A2", width: 82 },
  infoValue: { flex: 1, fontSize: 13, fontWeight: "600", color: "#111C4B" },

  completionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  completionTitle: { fontSize: 15, fontWeight: "700", color: "#111C4B" },
  completionPct: { fontSize: 15, fontWeight: "800", color: "#2623D3" },
  barBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E9ECFF",
    overflow: "hidden",
  },
  barFill: { height: 8, borderRadius: 4, backgroundColor: "#2623D3" },
  completionHint: { fontSize: 12, color: "#7381A2", marginTop: 10 },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#E9ECFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: "#2623D3" },
  addText: { fontSize: 14, fontWeight: "700", color: "#2623D3" },

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#EDF0F7",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#EDF0F7" },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E9ECFF",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 15, fontWeight: "700", color: "#111C4B" },
  rowHint: { fontSize: 12, color: "#7381A2", marginTop: 2 },

});
