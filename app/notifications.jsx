import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotifications } from "../context/NotificationsContext";

function getNotificationIcon(item) {
  switch (item.type) {
    case "new_application":
      return {
        name: "document-text-outline",
        color: "#2563EB",
        background: "#DBEAFE",
      };

    case "application_status": {
      const status =
        item.data?.status?.toLowerCase() || "";

      const isRejected =
        status === "rejected" ||
        item.title?.toLowerCase().includes("rejected") ||
        item.message?.toLowerCase().includes("rejected");

      if (isRejected) {
        return {
          name: "close-circle-outline",
          color: "#DC2626",
          background: "#FEE2E2",
        };
      }

      return {
        name: "checkmark-circle-outline",
        color: "#16A34A",
        background: "#DCFCE7",
      };
    }

    case "employer_reply":
      return {
        name: "chatbubble-ellipses-outline",
        color: "#7C3AED",
        background: "#EDE9FE",
      };

    case "verification_submitted":
      return {
        name: "shield-checkmark-outline",
        color: "#2563EB",
        background: "#DBEAFE",
      };

    case "verification_status": {
      const status =
        item.data?.status?.toLowerCase() || "";

      if (status === "rejected") {
        return {
          name: "close-circle-outline",
          color: "#DC2626",
          background: "#FEE2E2",
        };
      }

      return {
        name: "shield-checkmark-outline",
        color: "#16A34A",
        background: "#DCFCE7",
      };
    }

    default:
      return {
        name: "notifications-outline",
        color: "#64748B",
        background: "#F1F5F9",
      };
  }
}

function formatNotificationDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return "";

  const isToday =
    date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isYesterday =
    date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) return `Today • ${time}`;
  if (isYesterday) return `Yesterday • ${time}`;

  return (
    date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + ` • ${time}`
  );
}

export default function NotificationsScreen() {
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  const handleNotificationPress = async (item) => {
    // Mark notification as read first.
    if (!item.is_read) {
      await markAsRead(item.id);
    }

    const data = item.data || {};

    // Navigate according to the notification type.
    switch (item.type) {
      case "new_application":
        if (data.application_id) {
          router.push(
            `/employerModal/applicant-detail/${data.application_id}`
          );
        } else {
          Alert.alert(
            "Application",
            "The application details could not be found."
          );
        }
        break;

      case "application_status":
      case "employer_reply":
        if (data.job_id) {
          router.push(
            `/jobseekerModal/details/${data.job_id}`
          );
        } else {
          Alert.alert(
            "Application Update",
            "The related job could not be found."
          );
        }
        break;

      case "verification_submitted":
        router.push("/(tabs)/(admin)/verifications");
        break;

      case "verification_status":
        router.push("/(tabs)/(employer)/profile");
        break;

      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    const success = await markAllAsRead();

    if (!success) {
      Alert.alert(
        "Error",
        "Unable to mark all notifications as read."
      );
    }
  };

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.is_read && styles.unreadItem,
        ]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: icon.background },
          ]}
        >
          <Ionicons
            name={icon.name}
            size={23}
            color={icon.color}
          />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.notificationTitle,
                !item.is_read && styles.unreadTitle,
              ]}
            >
              {item.title}
            </Text>

            {!item.is_read && (
              <View style={styles.unreadDot} />
            )}
          </View>

          <Text style={styles.notificationMessage}>
            {item.message}
          </Text>

          <Text style={styles.notificationDate}>
            {formatNotificationDate(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#111C4B"
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          <Text style={styles.headerSubtitle}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          <Text
            style={[
              styles.markAllText,
              unreadCount === 0 && styles.disabledText,
            ]}
          >
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unable to load notifications.
          </Text>

          <TouchableOpacity onPress={refreshNotifications}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading */}
      {loading && notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color="#2623D3"
          />

          <Text style={styles.emptySubtitle}>
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={
            notifications.length === 0
              ? styles.emptyList
              : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refreshNotifications}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="notifications-off-outline"
                  size={38}
                  color="#94A3B8"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No notifications yet
              </Text>

              <Text style={styles.emptySubtitle}>
                We'll let you know when there are updates
                about your account and activities.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 12,
  },

  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111C4B",
  },

  headerSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
  },

  markAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2623D3",
  },

  disabledText: {
    color: "#CBD5E1",
  },

  listContent: {
    padding: 14,
    paddingBottom: 30,
  },

  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },

  unreadItem: {
    backgroundColor: "#F1F5FF",
    borderColor: "#C7D2FE",
  },

  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  notificationContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  notificationTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  unreadTitle: {
    fontWeight: "800",
    color: "#111C4B",
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2623D3",
  },

  notificationMessage: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    marginTop: 5,
  },

  notificationDate: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 9,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 17,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111C4B",
  },

  emptySubtitle: {
    fontSize: 12,
    lineHeight: 19,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 7,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  errorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12,
  },

  retryText: {
    color: "#2623D3",
    fontSize: 12,
    fontWeight: "700",
  },
});