import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
export default function Connexion() {
    const router = useRouter();
    return (
        <View>
            {/* Main dark container */}
            <View style={styles.mainContainer}>
                {/* Logo area */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/snapchoc-logo.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

              {/* Spacer */}
              <View style={styles.spacer}></View>
            </View>

            {/* Bottom buttons */}
            <View style={styles.bottomContainer}>
                {/* Connection button */}
                <TouchableOpacity style={styles.connectionButton}
                onPress={() => router.push('/(auth)/Login')}>
                    <Text style={styles.buttonText}>CONNEXION</Text>
                    
                </TouchableOpacity>

                {/* Registration button */}
                <TouchableOpacity style={styles.registrationButton}
                               onPress={() => router.push('/(auth)/Register')}>
                    <Text style={styles.buttonText}>INSCRIPTION</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        marginHorizontal: 150, 
        marginVertical: 300, 
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 150,
        height: 150,
    },

    spacer: {
        flex: 1,
    },

    bottomContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    connectionButton: {
        height: 64, 
        backgroundColor: '#dc2626', 
        alignItems: 'center',
        justifyContent: 'center',
    },
    registrationButton: {
        height: 64, // h-16
        backgroundColor: '#f97316', 
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff', // text-white
        fontWeight: 'bold',
        fontSize: 18, // text-xl
        letterSpacing: 1.5, // tracking-wider
    },
});