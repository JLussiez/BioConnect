import AsyncStorage from '@react-native-async-storage/async-storage';

// Types pour les préférences
export interface UserPreferences {
  // Adresse par défaut
  defaultAddress: {
    ville: string;
    codePostal: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Filtres par défaut
  defaultFilters: {
    activites: string[];
    rayonRecherche: number; // en km
    venteDirecte: boolean;
    magasinSpecialise: boolean;
    grossiste: boolean;
    restaurant: boolean;
  };
  
  // Paramètres d'affichage
  displaySettings: {
    modeAffichageParDefaut: 'list' | 'map';
    nombreResultatsParPage: number;
    afficherCarteAutomatiquement: boolean;
  };
  
  // Notifications
  notifications: {
    nouveauxOperateurs: boolean;
    misesAJourFavoris: boolean;
    alertesProximite: boolean;
  };
}

// Valeurs par défaut
const DEFAULT_PREFERENCES: UserPreferences = {
  defaultAddress: {
    ville: '',
    codePostal: '',
  },
  defaultFilters: {
    activites: [],
    rayonRecherche: 25,
    venteDirecte: false,
    magasinSpecialise: false,
    grossiste: false,
    restaurant: false,
  },
  displaySettings: {
    modeAffichageParDefaut: 'list',
    nombreResultatsParPage: 20,
    afficherCarteAutomatiquement: false,
  },
  notifications: {
    nouveauxOperateurs: true,
    misesAJourFavoris: true,
    alertesProximite: false,
  },
};

const PREFERENCES_KEY = '@user_preferences';

class PreferencesService {
  
  // Charger les préférences
  async loadPreferences(): Promise<UserPreferences> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Fusionner avec les valeurs par défaut pour s'assurer que toutes les propriétés existent
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
      return DEFAULT_PREFERENCES;
    }
  }
  
  // Sauvegarder les préférences
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      throw error;
    }
  }
  
  // Mettre à jour une partie des préférences
  async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const current = await this.loadPreferences();
      const updated = { ...current, ...updates };
      await this.savePreferences(updated);
      return updated;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }
  
  // Réinitialiser les préférences
  async resetPreferences(): Promise<UserPreferences> {
    try {
      await AsyncStorage.removeItem(PREFERENCES_KEY);
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des préférences:', error);
      throw error;
    }
  }
  
  // Obtenir l'adresse par défaut
  async getDefaultAddress(): Promise<{ ville: string; codePostal: string; latitude?: number; longitude?: number }> {
    const preferences = await this.loadPreferences();
    return preferences.defaultAddress;
  }
  
  // Mettre à jour l'adresse par défaut
  async setDefaultAddress(address: { ville: string; codePostal: string; latitude?: number; longitude?: number }): Promise<void> {
    await this.updatePreferences({
      defaultAddress: address
    });
  }
  
  // Obtenir les filtres par défaut
  async getDefaultFilters(): Promise<UserPreferences['defaultFilters']> {
    const preferences = await this.loadPreferences();
    return preferences.defaultFilters;
  }
  
  // Mettre à jour les filtres par défaut
  async setDefaultFilters(filters: Partial<UserPreferences['defaultFilters']>): Promise<void> {
    const current = await this.loadPreferences();
    await this.updatePreferences({
      defaultFilters: { ...current.defaultFilters, ...filters }
    });
  }
}

// Instance singleton
export const preferencesService = new PreferencesService();

// Constantes pour les options
export const RAYON_OPTIONS = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
];

export const NOMBRE_RESULTATS_OPTIONS = [
  { label: '10 résultats', value: 10 },
  { label: '20 résultats', value: 20 },
  { label: '50 résultats', value: 50 },
];

export const ACTIVITES_OPTIONS = [
  { id: 'vente-directe', label: 'Vente directe' },
  { id: 'magasin-specialise', label: 'Magasin spécialisé' },
  { id: 'grossiste', label: 'Grossiste' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'transformateur', label: 'Transformateur' },
  { id: 'preparateur', label: 'Préparateur' },
]; 