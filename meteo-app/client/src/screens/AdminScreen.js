import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ScrollView, StatusBar, Platform
} from 'react-native';
import weatherApi from '../api/weatherApi';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

const AdminScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [city, setCity] = useState('');
    const [report, setReport] = useState('');
    const [myReports, setMyReports] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            if (isLoggedIn && adminData) {
                loadMyReports();
            }
        }, [isLoggedIn, adminData])
    );
    //pour charger les rapports
    const loadMyReports = async () => {
        try {
            const result = await weatherApi.getAdminReports(adminData.id);
            if (result.success) {
                setMyReports(result.reports || []);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des rapports:", error);
        }
    };
    //pour se connecter
    const handleLogin = async () => {
        const result = await weatherApi.loginAdmin(username, password);
        if (result.success) {
            setIsLoggedIn(true);
            setAdminData(result.user);
        } else {
            Alert.alert("Erreur", "Identifiants incorrects");
        }
    };
    //pour envoyer un rapport
    const handleSendReport = async () => {
        if (!city || !report) return Alert.alert("Attention", "Remplissez tous les champs");
        const result = await weatherApi.postWeatherReport({
            city_name: city,
            content: report,
            author_id: adminData.id
        });
        if (result.success) {
            Alert.alert("Succès", "Rapport publié !");
            setReport('');
            setCity('');
            loadMyReports();
        }
    };
    //pour modifier un rapport
    const handleUpdateReport = async (reportId) => {
        if (!editContent.trim()) return Alert.alert("Attention", "Le contenu ne peut pas être vide");

        const result = await weatherApi.updateReport(reportId, editContent);
        if (result.success) {
            setEditingId(null);
            setEditContent('');
            loadMyReports();
            Alert.alert("Succès", "Rapport mis à jour !");
        } else {
            Alert.alert("Erreur", "Impossible de modifier le rapport");
        }
    };
    const startEditing = (item) => {
        setEditingId(item.id);
        setEditContent(item.content);
    };
    //pour supprimer un rapport
    const handleDeleteReport = async (reportId) => {
        Alert.alert(
            "Supprimer",
            "Voulez-vous vraiment supprimer ce rapport ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        const result = await weatherApi.deleteReport(reportId);
                        if (result.success) {
                            setMyReports(prev => prev.filter(r => r.id !== reportId));
                            Alert.alert("Succès", "Rapport supprimé");
                        } else {
                            Alert.alert("Erreur", "Impossible de supprimer: " + (result.error || "Erreur inconnue"));
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#4A90E2' }]} />
            <View style={[styles.darkOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.2)' }]} />

            <ScrollView contentContainerStyle={styles.mainWrapper} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Espace Admin</Text>

                {!isLoggedIn ? (
                    <View style={[styles.glassCard, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.15)' }]}>
                        <Text style={styles.cardTitle}>Connexion</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Identifiant"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={username}
                            onChangeText={setUsername}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Se connecter</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <View style={[styles.glassCard, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.15)' }]}>
                            <Text style={styles.cardTitle}>Publier un rapport</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ville (ex: Casablanca)"
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={city}
                                onChangeText={setCity}
                            />
                            <TextInput
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                placeholder="Votre message météo..."
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                multiline
                                value={report}
                                onChangeText={setReport}
                            />
                            <TouchableOpacity style={[styles.button, { backgroundColor: '#27AE60' }]} onPress={handleSendReport}>
                                <Text style={[styles.buttonText, { color: '#fff' }]}>Diffuser l'alerte</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>Mes rapports publiés</Text>

                        {myReports.length > 0 ? (
                            myReports.map((item) => (
                                <View key={item.id} style={styles.reportItem}>
                                    <View style={styles.reportContent}>
                                        <Text style={styles.reportCity}>{item.city_name}</Text>

                                        {/* LOGIQUE D'AFFICHAGE : TEXTE OU INPUT SI ÉDITION */}
                                        {editingId === item.id ? (
                                            <TextInput
                                                style={styles.editInput}
                                                value={editContent}
                                                onChangeText={setEditContent}
                                                multiline
                                                autoFocus
                                            />
                                        ) : (
                                            <Text style={styles.reportText} numberOfLines={3}>{item.content}</Text>
                                        )}

                                        <Text style={styles.reportDate}>Publié le {new Date(item.created_at).toLocaleDateString()}</Text>
                                    </View>

                                    {/* BOUTONS D'ACTION (EDITER / VALIDER) */}
                                    <View style={styles.actionColumn}>
                                        {editingId === item.id ? (
                                            <TouchableOpacity style={styles.saveBtn} onPress={() => handleUpdateReport(item.id)}>
                                                <Text style={styles.actionIcon}>✓</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity style={styles.editBtn} onPress={() => startEditing(item)}>
                                                <Text style={styles.actionIcon}>✏️</Text>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteReport(item.id)}>
                                            <Text style={styles.deleteIcon}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Aucun rapport publié.</Text>
                        )}

                        <TouchableOpacity style={{ marginVertical: 30 }} onPress={() => setIsLoggedIn(false)}>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', textDecorationLine: 'underline' }}>Déconnexion</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    darkOverlay: { ...StyleSheet.absoluteFillObject },
    mainWrapper: { paddingTop: Platform.OS === 'ios' ? 80 : 60, paddingHorizontal: 20, paddingBottom: 40 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 40 },
    glassCard: {
        borderRadius: 28,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 10,
    },
    cardTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 15, marginLeft: 5 },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        padding: 15,
        color: '#fff',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    editInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        padding: 10,
        color: '#fff',
        fontSize: 14,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#F1C40F',
    },
    button: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 16 },
    reportItem: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden'
    },
    reportContent: { flex: 1, padding: 15 },
    reportCity: { color: '#F1C40F', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    reportText: { color: '#fff', fontSize: 14, opacity: 0.9 },
    reportDate: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 8 },
    actionColumn: {
        width: 55,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,255,255,0.1)'
    },
    editBtn: {
        flex: 1,
        backgroundColor: 'rgba(241, 196, 15, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    saveBtn: {
        flex: 1,
        backgroundColor: 'rgba(39, 174, 96, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    deleteBtn: {
        flex: 1,
        backgroundColor: 'rgba(255, 107, 107, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIcon: { color: '#fff', fontSize: 16 },
    deleteIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    emptyText: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontStyle: 'italic', marginTop: 10 }
});

export default AdminScreen;