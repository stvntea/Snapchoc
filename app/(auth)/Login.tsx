import React, { useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: { token: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await fetch("https://snapchat.epihub.eu/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accept: "application.json",
          "x-api-key":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFudGhvbnktc3RldmVuLnRlYUBlcGl0ZWNoLmV1IiwiaWF0IjoxNzQ3NzUyMDk4fQ.5oecAgKTJ3HFgGApI0kFil_C3pXL6egEw1xAqeMEyw0",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.data.token) {
        const token = data.data.token;
        router.push('/(tabs)/camera')
        const userId = data.data._id;

        // Stockage sécurisé
        await SecureStore.setItemAsync("userToken", token);
        await SecureStore.setItemAsync("userId", userId);

        console.log("Connexion réussie !");
        router.push("/(tabs)/camera");
      } else {
        console.log("Erreur", data.message ?? "Identifiants invalides");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Erreur", "Connexion impossible");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/snapchoc-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Champ email */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#CCCCCC"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />

      {/* Champ mot de passe */}
      <TextInput
        placeholder="Mot de passe"
        placeholderTextColor="#CCCCCC"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* Bouton se connecter */}
      <TouchableOpacity
        onPress={handleLogin}
        activeOpacity={0.8}
        style={styles.loginButton}
      >
        <Text style={styles.loginButtonText}>Se connecter</Text>
      </TouchableOpacity>

      {/* Lien s'inscrire */}
      <TouchableOpacity
        onPress={() => router.push("/(auth)/Register")}
        style={styles.signupLink}
      >
        <Text style={styles.signupText}>S&apos;inscrire</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 80,
  },
  logo: {
    width: 150,
    height: 150,
  },
  input: {
    color: "white",
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginBottom: 20,
    paddingBottom: 8,
  },
  loginButton: {
    backgroundColor: "#FFFC00",
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  signupLink: {
    alignItems: "center",
  },
  signupText: {
    color: "white",
    textDecorationLine: "underline",
    fontSize: 16,
  },
});

export default LoginScreen;
