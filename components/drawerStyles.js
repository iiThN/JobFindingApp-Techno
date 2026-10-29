
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    width: 110,
    height: 32,
  },

  tagline: {
    fontSize: 12,
    color: "#8994B4",
    marginTop: 3,
  },

  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 30,
    marginBottom: 22,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E9ECFF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 19,
    fontWeight: "700",
    color: "#2623D3",
  },

  accountInfo: {
    flex: 1,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#10183B",
  },

  role: {
    fontSize: 12,
    color: "#67759A",
    marginTop: 3,
  },

  email: {
    fontSize: 11,
    color: "#8994B4",
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#E7EBFA",
    marginVertical: 15,
  },

  section: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#8793B5",
    marginBottom: 8,
  },

  menuItem: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 4,
  },

  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#465477",
  },

  logoutText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#E13F58",
  },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F0F2FF",
  },

  footerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "600",
    color: "#6876A6",
  },
});

export default styles;
