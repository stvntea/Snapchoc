import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";


const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFudGhvbnktc3RldmVuLnRlYUBlcGl0ZWNoLmV1IiwiaWF0IjoxNzQ3NzUyMDk4fQ.5oecAgKTJ3HFgGApI0kFil_C3pXL6egEw1xAqeMEyw0";

export default function Profil() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [bearerToken, setBearerToken] = useState('');

  useEffect(() => {
    const getTokenAndProfile = async () => {
      const storedToken = await SecureStore.getItemAsync('userToken');
      if (storedToken) {
        setBearerToken(storedToken);
        fetchUserProfile(storedToken);
      } else {
        Alert.alert('Erreur', 'Token utilisateur manquant');
        router.push("/(auth)/Login");
      }
    };
    getTokenAndProfile();
  }, []);

  const fetchUserProfile = async (tokenValue: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://snapchat.epihub.eu/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'authorization': `Bearer ${tokenValue}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsername(data.data.username);
        setEmail(data.data.email);
        setProfilePicture(data.data.profilePicture);
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de charger le profil');
      }
    } catch {
      Alert.alert('Erreur', 'Erreur réseau');
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!email || !username) {
      Alert.alert('Erreur', 'Email et username sont obligatoires');
      return;
    }
    setLoading(true);
    try {
      const body = {
        email,
        username,
        profilePicture: profilePicture || "",
      };

      const response = await fetch('https://snapchat.epihub.eu/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'authorization': `Bearer ${bearerToken}`
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Succès', 'Profil mis à jour');
        setPassword('');
        fetchUserProfile(bearerToken);
      } else {
        Alert.alert('Erreur', data.message || JSON.stringify(data) || 'Update failed');
      }
    } catch {
      Alert.alert('Erreur', 'Erreur réseau');
    }
    setLoading(false);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets[0].base64) {
        setProfilePicture(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de charger l\'image');
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    router.push("/(auth)/Login");
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://snapchat.epihub.eu/user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'authorization': `Bearer ${bearerToken}`
        }
      });
      if (response.ok) {
        Alert.alert('Compte supprimé', 'Votre compte a été supprimé.');
        await SecureStore.deleteItemAsync('userToken');
        router.replace('/(auth)/Login');
      } else {
        const data = await response.json();
        Alert.alert('Erreur', data.message || 'Suppression échouée');
      }
    } catch {
      Alert.alert('Erreur', 'Erreur réseau');
    }
    setLoading(false);
  };

  const confirmLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Oui", style: "destructive", onPress: handleLogout }
      ]
    );
  };
  
  const confirmDeleteAccount = () => {
    Alert.alert(
      "Suppression du compte",
      "Voulez-vous vraiment supprimer votre compte ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: handleDeleteAccount }
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>
      <Text style={styles.label}>Nom d&apos;utilisateur</Text>
      <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholderTextColor="#666" />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholderTextColor="#666" />
      <Text style={styles.label}>Nouveau mot de passe</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#666" />
      <Text style={styles.label}>Photo de profil</Text>
      {profilePicture ? (
        <Image source={{ uri: profilePicture }} style={styles.avatar} />
      ) : (
        <Text style={[styles.label, { textAlign: 'center' }]}>Aucune photo</Text>
      )}
      <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>Changer la photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>Mettre à jour</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: 'orange' }]} onPress={confirmLogout}>
        <Text style={styles.buttonText}>Déconnexion</Text>
      </TouchableOpacity>
      <TouchableOpacity
  style={[styles.button, { backgroundColor: 'red' }]}
  onPress={confirmDeleteAccount}
>
  <Text style={styles.buttonText}>Supprimer le compte</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.backButton}
  onPress={() => router.replace('/(tabs)/messagerie')}
>
  <Text style={styles.backButtonText}>{"<"}</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    color: 'white',
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FFFC00',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFFC00',
  },
  imageButton: {
    backgroundColor: '#333',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 8,
  },
  backButtonText: {
    color: '#aaa',
    fontSize: 28,
    fontWeight: 'bold',
    opacity: 0.7,
  },
});