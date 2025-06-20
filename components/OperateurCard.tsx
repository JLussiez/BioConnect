import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Operateur } from '../services/bioOperateursApi';

interface OperateurCardProps {
    operateur: Operateur;
    onPress?: (operateur: Operateur) => void;
}

const OperateurCard: React.FC<OperateurCardProps> = ({ operateur, onPress }) => {
    const handlePress = () => {
        if (onPress) {
            onPress(operateur);
        }
    };

    const formatActivites = (activites?: { nom: string }[]) => {
        if (!activites || activites.length === 0) return 'Non spécifié';
        return activites.slice(0, 2).map(a => a.nom).join(', ') + (activites.length > 2 ? '...' : '');
    };

    const formatProductions = (productions?: { nom: string }[]) => {
        if (!productions || productions.length === 0) return 'Non spécifié';
        return productions.slice(0, 2).map(p => p.nom).join(', ') + (productions.length > 2 ? '...' : '');
    };

    const getActivityIcon = (activites?: { nom: string }[]) => {
        if (!activites || activites.length === 0) return '🏪';
        const firstActivity = activites[0].nom;
        if (!firstActivity || typeof firstActivity !== 'string') return '🏪';
        
        const activityLower = firstActivity.toLowerCase();
        if (activityLower.includes('vente') || activityLower.includes('distribution')) return '🛒';
        if (activityLower.includes('magasin') || activityLower.includes('commerce')) return '🏪';
        if (activityLower.includes('grossiste') || activityLower.includes('import')) return '📦';
        if (activityLower.includes('restaurant') || activityLower.includes('cuisine')) return '🍽️';
        if (activityLower.includes('transform') || activityLower.includes('fabrica')) return '🏭';
        if (activityLower.includes('agricult') || activityLower.includes('élevage')) return '🌾';
        return '🌱';
    };

    const getMainAddress = () => {
        if (!operateur.adressesOperateurs || operateur.adressesOperateurs.length === 0) return null;
        // Priorité : adresse active, sinon la première
        return operateur.adressesOperateurs.find(addr => addr.active) || operateur.adressesOperateurs[0];
    };

    const getDistance = () => {
        // Simuler une distance (à implémenter avec géolocalisation réelle)
        return Math.floor(Math.random() * 50) + 1;
    };

    const mainAddress = getMainAddress();

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.icon}>{getActivityIcon(operateur.activites)}</Text>
                    <View style={styles.titleText}>
                        <Text style={styles.raisonSociale} numberOfLines={2}>
                            {operateur.denominationcourante || operateur.raisonSociale}
                        </Text>
                        <Text style={styles.numeroBio}>Bio N° {operateur.numeroBio}</Text>
                    </View>
                </View>
                <View style={styles.distanceContainer}>
                    <Text style={styles.distance}>{getDistance()} km</Text>
                </View>
            </View>
            
            {mainAddress && (
                <View style={styles.locationContainer}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <View style={styles.locationText}>
                        <Text style={styles.ville} numberOfLines={1}>
                            {mainAddress.codePostal} {mainAddress.ville}
                        </Text>
                        {mainAddress.lieu && (
                            <Text style={styles.adresse} numberOfLines={1}>
                                {mainAddress.lieu}
                            </Text>
                        )}
                    </View>
                </View>
            )}

            <View style={styles.tagsContainer}>
                <View style={styles.tag}>
                    <Text style={styles.tagText}>{formatActivites(operateur.activites)}</Text>
                </View>
            </View>

            <View style={styles.productionsContainer}>
                <Text style={styles.productionsLabel}>Produits: </Text>
                <Text style={styles.productions}>{formatProductions(operateur.productions)}</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.contactInfo}>
                    {(operateur.telephoneNational || operateur.telephone) && (
                        <View style={styles.contactItem}>
                            <Text style={styles.contactIcon}>📞</Text>
                            <Text style={styles.contactText}>
                                {operateur.telephoneNational || operateur.telephone}
                            </Text>
                        </View>
                    )}
                    {operateur.email && (
                        <View style={styles.contactItem}>
                            <Text style={styles.contactIcon}>✉️</Text>
                            <Text style={styles.contactText} numberOfLines={1}>{operateur.email}</Text>
                        </View>
                    )}
                    {operateur.reseau && (
                        <View style={styles.contactItem}>
                            <Text style={styles.contactIcon}>🔗</Text>
                            <Text style={styles.contactText} numberOfLines={1}>{operateur.reseau}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity style={styles.detailsButton} onPress={handlePress}>
                    <Text style={styles.detailsButtonText}>Détails</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginVertical: 6,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    icon: {
        fontSize: 24,
        marginRight: 12,
        marginTop: 2,
    },
    titleText: {
        flex: 1,
    },
    raisonSociale: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1B5E20',
        lineHeight: 22,
    },
    numeroBio: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
        marginTop: 2,
    },
    distanceContainer: {
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    distance: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2E7D32',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#F8F9FA',
        padding: 10,
        borderRadius: 10,
    },
    locationIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    locationText: {
        flex: 1,
    },
    ville: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    adresse: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    tag: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 4,
    },
    tagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    productionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    productionsLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    productions: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    contactInfo: {
        flex: 1,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    contactIcon: {
        fontSize: 12,
        marginRight: 6,
    },
    contactText: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    detailsButton: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default OperateurCard; 