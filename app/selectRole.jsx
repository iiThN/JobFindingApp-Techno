import { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View
} from "react-native";
import RoleCard from "../components/Cards";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import styles from "../components/styles";

export default function SelectRole(){

  const [role, setRole] = useState("");
  return(
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          Choose Your Role
        </Text>

        <Text style={styles.subtitle}>
          Select role before creating an account
        </Text>

        <View style={styles.roleSelection}>
          <RoleCard
            iconName="briefcase-search"
            iconSize={28}
            title="Job Seeker"
            subtitle="Browse for Jobs and Apply"
            onPress={() => router.push({
              pathname: '/register',
              params: { role: 'Job Seeker' }
            })}
          />

          <RoleCard
            iconName="account-tie"
            iconSize={34}
            title="Employer"
            subtitle="Post Job Openings and Accept Applicants"
            onPress={() => router.push({
              pathname: '/register',
              params: { role: 'Employer' }
            })}
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/login")}>
            <Text style={styles.loginLink}>
              Login
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}