import { Image as ExpoImage } from "expo-image";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface SnapsRecusModalProps {
  from: string;
  username: string;
  avatar?: string;
  visible: boolean;
  onClose: () => void;
}

export default function SnapsRecusModal({
  from,
  username,
  avatar,
  visible,
  onClose,
}: SnapsRecusModalProps) {
  const [loading, setLoading] = useState(true);
  const [snaps, setSnaps] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setCurrent(0);
    const fetchSnaps = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await SecureStore.getItemAsync("userToken");
        // 1. Récupérer la liste des snaps
        const response = await fetch("https://snapchat.epihub.eu/snap", {
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
          // 2. Filtrer les snaps dont le champ 'from' correspond à l'id de l'ami
          const snapsFromFriend = data.data.filter(
            (snap: any) => snap.from === from
          );
          let snapsValides: any[] = [];
          if (snapsFromFriend.length > 0) {
            // 3. Pour chaque snap filtré, fetch les détails complets
            const snapsComplets = await Promise.all(
              snapsFromFriend.map(async (snap: any) => {
                const res = await fetch(
                  `https://snapchat.epihub.eu/snap/${snap._id}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      Accept: "application/json",
                      Authorization: `Bearer ${token}`,
                      "X-API-Key":
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0eXZlbi5yYXlhQGVwaXRlY2guZXUiLCJpYXQiOjE3NDc4MTUyODR9.sDz1LgxDInnRtBH0Ie9_TRh_oyJYJ-pkCa4SFpbRIlw",
                    },
                  }
                );
                const snapComplet = await res.json();
                if (
                  res.ok &&
                  snapComplet.data &&
                  snapComplet.data.status !== true
                )
                  return snapComplet.data;
                return null;
              })
            );
            // 4. Filtrer les snaps valides
            snapsValides = snapsComplets.filter((snap) => snap !== null);
          }
          if (snapsValides.length > 0) {
            setSnaps(snapsValides);
          } else {
            setError("Aucun snap reçu de cet utilisateur.");
          }
        } else {
          setError("Erreur lors du chargement des snaps.");
        }
      } catch (e) {
        setError(`Erreur lors du chargement des snaps : ${e}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSnaps();
  }, [from, visible]);

  // Fonction pour marquer un snap comme vu
  const markSnapAsSeen = async (id: string) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      await fetch(`https://snapchat.epihub.eu/snap/seen/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-API-Key":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0eXZlbi5yYXlhQGVwaXRlY2guZXUiLCJpYXQiOjE3NDc4MTUyODR9.sDz1LgxDInnRtBH0Ie9_TRh_oyJYJ-pkCa4SFpbRIlw",
        },
      });
    } catch (e) {
      setError(`Erreur lors de la mise à jour du snap : ${e}`);
    }
  };

  // Swipe/tap pour quitter ou passer au snap suivant
  const handlePress = () => {
    if (snaps[current]?._id) {
      markSnapAsSeen(snaps[current]._id);
    }
    if (current < snaps.length - 1) {
      setCurrent(current + 1);
    } else {
      onClose();
    }
  };

  // Timer automatique selon la durée du snap courant
  useEffect(() => {
    if (!visible || snaps.length === 0) return;
    const snap = snaps[current];
    if (!snap) return;
    if (!snap.image) return;
    const timer = setTimeout(() => {
      if (snap._id) {
        console.log("Marking snap as seen : ", snap._id);
        markSnapAsSeen(snap._id);
      }
      if (current < snaps.length - 1) {
        setCurrent(current + 1);
      } else {
        onClose();
      }
    }, (snap.duration || 5) * 1000);
    return () => clearTimeout(timer);
  }, [current, snaps, visible, onClose]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableOpacity
        style={styles.snapContainer}
        activeOpacity={1}
        onPress={handlePress}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#00C6FF" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.header} pointerEvents="box-none">
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar} />
              )}
              <Text style={styles.username}>{username}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtnHeader}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.snapContent}>
              {snaps[current]?.image ? (
                <ExpoImage
                  source={{ uri: snaps[current].image }}
                  style={styles.snapImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.snapText}>Snap reçu</Text>
              )}
              {snaps[current]?.duration && (
                <Text style={{ color: "white", fontSize: 18, marginTop: 16 }}>
                  {snaps[current].duration} seconde
                  {snaps[current].duration > 1 ? "s" : ""}
                </Text>
              )}
            </View>
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {current + 1} / {snaps.length}
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  snapContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.98)",
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.98)",
  },
  header: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ccc",
    marginRight: 12,
  },
  username: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    flex: 1,
  },
  closeBtnHeader: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    marginLeft: 8,
  },
  snapContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  snapImage: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    backgroundColor: "#222",
  },
  snapText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  footerText: {
    color: "white",
    fontSize: 16,
    opacity: 0.7,
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 10,
    fontSize: 18,
  },
  closeBtn: {
    padding: 10,
    backgroundColor: "#00C6FF",
    borderRadius: 6,
    marginTop: 20,
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
