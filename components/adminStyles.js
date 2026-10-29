import { StyleSheet } from "react-native";

// Shared look for the admin screens (matches the existing indigo theme).
const adminStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FF" },
  scroll: { padding: 20, paddingBottom: 40, gap: 14 },

  title: { fontSize: 24, fontWeight: "700", color: "#111C4B" },
  subtitle: { fontSize: 14, color: "#6876A6", marginTop: 4, lineHeight: 21 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111C4B", marginTop: 6 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E7EBFA",
    gap: 10,
  },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },

  name: { fontSize: 15, fontWeight: "700", color: "#10183B" },
  meta: { fontSize: 12, color: "#67759A", marginTop: 2 },
  empty: { textAlign: "center", color: "#8994B4", fontSize: 14, marginTop: 30 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },

  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  btnText: { fontSize: 13, fontWeight: "700" },

  search: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EBFA",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 14,
    color: "#10183B",
  },

  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DFF5",
  },
  chipActive: { backgroundColor: "#2623D3", borderColor: "#2623D3" },
  chipText: { fontSize: 12, fontWeight: "600", color: "#59688B" },
  chipTextActive: { color: "#FFFFFF" },
});

export const STATUS_COLORS = {
  active: { bg: "#E6F7EE", fg: "#15803D" },
  suspended: { bg: "#FDE8EB", fg: "#E13F58" },
  Pending: { bg: "#FFF4DB", fg: "#B7791F" },
  Verified: { bg: "#E6F7EE", fg: "#15803D" },
  Rejected: { bg: "#FDE8EB", fg: "#E13F58" },
};

export default adminStyles;
