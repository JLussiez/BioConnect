import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { getOperateurs, Operateur, SearchParams } from '../services/bioOperateursApi';
import OperateurCard from '../components/OperateurCard';
import OpenStreetMapView from '../components/OpenStreetMapView';

interface RechercheScreenProps {
  navigation: any;
}

type ViewMode = 'list' | 'map';

const RechercheScreen: React.FC<RechercheScreenProps> = ({ navigation }) => {
  // États pour les données
  const [operateurs, setOperateurs] = useState<Operateur[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalOperateurs, setTotalOperateurs] = useState<string>('0');
  
  // États pour la recherche
  const [searchText, setSearchText] = useState('');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);

  // État pour le mode d'affichage
  const [viewMode, setViewMode] = useState<ViewMode>('list');

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
      // Afficher l'erreur dans la console pour l'instant
      setOperateurs([]);
      setTotalOperateurs('0');
    }
    
    setLoading(false);
  };

  const loadMoreOperateurs = () => {
    if (hasMoreData && !loading && viewMode === 'list') {
      searchOperateurs(false);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setCurrentPage(0);
    searchOperateurs(true);
  };

  const onOperateurPress = (operateur: Operateur) => {
    navigation.navigate('OperateurDetails', { operateur });
  };

  const renderOperateur = ({ item }: { item: Operateur }) => (
    <OperateurCard operateur={item} onPress={onOperateurPress} />
  );

  // Boutons de basculement entre liste et carte
  const renderViewModeButtons = () => (
    <View style={styles.viewModeContainer}>
      <TouchableOpacity
        style={[
          styles.viewModeButton,
          viewMode === 'list' && styles.viewModeButtonActive
        ]}
        onPress={() => setViewMode('list')}
      >
        <Text style={[
          styles.viewModeButtonText,
          viewMode === 'list' && styles.viewModeButtonTextActive
        ]}>
          Liste
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.viewModeButton,
          viewMode === 'map' && styles.viewModeButtonActive
        ]}
        onPress={() => setViewMode('map')}
      >
        <Text style={[
          styles.viewModeButtonText,
          viewMode === 'map' && styles.viewModeButtonTextActive
        ]}>
          Carte
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Barre de recherche simple */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom ou code postal..."
            placeholderTextColor="gray"
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

      {/* Boutons de basculement Vue */}
      {renderViewModeButtons()}

      {/* Nombre de résultats */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {totalOperateurs} opérateur{parseInt(totalOperateurs) > 1 ? 's' : ''} trouvé{parseInt(totalOperateurs) > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Contenu selon le mode d'affichage */}
      {viewMode === 'list' ? (
        // Mode Liste
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
      ) : (
        // Mode Carte
        <View style={styles.mapContainer}>
          {operateurs.length > 0 ? (
            <OpenStreetMapView
              operateurs={operateurs}
            />
          ) : (
            !loading && (
              <View style={styles.emptyMapContainer}>
                <Text style={styles.emptyText}>Aucun opérateur à afficher sur la carte</Text>
                <Text style={styles.emptySubtext}>
                  Effectuez une recherche pour voir les opérateurs
                </Text>
              </View>
            )
          )}
          
          {loading && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Chargement de la carte...</Text>
            </View>
          )}
        </View>
      )}
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
    marginLeft: 8,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  viewModeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  viewModeButtonTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 40,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RechercheScreen; 