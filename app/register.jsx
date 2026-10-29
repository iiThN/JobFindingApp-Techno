import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import FormButton from "../components/Button";
import InputField from "../components/InputField";
import styles from "../components/styles";

import { useAuth } from "../context/AuthContext";
import { validateRegister } from "../validations/authValidation";

export default function Register() {
  const navigation = useNavigation();
  const { role } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { register } = useAuth();
  const isIntentionalNavigation = useRef(false);

  const handleRegister = () => {
    const validationError = validateRegister(
      name,
      email,
      password,
      confirmPassword
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    if (role === "Job Seeker") {
      const result = register({
        name,
        email,
        password,
        role,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      Alert.alert("Success", "Registration successful!", [
        {
          text: "OK",
          onPress: () => {
            isIntentionalNavigation.current = true;
            router.replace("/login");
          },
        },
      ]);
    }

    if (role === "Employer") {
      isIntentionalNavigation.current = true;

      router.push({
        pathname: "/getVerified",
        params: {
          role,
          name,
          email,
          password,
        },
      });
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isIntentionalNavigation.current) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        "Stop creating account?",
        "If you stop now you'll lose any progress you've made.",
        [
          {
            text: "Continue creating account",
            style: "cancel",
          },
          {
            text: "Stop creating account",
            style: "destructive",
            onPress: () => {
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>
              {role === "Job Seeker"
                ? "Join as a Job Seeker"
                : "Join as an Employer"}
            </Text>

            <Text style={styles.subtitle}>
              Set up your account to start
            </Text>

            <View style={styles.form}>
              <InputField
                label="Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError("");
                }}
              />

              <InputField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
              />

              <InputField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError("");
                }}
                secureTextEntry
              />

              <InputField
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError("");
                }}
                secureTextEntry
              />

              {error !== "" && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <FormButton
                btnTitle={
                  role === "Employer" ? "Get Verified" : "Register"
                }
                onPress={handleRegister}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}