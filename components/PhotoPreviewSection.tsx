import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PhotoPreviewSectionProps {
  photo: any;
  handleRetakePhoto: () => void;
  onSent?: () => void; // Ajout de la prop onSent
}

export default function PhotoPreviewSection({
  photo,
  handleRetakePhoto,
  onSent,
}: PhotoPreviewSectionProps) {
  const router = useRouter();
  const [duration, setDuration] = useState(5); // Durée par défaut
  const [showPicker, setShowPicker] = useState(false);
  const [timerBtnPos, setTimerBtnPos] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({ x: 0, y: 0, width: 0, height: 0 });
  const screenWidth = Dimensions.get("window").width;

  const handleClosePress = () => {
    console.log("Close button pressed");
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      handleRetakePhoto();
    } catch (error) {
      console.error("Error in handleClosePress:", error);
    }
  };

  const handleSendPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(modals)/SendSnap",
      params: { uri: photo.uri, duration },
    });
    if (onSent) onSent(); // Réinitialise la preview après navigation
  };

  if (!photo || !photo.uri) {
    console.error("Invalid photo object:", photo);
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>No photo data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: photo.uri }}
        style={styles.preview}
        resizeMode="cover"
        onError={(e) =>
          console.error("Image loading error:", e.nativeEvent.error)
        }
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClosePress}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.editTools}>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="text" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="cut" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.durationIconBtn}
            onPress={() => setShowPicker(!showPicker)}
            onLayout={(e) => setTimerBtnPos(e.nativeEvent.layout)}
          >
            <Ionicons name="time-outline" size={24} color="#fff" />
            <Text style={{ color: "white", fontSize: 14, marginLeft: 4 }}>
              {duration}s
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <View
              style={[
                styles.dropdownMenu,
                {
                  top: timerBtnPos.y + timerBtnPos.height + 4,
                  left: Math.max(0, timerBtnPos.x + timerBtnPos.width - 120),
                  width: 120,
                  maxWidth: screenWidth - 40,
                },
              ]}
            >
              {[1, 3, 5, 10].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setDuration(val);
                    setShowPicker(false);
                  }}
                >
                  <Text
                    style={{
                      color: duration === val ? "#00b2ff" : "white",
                      fontWeight: duration === val ? "bold" : "normal",
                      fontSize: 16,
                    }}
                  >
                    {val}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.sendButton} onPress={handleSendPress}>
          <Text style={styles.sendText}>Envoyer à</Text>
          <Ionicons name="paper-plane" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  preview: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  editTools: {
    flexDirection: "column",
    alignItems: "center",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  durationIconBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: "relative",
  },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: "#222",
    borderRadius: 8,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    minWidth: 90,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  sendButton: {
    bottom: 80,
    flexDirection: "row",
    backgroundColor: "#00b2ff", 
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});
