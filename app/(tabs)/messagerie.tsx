import SnapsRecusModal from "@/app/(modals)/SnapsRecusModal";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Types pour les messages et les utilisateurs
interface User {
  id: string;
  username: string;
  avatar: string;
  lastMessage?: {
    status: "received" | "opened";
    isSnap: boolean;
    hasSnap?: boolean;
    time?: string;
  };
}

export default function MessagerieScreen() {
  const router = useRouter();
  const [users, setFriends] = useState<User[]>([]);
  const [usersInfo, setUser] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapModal, setSnapModal] = useState<{
    from: string;
    username: string;
    avatar?: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);


  // Récupère la liste d'amis
  const fetchFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      console.log("Token récupéré :", token);
      // Récupère les amis
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
        let friendsArray: any[] = Array.isArray(data.data)
          ? data.data
          : [data.data];
        // Fetch tous les snaps reçus
        const snapsRes = await fetch("https://snapchat.epihub.eu/snap", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "X-API-Key":
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0eXZlbi5yYXlhQGVwaXRlY2guZXUiLCJpYXQiOjE3NDc4MTUyODR9.sDz1LgxDInnRtBH0Ie9_TRh_oyJYJ-pkCa4SFpbRIlw",
          },
        });
        const snapsData = await snapsRes.json();
        console.log("Réponse brute snaps:", snapsData);
        const snaps = Array.isArray(snapsData.data) ? snapsData.data : [];
        console.log("Tableau de snaps:", snaps);
        // Map des amis avec hasSnap et status du dernier snap reçu
        const users: User[] = friendsArray.map((friend: any) => {
          // Trouver tous les snaps reçus de cet ami
          const snapsFromFriend = snaps.filter(
            (snap: any) => snap.from === friend._id
          );
          // Vérifier si tous les snaps sont vus
          const allSeen =
            snapsFromFriend.length > 0 &&
            snapsFromFriend.every((snap: any) => snap.status === true);
          // Prendre le dernier snap reçu (le plus récent)
          const lastSnap =
            snapsFromFriend.length > 0
              ? snapsFromFriend[snapsFromFriend.length - 1]
              : null;
          let lastMessage;
          if (lastSnap) {
            // Statut du snap : 'opened' si tous vus, 'received' sinon
            const snapStatus = allSeen ? "opened" : "received";
            const hasSnap = !allSeen;
            lastMessage = {
              hasSnap,
              status: snapStatus as "received" | "opened",
              isSnap: hasSnap,
              time: lastSnap.date,
            };
          }
          return {
            id: friend._id,
            username: friend.username,
            avatar: friend.profilePicture,
            ...(lastMessage ? { lastMessage } : {}),
          };
        });
        setFriends(users);
      } else {
        setError(data.message || "Erreur API");
        console.log("Erreur API friends :", data.message);
      }
    } catch (e) {
      setError("Impossible de joindre le serveur");
      console.log("Erreur fetchFriends :", e);
    } finally {
      setLoading(false);
    }
  };


  // Récupère les infos de l'utilisateur connecté
  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const id = await SecureStore.getItemAsync("userId");
      console.log("Token récupéré :", token);
      const response = await fetch(`https://snapchat.epihub.eu/user/${id}`, {
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

        let userArray: any[] = Array.isArray(data.data)
          ? data.data
          : [data.data];
        const usersInfo: User[] = userArray.map((user: any) => ({
          id: user._id,
          username: user.username,
          avatar: user.profilePicture,
        }));
        setUser(usersInfo);
      } else {
        setError(data.message || "Erreur API");
      }
    } catch (e) {
      setError("Impossible de joindre le serveur");
      console.log("Erreur fetchUser :", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchUser();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriends();
    await fetchUser();
    setRefreshing(false);
  };

  const renderMessageStatus = (status: string, isSnap: boolean) => {
    if (isSnap) {
      switch (status) {
        case "received":
          return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons name="square" size={14} color="#FF0000" />
              <Text>Nouveau snap</Text>
            </View>
          );
        case "opened":
          return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="square-outline"
                size={14}
                color="#808080"
              />
              <Text>Ouvert</Text>
            </View>
          );
        default:
          return null;
      }
    }
    return null;
  };

  const deleteFriend = async (friendId: string) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await fetch("https://snapchat.epihub.eu/user/friends", {
        method: "DELETE",
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
        // Rafraîchir la liste d'amis après suppression
        fetchFriends();
      } else {
        alert(data.message || "Erreur lors de la suppression.");
      }
    } catch {
      alert("Impossible de supprimer cet ami.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00C6FF" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchFriends} style={styles.retryBtn}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }


  const renderItem = ({ item }: { item: User }) => {
    const hasSnap = item.lastMessage?.hasSnap;
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => {
          if (hasSnap) {
            setSnapModal({
              from: item.id,
              username: item.username,
              avatar: item.avatar,
            });
          }
        }}
      >
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username}</Text>
          <View style={styles.lastMessageContainer}>
            {renderMessageStatus(
              item.lastMessage?.status || "",
              !!item.lastMessage?.isSnap
            )}
            {item.lastMessage?.time && (
              <Text style={styles.timeText}>{item.lastMessage.time}</Text>
            )}
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera-outline" size={24} color="#00C6FF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={() =>
              Alert.alert(
                "Supprimer l'ami",
                `Voulez-vous vraiment supprimer ${item.username} de vos amis ?`,
                [
                  { text: "Annuler", style: "cancel" },
                  {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: () => deleteFriend(item.id),
                  },
                ]
              )
            }
          >
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.push("../(auth)/Profil")}
            style={styles.profileButton}
          >
            <Image
              source={    usersInfo[0]?.avatar
                ? { uri: usersInfo[0].avatar }
                : require("../../assets/images/avatar-default-snapchoc.png")}
              style={styles.profileAvatar}
              contentFit="cover"
              transition={300}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/(modals)/AddFriends")}
          >
            <Ionicons name="person-add" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Chat</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      {snapModal && (
        <SnapsRecusModal
          from={snapModal.from}
          username={snapModal.username}
          avatar={snapModal.avatar}
          visible={!!snapModal}
          onClose={() => {
            setSnapModal(null);
            fetchFriends();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ccc",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  tab: {
    paddingVertical: 8,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#000000",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#808080",
  },
  activeTabText: {
    color: "#000000",
    fontWeight: "bold",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 80,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F0F0",
  },
  avatarWithStory: {
    borderWidth: 2,
    borderColor: "#00C6FF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  lastMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessageText: {
    fontSize: 14,
    color: "#808080",
    marginLeft: 5,
    marginRight: 5,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: "#BBBBBB",
  },
  cameraButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 10,
  },
  retryBtn: {
    padding: 10,
    backgroundColor: "#00C6FF",
    borderRadius: 6,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
