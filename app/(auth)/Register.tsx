import React, { useState } from "react";
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
  Register: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const checkEmailResponse = await fetch(
        `https://snapchat.epihub.eu/user/check-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de vérifier l'email");
      console.error("Email check error:", error);
      return;
    }

    try {
      const response = await fetch("https://snapchat.epihub.eu/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application.json",
          "x-api-key":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFudGhvbnktc3RldmVuLnRlYUBlcGl0ZWNoLmV1IiwiaWF0IjoxNzQ3NzUyMDk4fQ.5oecAgKTJ3HFgGApI0kFil_C3pXL6egEw1xAqeMEyw0",
        },
        body: JSON.stringify({ username, email, profilePicture: "", password }),
      });

      if (response.ok) {
        Alert.alert("Succès", "Inscription réussie");
        router.push("/Login");
      }
    } catch (error) {
      Alert.alert("Erreur", "Connexion impossible");
      console.error("Register error:", error);
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
          source={require("../../assets/images/snapchoc-logo.png")} // change selon ton image
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Champ username */}
      <TextInput
        placeholder="Nom d'utilisateur"
        placeholderTextColor="#CCCCCC"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

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

      {/* Champ confirmer mot de passe */}
      <TextInput
        placeholder="Confirmer le mot de passe"
        placeholderTextColor="#CCCCCC"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* Bouton s'inscrire */}
      <TouchableOpacity
        onPress={handleRegister}
        activeOpacity={0.8}
        style={styles.loginButton}
      >
        <Text style={styles.loginButtonText}>S&apos;inscrire</Text>
      </TouchableOpacity>

      {/* Lien se connecter */}
      <TouchableOpacity
        onPress={() => router.push("/(auth)/Login")}
        style={styles.signupLink}
      >
        <Text style={styles.signupText}>Se connecter</Text>
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
export default RegisterScreen;
