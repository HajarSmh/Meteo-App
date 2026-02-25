import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import weatherApi from '../api/weatherApi';
import { useTheme } from '../context/ThemeContext';

// Import Leaflet pour le web
const { MapContainer, TileLayer, Marker, useMapEvents } = require('react-leaflet');

// Composant pour gérer les clics sur la carte
const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
};
//modal pour la recherche sur la carte
const MapSearchModal = ({ visible, onClose, onLocationSelected, theme: themeProp }) => {
    const { theme: contextTheme, isDarkMode } = useTheme();
    const theme = themeProp || contextTheme;
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);

    // Charger le CSS de Leaflet
    useEffect(() => {
        if (Platform.OS === 'web') {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            document.head.appendChild(link);

            // Fix pour les icônes de Leaflet
            const L = require('leaflet');
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
        }
    }, []);
    //gérer les clics sur la carte
    const handleMapPress = (event) => {
        const { lat, lng } = event;
        setSelectedLocation({ latitude: lat, longitude: lng });
    };
    //confirmer la localisation
    const handleConfirmLocation = async () => {
        if (!selectedLocation) {
            alert('Veuillez sélectionner un emplacement sur la carte');
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
                alert(`Erreur: ${locationResult.error}`);
            }
        } catch (error) {
            alert('Impossible de déterminer la ville à cet emplacement');
        } finally {
            setLoading(false);
        }
    };
    //fermer le modal
    const handleClose = () => {
        setSelectedLocation(null);
        onClose();
    };

    return (
        //modal pour la recherche sur la carte
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
                        Cliquez sur la carte pour choisir un emplacement
                    </Text>
                </View>

                <div style={{ flex: 1, height: '100%' }}>
                    <MapContainer
                        center={[33.5731, -7.5898]} // Casablanca par défaut
                        zoom={5}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url={isDarkMode
                                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            }
                        />
                        <MapClickHandler onMapClick={handleMapPress} />
                        {selectedLocation && (
                            <Marker
                                position={[selectedLocation.latitude, selectedLocation.longitude]}
                            />
                        )}
                    </MapContainer>
                </div>

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
    infoBox: {
        position: 'absolute',
        top: 140,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
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
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
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
