import PhotoPreviewSection from "@/components/PhotoPreviewSection";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useRef, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View, Dimensions, SafeAreaView } from "react-native";

const { width, height } = Dimensions.get("window");

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const cameraRef = useRef<CameraView | null>(null);
  const lastTapRef = useRef<number>(0);

  useFocusEffect(
    useCallback(() => {
      setIsCameraActive(true);
      return () => {
        setIsCameraActive(false);
      };
    }, [])
  );

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          Nous avons besoin de votre permission pour afficher la caméra
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
      };
      const takedPhoto = await cameraRef.current.takePictureAsync(options);
      // Copier la photo dans un dossier persistant
      const fileName =
        takedPhoto.uri.split("/").pop() || `photo_${Date.now()}.jpg`;
      const cacheDir =
        FileSystem.cacheDirectory || FileSystem.documentDirectory;
      const newPath = cacheDir + fileName;
      await FileSystem.copyAsync({ from: takedPhoto.uri, to: newPath });
      setPhoto({ ...takedPhoto, uri: newPath });
    }
  };

  const handleRetakePhoto = () => setPhoto(null);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300; // millisecondes

    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      toggleCameraFacing();
    }

    lastTapRef.current = now;
  };

  // Ajout : Importer une photo depuis la galerie
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission refusée pour accéder à la galerie");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const fileName = asset.uri.split("/").pop() || `photo_${Date.now()}.jpg`;
      const cacheDir =
        FileSystem.cacheDirectory || FileSystem.documentDirectory;
      const newPath = cacheDir + fileName;
      await FileSystem.copyAsync({ from: asset.uri, to: newPath });
      setPhoto({
        uri: newPath,
        base64: asset.base64,
        width: asset.width,
        height: asset.height,
      });
    }
  };

  if (photo)
    return (
      <PhotoPreviewSection
        photo={photo}
        handleRetakePhoto={handleRetakePhoto}
        onSent={() => setPhoto(null)} // Ajout : reset la photo après envoi
      />
    );

  if (!isCameraActive) {
    // Désactive la caméra quand l'écran n'est pas focus
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.fullScreenTouchable}
        onPress={handleDoubleTap}
      >
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
        <View style={styles.buttonContainerAbsolute}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handlePickImage}
          >
            <Ionicons name="images" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto} />
          <View style={styles.spacerRight} />
          </View>
          </View>
          </SafeAreaView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 5,
    // backgroundColor: "black",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingBottom: 40,
  },
  buttonContainerAbsolute: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around", 
    alignItems: "center",
    paddingHorizontal: 30, 
    zIndex: 20,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: "white",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  fullScreenTouchable: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 10,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 0,
    alignSelf: "center",
  },
  spacerRight: {
    width: 50,
  },
});
