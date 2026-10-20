import { Drawer } from "expo-router/drawer";
import CustomDrawer from "../../components/CustomDrawer";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false, 
        drawerType: "front",
        drawerStyle: { width: "82%", backgroundColor: "#FFFFFF" },
        overlayColor: "rgba(12, 18, 44, 0.48)",
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen name="(jobseeker)" options={{ title: "Job Seeker" }} />
      <Drawer.Screen name="(employer)" options={{ title: "Employer" }} />
    </Drawer>
  );
}
