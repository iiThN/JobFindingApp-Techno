
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
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
      <Text style={local.infoValue} numberOfLines={2}>
        {value || "Not set"}
      </Text>
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
        autoCapitalize={
          keyboardType === "email-address" ? "none" : "sentences"
        }
        style={[
          local.input,
          multiline && {
            minHeight: 90,
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
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resumeVisible, setResumeVisible] = useState(false);

  const [draft, setDraft] = useState({});
  const [skillInput, setSkillInput] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const name = currentUser?.name || "Your Name";
  const email = currentUser?.email || "";

  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "JS";

  const skills = Array.isArray(currentUser?.skills)
    ? currentUser.skills
    : [];

  const alertsEnabled = currentUser?.jobAlertsEnabled ?? true;

  // Calculate profile completion.
  const checks = [
    currentUser?.name?.trim(),
    currentUser?.email?.trim(),
    currentUser?.phone?.trim(),
    currentUser?.location?.trim(),
    currentUser?.desiredJob?.trim(),
    currentUser?.bio?.trim(),
    skills.length > 0,
    Boolean(currentUser?.resume),
  ];

  const completion = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );

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

  const saveProfile = () => {
    if (!draft.name?.trim()) {
      Alert.alert("Name required", "Please enter your full name.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(draft.email?.trim() || "")) {
      Alert.alert("Invalid email", "Please enter a valid email.");
      return;
    }

    updateCurrentUser({
      name: draft.name.trim(),
      email: draft.email.trim().toLowerCase(),
      phone: draft.phone.trim(),
      location: draft.location.trim(),
      desiredJob: draft.desiredJob.trim(),
      bio: draft.bio.trim(),
    });

    setEditVisible(false);
    Alert.alert("Success", "Your profile has been updated.");
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    if (
      skills.some(
        (item) => item.toLowerCase() === skill.toLowerCase()
      )
    ) {
      Alert.alert("Duplicate skill", "This skill already exists.");
      return;
    }

    updateCurrentUser({ skills: [...skills, skill] });
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    Alert.alert("Remove skill", `Remove "${skill}" from your profile?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          updateCurrentUser({
            skills: skills.filter((item) => item !== skill),
          }),
      },
    ]);
  };

  // Manage the profile's single resume.
  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) return;

      const extension = file.name?.split(".").pop()?.toLowerCase();

      if (!["pdf", "doc", "docx"].includes(extension)) {
        Alert.alert("Unsupported file", "Select PDF, DOC, or DOCX.");
        return;
      }

      if (file.size == null || file.size > 5 * 1024 * 1024) {
        Alert.alert(
          "Invalid file size",
          "Choose a file with a known size of 5 MB or less."
        );
        return;
      }

      updateCurrentUser({
        resume: {
          name: file.name,
          uri: file.uri,
          size: file.size,
          mimeType: file.mimeType,
        },
      });

      setResumeVisible(false);

      Alert.alert(
        "Resume selected",
        "Your resume has been added to this app session."
      );
    } catch {
      Alert.alert("Error", "Unable to select your resume.");
    }
  };

  const removeResume = () => {
    Alert.alert("Remove resume?", "Remove your current resume?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          updateCurrentUser({ resume: null });
          setResumeVisible(false);
        },
      },
    ]);
  };

  const changePassword = () => {
    if (!oldPassword || oldPassword !== currentUser?.password) {
      Alert.alert(
        "Incorrect password",
        "Please check your current password."
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Password too short",
        "Use at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Password mismatch",
        "The new passwords do not match."
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
      "Your password has been updated for this session."
    );
  };

  return (
    <SafeAreaView style={styles.homeContainer} edges={["top"]}>
      <TopNav />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.homeContent}
      >
        <View style={styles.homeHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.homeGreeting}>Profile</Text>
            <Text style={styles.homeSubtitle}>
              Manage your personal information and qualifications.
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

            <Text style={local.email} numberOfLines={1}>
              {email}
            </Text>

            <View style={local.roleBadge}>
              <Text style={local.roleText}>Job Seeker</Text>
            </View>
          </View>

          <TouchableOpacity
            style={local.editBtn}
            onPress={startEdit}
            accessibilityLabel="Edit profile"
          >
            <Feather name="edit-2" size={18} color="#2623D3" />
          </TouchableOpacity>
        </View>

        {/* Profile completion */}
        <View style={local.panel}>
          <View style={local.completionTop}>
            <Text style={local.completionTitle}>
              Profile completion
            </Text>
            <Text style={local.completionPct}>
              {completion}%
            </Text>
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
            Complete your details to better showcase your qualifications.
          </Text>
        </View>

        {/* About me */}
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

          <View style={local.bioSection}>
            <Text style={local.fieldLabel}>Bio</Text>
            <Text style={local.bio}>
              {currentUser?.bio ||
                "Tell employers a little about yourself."}
            </Text>
          </View>
        </View>

        {/* Skills */}
        <SectionTitle icon="award" title="Skills" />

        <View style={local.panel}>
          <View style={local.chipWrap}>
            {skills.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={local.chip}
                onPress={() => removeSkill(skill)}
              >
                <Text style={local.chipText}>{skill}</Text>
                <Feather name="x" size={12} color="#2623D3" />
              </TouchableOpacity>
            ))}
          </View>

          {skills.length === 0 && (
            <Text style={local.emptyText}>
              No skills added yet.
            </Text>
          )}

          <View style={local.skillInputRow}>
            <TextInput
              style={[local.input, { flex: 1 }]}
              placeholder="Add a skill"
              placeholderTextColor="#9AA4B8"
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={addSkill}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={local.addSkillBtn}
              onPress={addSkill}
            >
              <Feather name="plus" size={19} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account and documents */}
        <SectionTitle icon="folder" title="Account & Documents" />

        <View style={local.menuCard}>
          <TouchableOpacity
            style={[local.menuRow, local.rowBorder]}
            onPress={() => setResumeVisible(true)}
          >
            <View style={local.menuIcon}>
              <Feather name="file-text" size={20} color="#2623D3" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={local.menuLabel}>My Resume</Text>
              <Text style={local.menuHint} numberOfLines={1}>
                {currentUser?.resume?.name ||
                  "Upload or manage your resume"}
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={18}
              color="#8993A8"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={local.menuRow}
            onPress={() => setSettingsVisible(true)}
          >
            <View style={local.menuIcon}>
              <Feather name="settings" size={20} color="#2623D3" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={local.menuLabel}>Settings</Text>
              <Text style={local.menuHint}>
                Password, notifications and privacy
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={18}
              color="#8993A8"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit profile modal */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={local.modalShade}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={local.modalCard}>
            <View style={local.modalHeader}>
              <Text style={local.modalTitle}>Edit Profile</Text>
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
                keyboardType="email-address"
                onChangeText={(value) =>
                  setDraft({ ...draft, email: value })
                }
              />

              <Field
                label="Phone number"
                value={draft.phone || ""}
                keyboardType="phone-pad"
                onChangeText={(value) =>
                  setDraft({ ...draft, phone: value })
                }
              />

              <Field
                label="Location"
                value={draft.location || ""}
                placeholder="City or province"
                onChangeText={(value) =>
                  setDraft({ ...draft, location: value })
                }
              />

              <Field
                label="Desired job"
                value={draft.desiredJob || ""}
                placeholder="e.g. Junior Web Developer"
                onChangeText={(value) =>
                  setDraft({ ...draft, desiredJob: value })
                }
              />

              <Field
                label="About me"
                value={draft.bio || ""}
                placeholder="Briefly introduce yourself"
                multiline
                onChangeText={(value) =>
                  setDraft({ ...draft, bio: value })
                }
              />

              <TouchableOpacity
                style={local.saveBtn}
                onPress={saveProfile}
              >
                <Text style={local.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Resume management modal */}
      <Modal
        visible={resumeVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setResumeVisible(false)}
      >
        <View style={local.modalShade}>
          <View style={local.settingsCard}>
            <View style={local.modalHeader}>
              <Text style={local.modalTitle}>My Resume</Text>
              <TouchableOpacity onPress={() => setResumeVisible(false)}>
                <Feather name="x" size={22} color="#111C4B" />
              </TouchableOpacity>
            </View>

            <View style={local.resumeBox}>
              <Feather
                name="file-text"
                size={30}
                color="#2623D3"
              />

              <Text style={local.resumeName}>
                {currentUser?.resume?.name || "No resume uploaded"}
              </Text>

              <Text style={local.note}>
                PDF, DOC or DOCX — maximum 5 MB
              </Text>
            </View>

            <TouchableOpacity
              style={local.saveBtn}
              onPress={pickResume}
            >
              <Text style={local.saveBtnText}>
                {currentUser?.resume
                  ? "Replace Resume"
                  : "Choose Resume"}
              </Text>
            </TouchableOpacity>

            {!!currentUser?.resume && (
              <TouchableOpacity
                style={local.removeResumeBtn}
                onPress={removeResume}
              >
                <Text style={local.removeResumeText}>
                  Remove Resume
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
              <Text style={local.modalTitle}>
                Settings & Privacy
              </Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Feather name="x" size={22} color="#111C4B" />
              </TouchableOpacity>
            </View>

            <Text style={local.note}>
              Manage your account and preferences.
            </Text>

            <TouchableOpacity
              style={local.settingRow}
              onPress={() => {
                setSettingsVisible(false);
                setPasswordVisible(true);
              }}
            >
              <Feather name="lock" size={18} color="#2623D3" />
              <Text style={local.settingText}>Change Password</Text>
              <Feather
                name="chevron-right"
                size={18}
                color="#8993A8"
              />
            </TouchableOpacity>

            <View style={local.settingRow}>
              <Feather name="bell" size={18} color="#2623D3" />
              <Text style={[local.settingText, { flex: 1 }]}>
                Job Alerts
              </Text>

              <Switch
                value={alertsEnabled}
                onValueChange={(value) =>
                  updateCurrentUser({ jobAlertsEnabled: value })
                }
                trackColor={{
                  false: "#D8DDEA",
                  true: "#B9B7FF",
                }}
                thumbColor={
                  alertsEnabled ? "#2623D3" : "#FFFFFF"
                }
              />
            </View>

            <TouchableOpacity
              style={local.settingRow}
              onPress={() =>
                Alert.alert(
                  "Privacy Information",
                  "Profile information is currently managed in app memory. Secure backend storage is not connected yet."
                )
              }
            >
              <Feather name="shield" size={18} color="#2623D3" />
              <Text style={local.settingText}>
                Privacy Information
              </Text>
              <Feather
                name="chevron-right"
                size={18}
                color="#8993A8"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Password modal */}
      <Modal
        visible={passwordVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPasswordVisible(false)}
      >
        <View style={local.modalShade}>
          <View style={local.settingsCard}>
            <View style={local.modalHeader}>
              <Text style={local.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordVisible(false)}>
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
              <Text style={local.saveBtnText}>
                Update Password
              </Text>
            </TouchableOpacity>

            <Text style={[local.note, { marginTop: 12 }]}>
              Password changes are currently session-based.
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
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDF0F7",
    marginBottom: 20,
  },
  completionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111C4B",
  },
  completionPct: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2623D3",
  },
  barBg: {
    height: 8,
    borderRadius: 8,
    backgroundColor: "#E9ECFF",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#2623D3",
  },
  completionHint: {
    fontSize: 11,
    color: "#7381A2",
    marginTop: 10,
    lineHeight: 17,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  infoLabel: {
    width: 85,
    fontSize: 12,
    color: "#7381A2",
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#111C4B",
    textAlign: "right",
  },
  bioSection: {
    borderTopWidth: 1,
    borderTopColor: "#EDF0F7",
    paddingTop: 14,
    marginTop: 8,
  },
  bio: {
    fontSize: 12,
    color: "#5B6788",
    lineHeight: 19,
    marginTop: 6,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E9ECFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2623D3",
  },
  emptyText: {
    fontSize: 12,
    color: "#8993A8",
    marginBottom: 8,
  },
  skillInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  addSkillBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2623D3",
    alignItems: "center",
    justifyContent: "center",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#EDF0F7",
    marginBottom: 24,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F7",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E9ECFF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111C4B",
  },
  menuHint: {
    fontSize: 11,
    color: "#8993A8",
    marginTop: 3,
  },
  modalShade: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111C4B",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#14204A",
    marginBottom: 7,
  },
  input: {
    height: 44,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#111C4B",
  },
  saveBtn: {
    backgroundColor: "#2623D3",
    borderRadius: 25,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F7",
  },
  settingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#111C4B",
  },
  note: {
    fontSize: 11,
    color: "#8993A8",
    lineHeight: 17,
  },
  resumeBox: {
    alignItems: "center",
    gap: 10,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    marginBottom: 12,
  },
  resumeName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111C4B",
    textAlign: "center",
  },
  removeResumeBtn: {
    padding: 14,
    alignItems: "center",
  },
  removeResumeText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "600",
  },
});
