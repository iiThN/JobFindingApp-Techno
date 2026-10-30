import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // Existing styles
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  scrollContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 90,
    minHeight: "100%",
    backgroundColor: "#ffffff",
  },

  // Existing drawer styles
  menuOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  backdrop: {
    flex: 1,
  },

  menuContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "80%",
    backgroundColor: "#FFFFFF",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },

  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },

  menuHeader: {
    paddingTop: 34,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },

  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2623D3",
  },

  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },

  userEmail: {
    fontSize: 12,
    color: "#6B7280",
  },

  closeMenuBtn: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  menuActsContainer: {
    flex: 1,
    backgroundColor: "green",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
  },

  menuFooter: {
    padding: 16,
  },

  logoutButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#d81111",
    alignSelf: "center",
  },

  // Home screen styles.
  homeContainer: {
    flex: 1,
    backgroundColor: "#F6F8FF",
  },

  homeContent: {
    paddingHorizontal: 19,
    paddingTop: 20,
    paddingBottom: 105,
  },

  homeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  homeMorning: {
    color: "#6D7A9B",
    fontSize: 13,
  },

  homeGreeting: {
    color: "#111C4B",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 3,
  },

  homeSubtitle: {
    color: "#7381A2",
    fontSize: 12,
    marginTop: 8,
  },

  homeBell: {
    backgroundColor: "#FFFFFF",
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  homeSearchRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 27,
    marginBottom: 25,
  },

  homeSearchBox: {
    flex: 1,
    height: 51,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#EEF0F8",
  },

  homeSearchInput: {
    flex: 1,
    color: "#1D2A50",
    fontSize: 12,
  },

  homeFilter: {
    width: 51,
    height: 51,
    backgroundColor: "#2623D3",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  homeSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  homeHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flexShrink: 1,
  },

  homeHeading: {
    color: "#111C4B",
    fontSize: 17,
    fontWeight: "800",
  },

  homeSeeAll: {
    color: "#2623D3",
    fontSize: 12,
    fontWeight: "600",
  },

  homeHorizontal: {
    paddingRight: 19,
  },

  // Employer Header & Modal Styles
  employerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  employerHeaderTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111C4B",
  },

  employerHeaderSubtitle: {
    fontSize: 12,
    color: "#7381A2",
    marginTop: 4,
  },

  employerPostBtn: {
    backgroundColor: "#2623D3",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: "#2623D3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  employerPostBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  employerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 28, 75, 0.5)",
    justifyContent: "flex-end",
  },

  employerModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: "85%",
  },

  employerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  employerModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111C4B",
  },

  employerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15204A",
    marginBottom: 6,
    marginTop: 12,
  },

  employerInput: {
    borderWidth: 1,
    borderColor: "#EEF0F8",
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    backgroundColor: "#F6F8FF",
    color: "#111C4B",
  },

  employerSubmitBtn: {
    backgroundColor: "#2623D3",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
    shadowColor: "#2623D3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  employerSubmitBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  // Job Details styles.
  detailsContainer: {
    flex: 1,
    backgroundColor: "#F6F8FF",
  },

  detailsContent: {
    padding: 20,
    paddingBottom: 30,
  },

  detailsTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 23,
  },

  detailsBack: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  detailsTopTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#15204A",
  },

  detailsHero: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 23,
    alignItems: "center",
    marginBottom: 15,
  },

  detailsLogo: {
    width: 75,
    height: 75,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  detailsTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#121C46",
    textAlign: "center",
  },

  detailsCompany: {
    color: "#2623D3",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },

  detailsLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 9,
  },

  detailsFacts: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 15,
  },

  detailsFact: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 17,
    alignItems: "flex-start",
    gap: 7,
  },

  detailsFactLabel: {
    color: "#8590A5",
    fontSize: 12,
  },

  detailsFactValue: {
    color: "#2623D3",
    fontSize: 14,
    fontWeight: "700",
  },

  detailsPanel: {
    backgroundColor: "#FFFFFF",
    padding: 19,
    borderRadius: 17,
    marginBottom: 13,
  },

  detailsSectionTitle: {
    color: "#15204A",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  detailsBody: {
    color: "#6C7893",
    fontSize: 13,
    lineHeight: 21,
  },

  detailsSalary: {
    color: "#2623D3",
    fontSize: 17,
    fontWeight: "700",
  },

  detailsRequirement: {
    color: "#6C7893",
    fontSize: 13,
    lineHeight: 24,
  },

  detailsFooter: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },

  detailsApply: {
    backgroundColor: "#2623D3",
    borderRadius: 15,
    padding: 17,
    alignItems: "center",
  },

  detailsApplyText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // JobCard styles.
  jobCardFeatured: {
    width: 290,
    minHeight: 185,
    backgroundColor: "#2623D3",
    borderRadius: 20,
    padding: 18,
    marginRight: 12,
    justifyContent: "space-between",
  },

  jobCardFeaturedTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  jobCardFeaturedIcon: {
    width: 45,
    height: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  jobCardFeaturedTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 12,
  },

  jobCardFeaturedCompany: {
    color: "#DBE1FF",
    fontSize: 12,
    marginTop: 5,
  },

  jobCardFeaturedBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 15,
  },

  jobCardFeaturedTag: {
    color: "#FFFFFF",
    backgroundColor: "#4947E8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 11,
  },

  jobCardFeaturedSalary: {
    color: "#FFFFFF",
    fontSize: 11,
    flex: 1,
    textAlign: "right",
  },

  jobCardCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#EEF0F8",
    shadowColor: "#111C4B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  jobCardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
  },

  jobCardInfo: {
    flex: 1,
  },

  jobCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111C4B",
  },

  jobCardCompany: {
    fontSize: 12,
    color: "#7381A2",
    marginTop: 4,
  },

  jobCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },

  jobCardTag: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2623D3",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  jobCardSalary: {
    flex: 1,
    color: "#2623D3",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
  },
  employerModalContainer: {
    flex: 1,
    backgroundColor: "#F6F8FF",
  },
  employerModalTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#EEF0F8",
  },
  employerCloseModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F6F8FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF0F8",
  },
  employerToggleRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    flexWrap: "wrap",
  },
  employerToggleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  employerToggleChipActive: {
    backgroundColor: "#2623D3",
    borderColor: "#2623D3",
  },
  employerToggleChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2623D3",
  },
  employerToggleChipTextActive: {
    color: "#FFFFFF",
  },
  employerSalaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  employerCurrencyBox: {
    height: 44,
    width: 38,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  employerCurrencyText: {
    fontWeight: "800",
    color: "#2623D3",
    fontSize: 14,
  },
  employerIntervalBadge: {
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  employerIntervalText: {
    fontWeight: "800",
    color: "#2623D3",
    fontSize: 12,
  },
  employerSkillInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF0F8",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  employerAddSkillBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#2623D3",
    justifyContent: "center",
    alignItems: "center",
  },
  employerSuggestionsDropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEF0F8",
    marginTop: 4,
    padding: 6,
    gap: 4,
  },
  employerSuggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F6F8FF",
  },
  employerSuggestionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111C4B",
  },
  employerPillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  employerSkillPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  employerSkillPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2623D3",
  },
});

export default styles;