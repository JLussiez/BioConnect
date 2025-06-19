import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { getOperateurs, Operateur, SearchParams } from '../services/bioOperateursApi';
import OperateurCard from '../components/OperateurCard';

const RechercheScreen = () => {
  // États pour les données
  const [operateurs, setOperateurs] = useState<Operateur[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalOperateurs, setTotalOperateurs] = useState<string>('0');
  
  // États pour la recherche
  const [searchText, setSearchText] = useState('');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);

  useEffect(() => {
    searchOperateurs();
  }, []);

  const searchOperateurs = async (reset: boolean = true) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const params: SearchParams = {
        debut: reset ? 0 : currentPage * 20,
        nb: 20,
      };

      // Recherche textuelle simple
      if (searchText.trim()) {
        if (/^\d{5}$/.test(searchText.trim())) {
          // Si c'est un code postal (5 chiffres)
          params.codePostal = searchText.trim();
        } else {
          // Sinon recherche par nom
          params.nom = searchText.trim();
        }
      }

      const response = await getOperateurs(params);
      
      if (reset) {
        setOperateurs(response.items);
        setCurrentPage(0);
      } else {
        setOperateurs(prev => [...prev, ...response.items]);
      }
      
      setTotalOperateurs(response.nbTotal);
      setHasMoreData(response.items.length === 20);
      setCurrentPage(prev => reset ? 1 : prev + 1);
      
    } catch (error) {
      console.error('Erreur recherche:', error);
      Alert.alert('Erreur', 'Impossible de charger les opérateurs');
    }
    
    setLoading(false);
  };

  const loadMoreOperateurs = () => {
    if (hasMoreData && !loading) {
      searchOperateurs(false);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setCurrentPage(0);
    searchOperateurs(true);
  };

  const onOperateurPress = (operateur: Operateur) => {
    const mainAddress = operateur.adressesOperateurs?.find(addr => addr.active) || operateur.adressesOperateurs?.[0];
    const activites = operateur.activites?.map(a => a.nom).join(', ') || 'Non spécifié';
    const productions = operateur.productions?.slice(0, 3).map(p => p.nom).join(', ') || 'Non spécifié';
    
    Alert.alert(
      operateur.denominationcourante || operateur.raisonSociale,
      `📍 ${mainAddress?.ville || 'Ville non disponible'}\n` +
      `📞 ${operateur.telephoneNational || operateur.telephone || 'Téléphone non disponible'}\n` +
      `✉️ ${operateur.email || 'Email non disponible'}\n` +
      `👤 Gérant: ${operateur.gerant}\n` +
      `🏢 Activités: ${activites}\n` +
      `🌱 Productions: ${productions}` +
      (operateur.mixite ? `\n🔄 Mixité: ${operateur.mixite}` : ''),
      [{ text: 'Fermer', style: 'cancel' }]
    );
  };

  const renderOperateur = ({ item }: { item: Operateur }) => (
    <OperateurCard operateur={item} onPress={onOperateurPress} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Barre de recherche simple */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom ou code postal..."
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={() => searchOperateurs(true)}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => searchOperateurs(true)}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Recherche...' : 'Rechercher'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nombre de résultats */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {totalOperateurs} opérateur{parseInt(totalOperateurs) > 1 ? 's' : ''} trouvé{parseInt(totalOperateurs) > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Liste des opérateurs */}
      <FlatList
        data={operateurs}
        renderItem={renderOperateur}
        keyExtractor={(item) => item.numeroBio}
        onEndReached={loadMoreOperateurs}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun opérateur trouvé</Text>
              <Text style={styles.emptySubtext}>
                Essayez avec un autre terme de recherche
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchHeader: {
    backgroundColor: '#fff',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    paddingTop: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default RechercheScreen; 