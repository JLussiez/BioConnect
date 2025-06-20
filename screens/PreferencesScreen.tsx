import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  preferencesService,
  UserPreferences,
  RAYON_OPTIONS,
  NOMBRE_RESULTATS_OPTIONS,
  ACTIVITES_OPTIONS,
} from '../services/preferencesService';

interface PreferencesScreenProps {
  navigation: any;
}

const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ navigation }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // États pour les champs d'adresse
  const [ville, setVille] = useState('');
  const [codePostal, setCodePostal] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await preferencesService.loadPreferences();
      setPreferences(prefs);
      setVille(prefs.defaultAddress.ville);
      setCodePostal(prefs.defaultAddress.codePostal);
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
      Alert.alert('Erreur', 'Impossible de charger les préférences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const updatedPrefs = {
        ...preferences,
        defaultAddress: {
          ...preferences.defaultAddress,
          ville,
          codePostal,
        },
      };
      
      await preferencesService.savePreferences(updatedPrefs);
      setPreferences(updatedPrefs);
      Alert.alert('Succès', 'Préférences sauvegardées avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les préférences');
    } finally {
      setSaving(false);
    }
  };

  const resetPreferences = () => {
    Alert.alert(
      'Réinitialiser les préférences',
      'Voulez-vous vraiment remettre toutes les préférences à leurs valeurs par défaut ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            try {
              const defaultPrefs = await preferencesService.resetPreferences();
              setPreferences(defaultPrefs);
              setVille(defaultPrefs.defaultAddress.ville);
              setCodePostal(defaultPrefs.defaultAddress.codePostal);
              Alert.alert('Succès', 'Préférences réinitialisées');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de réinitialiser les préférences');
            }
          },
        },
      ]
    );
  };

  const updateFilterPreference = (key: keyof UserPreferences['defaultFilters'], value: any) => {
    if (!preferences) return;
    
    const updatedPrefs = {
      ...preferences,
      defaultFilters: {
        ...preferences.defaultFilters,
        [key]: value,
      },
    };
    setPreferences(updatedPrefs);
  };

  const updateDisplayPreference = (key: keyof UserPreferences['displaySettings'], value: any) => {
    if (!preferences) return;
    
    const updatedPrefs = {
      ...preferences,
      displaySettings: {
        ...preferences.displaySettings,
        [key]: value,
      },
    };
    setPreferences(updatedPrefs);
  };

  const updateNotificationPreference = (key: keyof UserPreferences['notifications'], value: boolean) => {
    if (!preferences) return;
    
    const updatedPrefs = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: value,
      },
    };
    setPreferences(updatedPrefs);
  };

  if (loading || !preferences) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des préférences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Préférences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Section Adresse par défaut */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="map-marker" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Adresse par défaut</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Définissez votre localisation pour des recherches plus pertinentes
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ville</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Entrez votre ville"
              value={ville}
              onChangeText={setVille}
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Code postal</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Entrez votre code postal"
              value={codePostal}
              onChangeText={setCodePostal}
              keyboardType="numeric"
              maxLength={5}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Section Filtres par défaut */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="filter" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Filtres par défaut</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Configurez vos préférences de recherche
          </Text>

          {/* Rayon de recherche */}
          <View style={styles.pickerGroup}>
            <Text style={styles.inputLabel}>Rayon de recherche</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={preferences.defaultFilters.rayonRecherche}
                onValueChange={(value) => updateFilterPreference('rayonRecherche', value)}
                style={styles.picker}
              >
                {RAYON_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Types d'activités préférés */}
          <Text style={styles.inputLabel}>Types d'activités préférés</Text>
          <View style={styles.switchGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Vente directe</Text>
              <Switch
                value={preferences.defaultFilters.venteDirecte}
                onValueChange={(value) => updateFilterPreference('venteDirecte', value)}
                trackColor={{ false: '#e0e0e0', true: '#C8E6C9' }}
                thumbColor={preferences.defaultFilters.venteDirecte ? '#4CAF50' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Magasin spécialisé</Text>
              <Switch
                value={preferences.defaultFilters.magasinSpecialise}
                onValueChange={(value) => updateFilterPreference('magasinSpecialise', value)}
                trackColor={{ false: '#e0e0e0', true: '#C8E6C9' }}
                thumbColor={preferences.defaultFilters.magasinSpecialise ? '#4CAF50' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Grossiste</Text>
              <Switch
                value={preferences.defaultFilters.grossiste}
                onValueChange={(value) => updateFilterPreference('grossiste', value)}
                trackColor={{ false: '#e0e0e0', true: '#C8E6C9' }}
                thumbColor={preferences.defaultFilters.grossiste ? '#4CAF50' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Restaurant</Text>
              <Switch
                value={preferences.defaultFilters.restaurant}
                onValueChange={(value) => updateFilterPreference('restaurant', value)}
                trackColor={{ false: '#e0e0e0', true: '#C8E6C9' }}
                thumbColor={preferences.defaultFilters.restaurant ? '#4CAF50' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Section Paramètres d'affichage */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="eye" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Affichage</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Personnalisez l'interface de l'application
          </Text>

          {/* Mode d'affichage par défaut */}
          <View style={styles.pickerGroup}>
            <Text style={styles.inputLabel}>Mode d'affichage par défaut</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={preferences.displaySettings.modeAffichageParDefaut}
                onValueChange={(value) => updateDisplayPreference('modeAffichageParDefaut', value)}
                style={styles.picker}
              >
                <Picker.Item label="Liste" value="list" />
                <Picker.Item label="Carte" value="map" />
              </Picker>
            </View>
          </View>

          {/* Nombre de résultats par page */}
          <View style={styles.pickerGroup}>
            <Text style={styles.inputLabel}>Nombre de résultats par page</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={preferences.displaySettings.nombreResultatsParPage}
                onValueChange={(value) => updateDisplayPreference('nombreResultatsParPage', value)}
                style={styles.picker}
              >
                {NOMBRE_RESULTATS_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Afficher la carte automatiquement */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Afficher la carte automatiquement</Text>
            <Switch
              value={preferences.displaySettings.afficherCarteAutomatiquement}
              onValueChange={(value) => updateDisplayPreference('afficherCarteAutomatiquement', value)}
              trackColor={{ false: '#e0e0e0', true: '#C8E6C9' }}
              thumbColor={preferences.displaySettings.afficherCarteAutomatiquement ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Section Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="bell" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Gérez vos préférences de notifications
          </Text>

          <View style={styles.switchGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.switchLabel}>Nouveaux opérateurs</Text>
                <Text style={styles.switchSubLabel}>Notification lors de l'ajout de nouveaux opérateurs dans votre région</Text>
              </View>
              <Switch
                value={preferences.notifications.nouveauxOperateurs}
                onValueChange={(value) => updateNotificationPreference('nouveauxOperateurs', value)}
                trackColor={{ false: '#e0e0e0', true: '#C8E6C9' }}
                thumbColor={preferences.notifications.nouveauxOperateurs ? '#4CAF50' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.switchLabel}>Mises à jour des favoris</Text>
                <Text style={styles.switchSubLabel}>Notification lors de changements sur vos opérateurs favoris</Text>
              </View>
              <Switch
                value={preferences.notifications.misesAJourFavoris}
                onValueChange={(value) => updateNotificationPreference('misesAJourFavoris', value)}
                trackColor={{ false: '#e0e0e0', true: '#C8E6C9' }}
                thumbColor={preferences.notifications.misesAJourFavoris ? '#4CAF50' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.switchLabel}>Alertes de proximité</Text>
                <Text style={styles.switchSubLabel}>Notification quand vous êtes près d'un opérateur bio</Text>
              </View>
              <Switch
                value={preferences.notifications.alertesProximite}
                onValueChange={(value) => updateNotificationPreference('alertesProximite', value)}
                trackColor={{ false: '#e0e0e0', true: '#C8E6C9' }}
                thumbColor={preferences.notifications.alertesProximite ? '#4CAF50' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.resetButton} onPress={resetPreferences}>
            <Icon name="refresh" size={16} color="#f44336" />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={savePreferences}
            disabled={saving}
          >
            <Icon name="save" size={16} color="#fff" />
            <Text style={styles.saveButtonText}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Espacement en bas */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f44336',
    backgroundColor: '#fff',
    gap: 8,
  },
  resetButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  pickerGroup: {
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  switchGroup: {
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchSubLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default PreferencesScreen; 