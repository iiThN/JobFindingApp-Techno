import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    justifyContent: "center",

  },
  
  content: {
  padding: 25,
  },

  inJob_logo: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center', 
    height: 32,
    resizeMode: 'contain',
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    margin: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation:  4,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },

cardText: {
  color: "#777",
  lineHeight: 22,
},

title: {
  fontSize: 24,
  fontWeight: "bold",
  color: "#111827",
  textAlign: "center",
  marginBottom: 8,
},

subtitle: {
  fontSize: 14,
  color: "#777777",
  textAlign: "center",
  marginBottom: 30,
},

form: {
  flexDirection: 'column',
  width: "100%",
  gap: 16,
},

forgotButton: {
  alignSelf: "flex-end",
},

forgotText: {
  color: "#2623D3",
  fontSize: 14,
  fontWeight: "600",
},

errorText: {
  color: "#DC2626",
  fontSize: 13,
  fontWeight: "500",
  lineHeight: 18,
},

registerContainer: {
  flexDirection: "row",
  justifyContent: "center",
  marginTop: 20,
},

registerText: {
  color: "#777777",
  fontSize: 14,
},

registerLink: {
  color: "#2623D3",
  fontSize: 14,
  fontWeight: "bold",
  marginLeft: 5,
},

loginContainer: {
  flexDirection: "row",
  justifyContent: "center",
  marginTop: 25,
},

loginText: {
  color: "#777777",
  fontSize: 14,
},

loginLink: {
  color: "#2623D3",
  fontSize: 14,
  fontWeight: "bold",
  marginLeft: 5,
},

roleSelection: {
  flexDiection: 'column',
  justifyContent: "center",
  alignItems: 'center',
  backgroundColorl: '#ffffff',
  gap:20,
},

uploadContainer: {

},
uploadLabel: {
  fontSize: 12,
  fontWeight: "600",
  color: "#111827",
  marginBottom: 6,
},
uploadBox: {
  borderWidth: 1.5,
  borderColor: '#CBD5E1',
  borderStyle: 'dashed',
  borderRadius: 10,
  padding: 16,
  alignItems: 'center',
  backgroundColor: '#F8FAFC',
  flexDirection: 'row',
},
uploadText: {
  marginLeft: 8,
  fontSize: 14,
  color: '#64748B',
  flex:1
},
fileItem: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F1F5F9',
  padding: 10,
  borderRadius: 8,
  marginTop: 8,
  justifyContent: 'space-between',
},
fileName: {
  flex: 1,
  fontSize: 12,
  color: '#334155',
  marginHorizontal: 8,
},
});

export default styles;