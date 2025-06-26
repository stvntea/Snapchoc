import * as ImageManipulator from "expo-image-manipulator";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// User type
type User = {
  id: string;
  username: string;
  avatar?: string;
};

type SendSnapProps = {
  image: string;
  duration: number;
  onSent?: () => void;
};

const compressAndGetBase64 = async (uri: string) => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1000 } }], // adjust width as needed
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return result.base64;
};

export default function SendSnap({ onSent }: SendSnapProps) {
  const router = useRouter();
  const { uri, duration } = useLocalSearchParams<{
    uri: string;
    duration: string;
  }>();
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);

  // Fetch friends
  const fetchFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      console.log("Token récupéré :", token);
      const response = await fetch("https://snapchat.epihub.eu/user/friends", {
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
      if (response.ok) {
        let friendsArray: any[] = [];
        if (Array.isArray(data.data)) {
          friendsArray = data.data;
        } else if (data.data && typeof data.data === "object") {
          friendsArray = [data.data];
        }
        const users: User[] = friendsArray.map((friend: any) => ({
          id: friend._id,
          username: friend.username,
          avatar: friend.profilePicture,
        }));
        setFriends(users);
      } else {
        setError(data.message || "Erreur API");
      }
    } catch (e) {
      setError("Impossible de joindre le serveur");
      console.log("Erreur fetchFriends :", e);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFriends();
  }, []);

  // Send snap to selected friend
  const sendSnap = async () => {
    if (!selectedFriend) return;
    setSending(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const base64 = await compressAndGetBase64(uri);
      const base64WithPrefix = `data:image/jpeg;base64,${base64}`;
      const response = await fetch("https://snapchat.epihub.eu/snap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-API-Key":
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0eXZlbi5yYXlhQGVwaXRlY2guZXUiLCJpYXQiOjE3NDc4MTUyODR9.sDz1LgxDInnRtBH0Ie9_TRh_oyJYJ-pkCa4SFpbRIlw",
        },
        body: JSON.stringify({
          to: selectedFriend.id,
          image: base64WithPrefix,
          duration: duration,
        }),
      });
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      console.log("Réponse API envoi snap :", data); 
      if (response.ok) {
        Alert.alert("Succès", "Snap envoyé !");
        // Redirige vers la caméra après l'envoi
        if (onSent) onSent();
        router.replace("/(tabs)/camera");
      } else {
        setError(
          (data && data.message) || data || "Erreur lors de l'envoi du snap"
        );
        console.log("Erreur API envoi snap :", data);
      }
    } catch (e) {
      setError("Impossible d'envoyer le snap");
      console.log("Erreur sendSnap :", e);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Envoyer à :</Text>
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={styles.errorText}>
          {typeof error === "string" ? error : JSON.stringify(error)}
        </Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.userItem,
                {
                  backgroundColor:
                    selectedFriend?.id === item.id ? "#e0e0e0" : "#fff",
                },
              ]}
              onPress={() => {
                setSelectedFriend(item);
              }}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      selectedFriend?.id === item.id ? "#FF3B30" : "#ccc",
                  },
                ]}
              />
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar} />
              )}
              <Text style={styles.userName}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <View style={styles.sendButton}>
        <Button
          title={sending ? "Envoi..." : "Envoyer le snap"}
          onPress={sendSnap}
          disabled={!selectedFriend || sending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#ccc",
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  sendButton: {
    bottom:80,
    marginTop: 16,
  },
  errorText: {
    color: "red",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#FF3B30",
  },
});
