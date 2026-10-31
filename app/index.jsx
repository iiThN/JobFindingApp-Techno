
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!currentUser) {
    return <Redirect href="/login" />;
  }

  if (currentUser.role === "Admin") {
    return <Redirect href="/(tabs)/(admin)/dashboard" />;
  }

  if (currentUser.role === "Employer") {
    return <Redirect href="/(tabs)/(employer)/dashboard" />;
  }

  return <Redirect href="/(tabs)/(jobseeker)" />;
}
