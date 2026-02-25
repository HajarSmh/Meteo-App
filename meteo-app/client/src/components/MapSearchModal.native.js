import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import weatherApi from '../api/weatherApi';

//import conditionnel selon la plateforme
let MapView, Marker;
if (Platform.OS !== 'web') {
    try {
        const maps = require('react-native-maps');
        MapView = maps.default;
        Marker = maps.Marker;
    } catch (e) {
        console.warn('react-native-maps not available');
    }
}
//modal pour la recherche sur la carte
const MapSearchModal = ({ visible, onClose, onLocationSelected, theme }) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const mapRef = useRef(null);

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
    };
    //confirmer la localisation
    const handleConfirmLocation = async () => {
        if (!selectedLocation) {
            Alert.alert('Attention', 'Veuillez sélectionner un emplacement sur la carte');
            return;
        }
        setLoading(true);
        try {
            const locationResult = await weatherApi.getCityFromLocation(
                selectedLocation.latitude,
                selectedLocation.longitude
            );

            if (locationResult.success) {
                onLocationSelected(locationResult.city);
                onClose();
                setSelectedLocation(null);
            } else {
                Alert.alert('Erreur', locationResult.error);
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de déterminer la ville à cet emplacement');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedLocation(null);
        onClose();
    };

    // Rendu pour mobile avec react-native-maps
    const renderMobileMap = () => {
        if (!MapView) {
            return (
                <View style={[styles.map, { backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: theme.text }}>react-native-maps non disponible</Text>
                </View>
            );
        }

        return (
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: 33.5731,
                    longitude: -7.5898,
                    latitudeDelta: 10,
                    longitudeDelta: 10,
                }}
                onPress={handleMapPress}
            >
                {selectedLocation && (
                    <Marker
                        coordinate={selectedLocation}
                        title="Emplacement sélectionné"
                        pinColor={theme.primary}
                    />
                )}
            </MapView>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={handleClose}
        >
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { backgroundColor: theme.primary }]}>
                    <Text style={styles.headerTitle}>Sélectionner sur la carte</Text>
                    <Text style={styles.headerSubtitle}>
                        Appuyez sur la carte pour choisir un emplacement
                    </Text>
                </View>

                {renderMobileMap()}

                {selectedLocation && (
                    <View style={[styles.infoBox, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.infoText, { color: theme.text }]}>
                            📍 Latitude: {selectedLocation.latitude.toFixed(4)}
                        </Text>
                        <Text style={[styles.infoText, { color: theme.text }]}>
                            📍 Longitude: {selectedLocation.longitude.toFixed(4)}
                        </Text>
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton, {
                            backgroundColor: theme.surface,
                            borderColor: theme.border
                        }]}
                        onPress={handleClose}
                        disabled={loading}
                    >
                        <Text style={[styles.buttonText, { color: theme.text }]}>Annuler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.confirmButton,
                            { backgroundColor: theme.primary },
                            !selectedLocation && styles.buttonDisabled,
                        ]}
                        onPress={handleConfirmLocation}
                        disabled={!selectedLocation || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.confirmButtonText}>Confirmer</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#E3F2FD',
    },
    map: {
        flex: 1,
    },
    infoBox: {
        position: 'absolute',
        top: 140,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoText: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    confirmButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MapSearchModal;
