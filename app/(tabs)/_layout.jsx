
import { Drawer } from "expo-router/drawer";
import CustomDrawer from "../../components/CustomDrawer";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: {
          width: "82%",
          backgroundColor: "#FFFFFF",
        },
        overlayColor: "rgba(12, 18, 44, 0.48)",
        swipeEnabled: true,
      }}
    >
<<<<<<< HEAD
      
      <Drawer.Screen name="(employer)" options={{ title: "Employer" }} />
      <Drawer.Screen name="(jobseeker)" options={{ title: "Job Seeker" }} />
=======
      <Drawer.Screen
        name="(jobseeker)"
        options={{ title: "Job Seeker" }}
      />

      <Drawer.Screen
        name="(employer)"
        options={{ title: "Employer" }}
      />

      <Drawer.Screen
        name="(admin)"
        options={{ title: "Admin" }}
      />
>>>>>>> 26d0026d6731a32cdc64d2ea02f2803ef57e3325
    </Drawer>
  );
}
