import { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  BackHandler
} from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import FormButton from "../components/Button";
import InputField from "../components/InputField";
import styles from "../components/styles";

import { useAuth } from "../context/AuthContext";
import { validateLogin } from "../validations/authValidation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleLogin = () => {
    const validationError = validateLogin(email, password);

    if (validationError) {
      setError(validationError);
      return;
    }

    const result = login(email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setError("");
    setEmail("");
    setPassword("");

    Alert.alert("Success", "Login successful!", [
      {
        text: "OK",
        onPress: () => router.replace("/(tabs)"),
      },
    ]);
  };

  // useEffect(() => {

  //   const backAction = () => {

  //     return true; 
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction
  //   );

  //   return () => backHandler.remove();
  // }, []);

  return (
    <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}
    >
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      showsVerticalScrollIndicator={false}
    >
      <Image 
        source={require('../assets/images/inJob-horizontal-dark.png')} 
        style={styles.inJob_logo} 
      />
      <View style={styles.card}>

        <Text style={styles.title}>
          Welcome Back
        </Text>

            <Text style={styles.subtitle}>
              Login to your account to continue
            </Text>

        <View style={styles.form}>

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

              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() =>
                  Alert.alert(
                    "Forgot Password",
                    "This feature is coming soon."
                  )
                }
              >
                <Text style={styles.forgotText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {error !== "" && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <FormButton
                btnTitle="Login"
                onPress={handleLogin}
              />
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/selectRole")}
              >
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}