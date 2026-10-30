import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "../../../components/Navigations";
import styles from "../../../components/stylesIn";
import { useAuth } from "../../../context/AuthContext";

const SEEKER_MENU = [
  { icon: "file-text", label: "My Resume", hint: "Upload or replace your CV" },
  { icon: "bookmark", label: "Saved Jobs", hint: "Jobs you bookmarked" },
  { icon: "bell", label: "Job Alerts", hint: "Manage job alert preferences" },
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

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  secureTextEntry,
}) {
  return (
    <View style={{ marginBottom: 13 }}>
      <Text style={local.fieldLabel}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#9AA4B8"
        keyboardType={keyboardType || "default"}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        style={[
          local.input,
          multiline && {
            minHeight: 84,
            textAlignVertical: "top",
          },
        ]}
      />
    </View>
  );
}

export default function Profile() {
  const { currentUser, updateCurrentUser } = useAuth();

  const [editVisible, setEditVisible] = useState(false);
  const [draft, setDraft] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [alertsEnabled, setAlertsEnabled] = useState(
    currentUser?.jobAlertsEnabled ?? true
  );
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const skills = Array.isArray(currentUser?.skills)
    ? currentUser.skills
    : [];

  const completion = useMemo(() => {
    const checks = [
      currentUser?.name,
      currentUser?.email,
      currentUser?.phone,
      currentUser?.location,
      skills.length > 0,
      currentUser?.resume,
    ];

    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  }, [currentUser, skills.length]);

  // Open the edit profile form.
  const startEdit = () => {
    setDraft({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      location: currentUser?.location || "",
      desiredJob: currentUser?.desiredJob || "",
      bio: currentUser?.bio || "",
    });

    setEditVisible(true);
  };

  // Validate and save profile information.
  const saveProfile = () => {
    if (!draft.name?.trim()) {
      Alert.alert("Name required", "Please enter your full name.");
      return;
    }

    if (
      !draft.email?.trim() ||
      !/^\S+@\S+\.\S+$/.test(draft.email.trim())
    ) {
      Alert.alert(
        "Valid email required",
        "Please enter a valid email address."
      );
      return;
    }

    updateCurrentUser({
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim().toLowerCase(),
    });

    setEditVisible(false);

    Alert.alert(
      "Profile updated",
      "Your profile details have been updated."
    );
  };

  // Add a skill to the user's profile.
  const addSkill = () => {
    const nextSkill = skillInput.trim();

    if (!nextSkill) {
      Alert.alert("Empty skill", "Please enter a skill first.");
      return;
    }

    if (
      skills.some(
        (skill) => skill.toLowerCase() === nextSkill.toLowerCase()
      )
    ) {
      Alert.alert(
        "Skill already added",
        "This skill is already on your profile."
      );
      return;
    }

    updateCurrentUser({
      skills: [...skills, nextSkill],
    });

    setSkillInput("");
  };

  // Remove a skill.
  const removeSkill = (skill) => {
    updateCurrentUser({
      skills: skills.filter((item) => item !== skill),
    });
  };

  // Select a resume from the device.
  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];

      if (!file) return;

      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert(
          "File too large",
          "Please choose a PDF or DOC/DOCX resume up to 5 MB."
        );
        return;
      }

      const extension = (file.name || "")
        .split(".")
        .pop()
        ?.toLowerCase();

      if (extension && !["pdf", "doc", "docx"].includes(extension)) {
        Alert.alert(
          "Unsupported file",
          "Please choose a PDF or DOC/DOCX resume."
        );
        return;
      }

      updateCurrentUser({
        resume: {
          name: file.name || "Resume",
          uri: file.uri,
          size: file.size || null,
          mimeType: file.mimeType || null,
        },
      });

      Alert.alert(
        "Resume attached",
        `${file.name || "Your resume"} has been added. Backend upload is not connected yet.`
      );
    } catch (error) {
      Alert.alert(
        "Unable to select file",
        "Please try selecting your resume again."
      );
    }
  };

  // Handle profile menu actions.
  const onMenuPress = (label) => {
    if (label === "My Resume") {
      const buttons = [
        { text: "Cancel", style: "cancel" },
        {
          text: currentUser?.resume ? "Replace resume" : "Choose resume",
          onPress: pickResume,
        },
      ];

      if (currentUser?.resume) {
        buttons.push({
          text: "Remove resume",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Remove resume?",
              "Are you sure you want to remove your resume?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: () => updateCurrentUser({ resume: null }),
                },
              ]
            );
          },
        });
      }

      Alert.alert(
        "My Resume",
        currentUser?.resume?.name
          ? `Current file: ${currentUser.resume.name}`
          : "You have not added a resume yet.",
        buttons
      );
    } else if (label === "Saved Jobs") {
      Alert.alert(
        "Saved Jobs",
        "Open the Saved tab at the bottom of the app to view your bookmarked jobs."
      );
    } else if (label === "Job Alerts") {
      Alert.alert(
        "Job Alerts",
        "Would you like to change your job alert preference?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: alertsEnabled ? "Turn off alerts" : "Turn on alerts",
            onPress: () => {
              const next = !alertsEnabled;

              setAlertsEnabled(next);
              updateCurrentUser({ jobAlertsEnabled: next });

              Alert.alert(
                "Job alerts updated",
                next ? "Job alerts are enabled." : "Job alerts are disabled."
              );
            },
          },
        ]
      );
    } else if (label === "Settings") {
      setSettingsVisible(true);
    } else if (label === "Help & Support") {
      Alert.alert(
        "Help & Support",
        "For help with inJob, contact your project administrator or development team. Support messaging is not connected yet."
      );
    }
  };

  // Validate and change the password.
  const changePassword = () => {
    if (!oldPassword || oldPassword !== currentUser?.password) {
      Alert.alert(
        "Check current password",
        "The current password you entered is incorrect."
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Password too short",
        "Use at least 6 characters for the new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Passwords do not match",
        "Please make sure both new password fields match."
      );
      return;
    }

    updateCurrentUser({ password: newPassword });

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordVisible(false);

    Alert.alert(
      "Password updated",
      "Your password has been changed for this app session."
    );
  };

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
              Manage your account and job profile.
            </Text>
          </View>
        </View>

        {/* Profile header */}
        <View style={local.profileCard}>
          <View style={local.avatar}>
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
              <Text style={local.roleText}>Job Seeker</Text>
            </View>
          </View>

          <TouchableOpacity style={local.editBtn} onPress={startEdit}>
            <Feather name="edit-2" size={18} color="#2623D3" />
          </TouchableOpacity>
        </View>

        {/* Profile completion */}
        <View style={local.panel}>
          <View style={local.completionTop}>
            <Text style={local.completionTitle}>Profile completion</Text>
            <Text style={local.completionPct}>{completion}%</Text>
          </View>

          <View style={local.barBg}>
            <View
              style={[
                local.barFill,
                { width: `${completion}%` },
              ]}
            />
          </View>

          <Text style={local.completionHint}>
            A complete profile helps employers understand your qualifications.
          </Text>
        </View>

        {/* Application statistics */}
        <View style={local.statsRow}>
          <Stat value={currentUser?.appliedCount ?? 0} label="Applied" />
          <Stat value={currentUser?.savedCount ?? 0} label="Saved" />
        </View>

        {/* Personal information */}
        <SectionTitle icon="user" title="About me" />

        <View style={local.panel}>
          <InfoRow
            icon="phone"
            label="Phone"
            value={currentUser?.phone}
          />

          <InfoRow
            icon="map-pin"
            label="Location"
            value={currentUser?.location}
          />

          <InfoRow
            icon="briefcase"
            label="Looking for"
            value={currentUser?.desiredJob}
          />

          <InfoRow
            icon="file-text"
            label="Resume"
            value={currentUser?.resume?.name || "Not added"}
          />

          {currentUser?.bio ? (
            <Text style={local.bio}>{currentUser.bio}</Text>
          ) : null}

          <TouchableOpacity
            style={local.inlineAction}
            onPress={startEdit}
          >
            <Feather name="edit-3" size={15} color="#2623D3" />
            <Text style={local.inlineActionText}>
              Edit personal information
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skills */}
        <SectionTitle icon="award" title="Skills" />

        <View style={[local.panel, local.chipWrap]}>
          {skills.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={local.chip}
              onPress={() =>
                Alert.alert(
                  skill,
                  "Remove this skill from your profile?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Remove",
                      style: "destructive",
                      onPress: () => removeSkill(skill),
                    },
                  ]
                )
              }
            >
              <Text style={local.chipText}>{skill}</Text>
              <Feather name="x" size={12} color="#2623D3" />
            </TouchableOpacity>
          ))}

          {skills.length === 0 && (
            <Text style={local.emptySkills}>
              Add skills to help employers understand your strengths.
            </Text>
          )}

          <View style={local.skillInputRow}>
            <TextInput
              value={skillInput}
              onChangeText={setSkillInput}
              placeholder="e.g. React Native"
              placeholderTextColor="#9AA4B8"
              style={[local.input, { flex: 1, marginBottom: 0 }]}
              onSubmitEditing={addSkill}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={local.addSkillBtn}
              onPress={addSkill}
            >
              <Feather name="plus" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Job alerts */}
        <View style={local.alertPanel}>
          <View style={local.alertIcon}>
            <Feather name="bell" size={19} color="#2623D3" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={local.rowLabel}>Job alerts</Text>
            <Text style={local.rowHint}>
              Manage your job alert preference
            </Text>
          </View>

          <Switch
            value={alertsEnabled}
            onValueChange={(value) => {
              setAlertsEnabled(value);
              updateCurrentUser({ jobAlertsEnabled: value });
            }}
            trackColor={{
              false: "#D8DDEA",
              true: "#B9B7FF",
            }}
            thumbColor={alertsEnabled ? "#2623D3" : "#FFFFFF"}
          />
        </View>

        {/* Menu options */}
        <MenuList items={SEEKER_MENU} onPress={onMenuPress} />
      </ScrollView>

      {/* Edit profile modal */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={local.modalShade}
        >
          <View style={local.modalCard}>
            <View style={local.modalHeader}>
              <Text style={local.modalTitle}>Edit profile</Text>

              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Feather name="x" size={22} color="#111C4B" />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <Field
                label="Full name"
                value={draft.name || ""}
                onChangeText={(value) =>
                  setDraft({ ...draft, name: value })
                }
              />

              <Field
                label="Email"
                value={draft.email || ""}
                onChangeText={(value) =>
                  setDraft({ ...draft, email: value })
                }
                keyboardType="email-address"
              />

              <Field
                label="Phone number"
                value={draft.phone || ""}
                onChangeText={(value) =>
                  setDraft({ ...draft, phone: value })
                }
                keyboardType="phone-pad"
              />

              <Field
                label="Location"
                value={draft.location || ""}
                onChangeText={(value) =>
                  setDraft({ ...draft, location: value })
                }
                placeholder="City or province"
              />

              <Field
                label="Desired job"
                value={draft.desiredJob || ""}
                onChangeText={(value) =>
                  setDraft({ ...draft, desiredJob: value })
                }
                placeholder="e.g. Junior Web Developer"
              />

              <Field
                label="About me"
                value={draft.bio || ""}
                onChangeText={(value) =>
                  setDraft({ ...draft, bio: value })
                }
                placeholder="Briefly introduce yourself"
                multiline
              />

              <TouchableOpacity
                style={local.saveBtn}
                onPress={saveProfile}
              >
                <Text style={local.saveBtnText}>Save changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Settings modal */}
      <Modal
        visible={settingsVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={local.modalShade}>
          <View style={local.settingsCard}>
            <View style={local.modalHeader}>
              <Text style={local.modalTitle}>Settings & privacy</Text>

              <TouchableOpacity
                onPress={() => setSettingsVisible(false)}
              >
                <Feather name="x" size={22} color="#111C4B" />
              </TouchableOpacity>
            </View>

            <Text style={local.settingsDescription}>
              Manage your account security and profile preferences.
            </Text>

            <TouchableOpacity
              style={local.settingRow}
              onPress={() => {
                setSettingsVisible(false);
                setPasswordVisible(true);
              }}
            >
              <Feather name="lock" size={18} color="#2623D3" />
              <Text style={local.settingText}>Change password</Text>
              <Feather
                name="chevron-right"
                size={18}
                color="#8993A8"
              />
            </TouchableOpacity>

            <View style={local.settingRow}>
              <Feather name="bell" size={18} color="#2623D3" />
              <Text style={[local.settingText, { flex: 1 }]}>
                Job alerts
              </Text>

              <Switch
                value={alertsEnabled}
                onValueChange={(value) => {
                  setAlertsEnabled(value);
                  updateCurrentUser({ jobAlertsEnabled: value });
                }}
              />
            </View>

            <TouchableOpacity
              style={local.settingRow}
              onPress={() =>
                Alert.alert(
                  "Privacy information",
                  "Your profile and resume are currently stored in app memory. Secure backend storage is not connected yet."
                )
              }
            >
              <Feather name="shield" size={18} color="#2623D3" />
              <Text style={local.settingText}>Privacy information</Text>
              <Feather
                name="chevron-right"
                size={18}
                color="#8993A8"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change password modal */}
      <Modal
        visible={passwordVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPasswordVisible(false)}
      >
        <View style={local.modalShade}>
          <View style={local.settingsCard}>
            <View style={local.modalHeader}>
              <Text style={local.modalTitle}>Change password</Text>

              <TouchableOpacity
                onPress={() => setPasswordVisible(false)}
              >
                <Feather name="x" size={22} color="#111C4B" />
              </TouchableOpacity>
            </View>

            <Field
              label="Current password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />

            <Field
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Field
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={local.saveBtn}
              onPress={changePassword}
            >
              <Text style={local.saveBtnText}>Update password</Text>
            </TouchableOpacity>

            <Text style={local.note}>
              Password changes are held in app memory and are not saved to a backend.
            </Text>
          </View>
        </View>
      </Modal>
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

  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111C4B",
  },

  email: {
    fontSize: 13,
    color: "#7381A2",
    marginTop: 2,
  },

  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E9ECFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },

  roleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2623D3",
  },

  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E9ECFF",
    alignItems: "center",
    justifyContent: "center",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDF0F7",
  },

  statNum: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111C4B",
  },

  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7381A2",
    marginTop: 2,
  },

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

  infoLabel: {
    fontSize: 13,
    color: "#7381A2",
    width: 82,
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#111C4B",
  },

  completionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  completionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111C4B",
  },

  completionPct: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2623D3",
  },

  barBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E9ECFF",
    overflow: "hidden",
  },

  barFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2623D3",
  },

  completionHint: {
    fontSize: 12,
    color: "#7381A2",
    marginTop: 10,
  },

  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#E9ECFF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },

  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2623D3",
  },

  emptySkills: {
    width: "100%",
    fontSize: 12,
    color: "#7381A2",
    marginBottom: 6,
  },

  skillInputRow: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    marginTop: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E0E5F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: "#111C4B",
    backgroundColor: "#FFFFFF",
    fontSize: 14,
  },

  addSkillBtn: {
    width: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#2623D3",
  },

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

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F7",
  },

  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E9ECFF",
    alignItems: "center",
    justifyContent: "center",
  },

  rowLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111C4B",
  },

  rowHint: {
    fontSize: 12,
    color: "#7381A2",
    marginTop: 2,
  },

  bio: {
    color: "#53617D",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  inlineAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDF0F7",
  },

  inlineActionText: {
    color: "#2623D3",
    fontSize: 13,
    fontWeight: "700",
  },

  alertPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EDF0F7",
    padding: 14,
    marginBottom: 18,
  },

  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E9ECFF",
    alignItems: "center",
    justifyContent: "center",
  },

  modalShade: {
    flex: 1,
    backgroundColor: "rgba(12, 20, 48, 0.45)",
    justifyContent: "center",
    padding: 18,
  },

  modalCard: {
    maxHeight: "90%",
    backgroundColor: "#F7F8FC",
    borderRadius: 20,
    padding: 18,
  },

  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111C4B",
  },

  fieldLabel: {
    fontSize: 13,
    color: "#53617D",
    fontWeight: "700",
    marginBottom: 6,
  },

  saveBtn: {
    backgroundColor: "#2623D3",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
  },

  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  settingsDescription: {
    color: "#7381A2",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#EDF0F7",
  },

  settingText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111C4B",
  },

  note: {
    color: "#7381A2",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
});