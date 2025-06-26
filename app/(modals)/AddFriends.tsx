import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

  const router = useRouter();


const { width } = Dimensions.get("window");

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
}

export default function AddFriends() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await fetch("https://snapchat.epihub.eu/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-API-Key":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0eXZlbi5yYXlhQGVwaXRlY2guZXUiLCJpYXQiOjE3NDc4MTUyODR9.sDz1LgxDInnRtBH0Ie9_TRh_oyJYJ-pkCa4SFpbRIlw",
        },
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        setError(data.message || "Erreur lors du chargement des utilisateurs.");
      }
    } catch (e) {
      setError(`Impossible de joindre le serveur : ${e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Ajout d'un ami
  const addFriend = async (friendId: string) => {
    setAdding(friendId);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await fetch("https://snapchat.epihub.eu/user/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-API-Key":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0eXZlbi5yYXlhQGVwaXRlY2guZXUiLCJpYXQiOjE3NDc4MTUyODR9.sDz1LgxDInnRtBH0Ie9_TRh_oyJYJ-pkCa4SFpbRIlw",
        },
        body: JSON.stringify({ friendId }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Succès", "Ami ajouté !");
      } else {
        Alert.alert("Erreur", data.message || "Impossible d'ajouter cet ami.");
      }
    } catch (e) {
      Alert.alert(`Erreur", "Impossible d'ajouter cet ami. ${e}`);
    } finally {
      setAdding(null);
    }
  };

  // Filtrage par username
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.centeredContainer}>
          <View style={styles.innerContainer}>
            <TouchableOpacity
              style={{ alignSelf: "flex-start", marginBottom: 10 }}
              onPress={() => router.replace("/(tabs)/messagerie")}
            >
              <Text style={{ color: "#aaa", fontSize: 28, fontWeight: "bold", opacity: 0.7 }}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Ajouter un ami</Text>
            <TextInput
              style={styles.input}
              placeholder="Rechercher par username..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#aaa"
            />
            {loading ? (
              <ActivityIndicator size="large" color="#00b2ff" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <View style={styles.userItem}>
                    {item.profilePicture ? (
                      <Image
                        source={{ uri: item.profilePicture }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatar} />
                    )}
                    <Text style={styles.username}>{item.username}</Text>
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => addFriend(item._id)}
                      disabled={adding === item._id}
                    >
                      <Text style={{ color: "#fff", fontSize: 15 }}>
                        {adding === item._id ? "..." : "Ajouter"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  innerContainer: {
    width: "100%",
    maxWidth: 500,
    paddingHorizontal: 16,
    paddingTop: 24,
    flex: 1,
  },
  title: {
    fontSize: width > 500 ? 28 : 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: width > 500 ? 16 : 10,
    marginBottom: 16,
    fontSize: width > 500 ? 20 : 16,
    color: "#222",
    backgroundColor: "#fafafa",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: width > 500 ? 18 : 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: width > 500 ? 60 : 40,
    height: width > 500 ? 60 : 40,
    borderRadius: width > 500 ? 30 : 20,
    backgroundColor: "#eee",
    marginRight: 12,
  },
  username: {
    flex: 1,
    fontSize: width > 500 ? 20 : 16,
    color: "#222",
  },
  addBtn: {
    backgroundColor: "#00b2ff",
    paddingVertical: width > 500 ? 12 : 8,
    paddingHorizontal: width > 500 ? 28 : 18,
    borderRadius: 8,
  },
  errorText: {
    color: "#FF3B30",
    marginTop: 20,
    textAlign: "center",
    fontSize: width > 500 ? 18 : 14,
  },
});
