import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const STATUS = {
  Pending:   { bg: "#FFF3CF", fg: "#7A4E00", bar: "#B7791F", steps: 1, note: "Waiting for review" },
  Rejected:  { bg: "#FDE8E8", fg: "#B42318", bar: "#B42318", steps: 2, note: "Not selected this time" },
};

export default function ApplicationCard({ job, application, onPress }) {
  const s = STATUS[application.status];
  const date = new Date(application.appliedAt).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.top}>
        <View style={[styles.iconBox, { backgroundColor: job.color }]}>
          <MaterialCommunityIcons name={job.icon} size={25} color="#2623D3" />
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{job.title}</Text>
          <Text style={styles.company} numberOfLines={1}>
            {job.company} · {job.location}
          </Text>
        </View>

        <Text style={[styles.pill, { backgroundColor: s.bg, color: s.fg }]}>
          {application.status}
        </Text>
      </View>

      <View style={styles.bars}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i < s.steps ? s.bar : "#E1E5F2" }]}
          />
        ))}
      </View>

      <View style={styles.bottom}>
        <Text style={styles.note}>{s.note} · Applied {date}</Text>
        <Text style={styles.view}>View</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#EDF0F7",
    gap: 12,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700", color: "#121B39" },
  company: { fontSize: 12, color: "#5B6788", marginTop: 4 },
  pill: { fontSize: 11, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, overflow: "hidden" },
  bars: { flexDirection: "row", gap: 5 },
  bar: { flex: 1, height: 5, borderRadius: 3 },
  bottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  note: { flex: 1, fontSize: 12, color: "#5B6788" },
  view: { fontSize: 12, fontWeight: "700", color: "#2623D3" },
});