import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { favoritesDB, FavoriteOperateur } from '../services/favoritesDatabase';

interface FavorisScreenProps {
  navigation: any;
}

const FavorisScreen: React.FC<FavorisScreenProps> = ({ navigation }) => {
  const [favorites, setFavorites] = useState<FavoriteOperateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initialiser la base de données au montage du composant
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Recharger les favoris quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const initializeDatabase = async () => {
    try {
      await favoritesDB.initDatabase();
      await loadFavorites();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      Alert.alert('Erreur', 'Impossible d\'initialiser la base de données');
    }
  };

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoritesList = await favoritesDB.getAllFavorites();
      setFavorites(favoritesList);
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      Alert.alert('Erreur', 'Impossible de charger les favoris');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = (favorite: FavoriteOperateur) => {
    Alert.alert(
      'Supprimer le favori',
      `Voulez-vous vraiment supprimer "${favorite.denominationcourante || favorite.raisonSociale}" de vos favoris ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesDB.removeFavorite(favorite.operateurId);
              await loadFavorites();
              Alert.alert('Succès', 'Favori supprimé avec succès');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le favori');
            }
          },
        },
      ]
    );
  };

  const handleClearAllFavorites = () => {
    if (favorites.length === 0) return;

    Alert.alert(
      'Supprimer tous les favoris',
      'Voulez-vous vraiment supprimer tous vos favoris ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesDB.clearAllFavorites();
              await loadFavorites();
              Alert.alert('Succès', 'Tous les favoris ont été supprimés');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer les favoris');
            }
          },
        },
      ]
    );
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleEmail = (email: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };



  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteOperateur }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.companyName} numberOfLines={2}>
          {item.denominationcourante || item.raisonSociale}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveFavorite(item)}
        >
          <Icon name="times" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.bioNumberContainer}>
        <Text style={styles.bioNumber}>N° BIO : {item.numeroBio}</Text>
      </View>

      {(item.adresse || item.ville) && (
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>
            {item.adresse && `${item.adresse}\n`}
            {item.codePostal} {item.ville}
          </Text>
        </View>
      )}

      {item.activites && (
        <View style={styles.activitiesContainer}>
          <Text style={styles.activitiesLabel}>Activités :</Text>
          <Text style={styles.activitiesText} numberOfLines={2}>
            {(() => {
              try {
                const activitesArray = JSON.parse(item.activites);
                return Array.isArray(activitesArray) ? activitesArray.join(', ') : '';
              } catch (error) {
                return '';
              }
            })()}
          </Text>
        </View>
      )}

      <View style={styles.contactRow}>
        {item.telephone && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleCall(item.telephone!)}
          >
            <View style={styles.contactButtonContent}>
              <Icon name="phone" size={12} color="#fff" />
              <Text style={styles.contactButtonText}>Appeler</Text>
            </View>
          </TouchableOpacity>
        )}
        {item.email && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleEmail(item.email!)}
          >
            <View style={styles.contactButtonContent}>
              <Icon name="envelope" size={12} color="#fff" />
              <Text style={styles.contactButtonText}>Email</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardFooter}>
                 <Text style={styles.dateText}>
           Ajouté le {formatDate(item.dateAjout)}
         </Text>
       </View>
     </View>
   );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="star-o" size={64} color="#ccc" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>Aucun favori</Text>
      <Text style={styles.emptySubtitle}>
        Ajoutez des opérateurs bio à vos favoris depuis la page de recherche ou de détails
      </Text>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => navigation.navigate('Recherche')}
      >
        <Text style={styles.searchButtonText}>Rechercher des opérateurs</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des favoris...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Favoris</Text>
        <Text style={styles.subtitle}>
          {favorites.length} opérateur{favorites.length !== 1 ? 's' : ''} sauvegardé{favorites.length !== 1 ? 's' : ''}
        </Text>
        {favorites.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={handleClearAllFavorites}
          >
            <Text style={styles.clearAllButtonText}>Tout supprimer</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFavoriteItem}
        contentContainerStyle={favorites.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  clearAllButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bioNumberContainer: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  bioNumber: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  activitiesContainer: {
    marginBottom: 12,
  },
  activitiesLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  activitiesText: {
    fontSize: 14,
    color: '#333',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  contactButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavorisScreen; 