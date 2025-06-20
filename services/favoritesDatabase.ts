import SQLite from 'react-native-sqlite-storage';

// Configuration de SQLite
SQLite.DEBUG(false);
SQLite.enablePromise(true);

export interface FavoriteOperateur {
  id: number;
  operateurId: number;
  raisonSociale: string;
  denominationcourante?: string;
  numeroBio: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  activites?: string; // JSON string des activités
  dateAjout: string;
}

class FavoritesDatabase {
  private database: SQLite.SQLiteDatabase | null = null;

  // Initialiser la base de données
  async initDatabase(): Promise<void> {
    try {
      this.database = await SQLite.openDatabase({
        name: 'FavoritesDB.db',
        location: 'default',
      });

      await this.createTable();
      console.log('Base de données initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }

  // Créer la table des favoris
  private async createTable(): Promise<void> {
    if (!this.database) throw new Error('Base de données non initialisée');

    const query = `
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operateurId INTEGER NOT NULL UNIQUE,
        raisonSociale TEXT NOT NULL,
        denominationcourante TEXT,
        numeroBio TEXT NOT NULL,
        telephone TEXT,
        email TEXT,
        adresse TEXT,
        ville TEXT,
        codePostal TEXT,
        activites TEXT,
        dateAjout DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await this.database.executeSql(query);
  }

  // Ajouter un favori
  async addFavorite(operateur: any): Promise<void> {
    if (!this.database) throw new Error('Base de données non initialisée');

    // Extraire l'adresse principale
    const mainAddress = operateur.adressesOperateurs?.find((addr: any) => addr.active) || 
                       operateur.adressesOperateurs?.[0];

    // Extraire les activités principales (limitées)
    let activitesString = null;
    try {
      if (operateur.activites && Array.isArray(operateur.activites) && operateur.activites.length > 0) {
        const activitesNames = operateur.activites.slice(0, 3).map((act: any) => act.nom).filter(Boolean);
        if (activitesNames.length > 0) {
          activitesString = JSON.stringify(activitesNames);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sérialisation des activités:', error);
      activitesString = null;
    }

    const query = `
      INSERT OR REPLACE INTO favorites 
      (operateurId, raisonSociale, denominationcourante, numeroBio, telephone, email, adresse, ville, codePostal, activites, dateAjout)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    const params = [
      operateur.id,
      operateur.raisonSociale,
      operateur.denominationcourante,
      operateur.numeroBio,
      operateur.telephoneNational || operateur.telephone,
      operateur.email,
      mainAddress?.lieu,
      mainAddress?.ville,
      mainAddress?.codePostal,
      activitesString,
    ];

    await this.database.executeSql(query, params);
  }

  // Supprimer un favori
  async removeFavorite(operateurId: number): Promise<void> {
    if (!this.database) throw new Error('Base de données non initialisée');

    const query = 'DELETE FROM favorites WHERE operateurId = ?';
    await this.database.executeSql(query, [operateurId]);
  }

  // Vérifier si un opérateur est en favori
  async isFavorite(operateurId: number): Promise<boolean> {
    if (!this.database) throw new Error('Base de données non initialisée');

    const query = 'SELECT COUNT(*) as count FROM favorites WHERE operateurId = ?';
    const results = await this.database.executeSql(query, [operateurId]);
    
    return results[0].rows.item(0).count > 0;
  }

  // Récupérer tous les favoris
  async getAllFavorites(): Promise<FavoriteOperateur[]> {
    if (!this.database) throw new Error('Base de données non initialisée');

    const query = 'SELECT * FROM favorites ORDER BY dateAjout DESC';
    const results = await this.database.executeSql(query);

    const favorites: FavoriteOperateur[] = [];
    for (let i = 0; i < results[0].rows.length; i++) {
      const row = results[0].rows.item(i);
      let activites = row.activites;
      try {
        // Vérifier si activites est déjà une string JSON valide
        if (typeof activites === 'string') {
          JSON.parse(activites);
        }
      } catch (error) {
        // Si ce n'est pas du JSON valide, le laisser tel quel
        activites = row.activites;
      }
      
      favorites.push({
        ...row,
        activites: activites,
      });
    }

    return favorites;
  }

  // Compter le nombre de favoris
  async getFavoritesCount(): Promise<number> {
    if (!this.database) throw new Error('Base de données non initialisée');

    const query = 'SELECT COUNT(*) as count FROM favorites';
    const results = await this.database.executeSql(query);
    
    return results[0].rows.item(0).count;
  }

  // Supprimer tous les favoris
  async clearAllFavorites(): Promise<void> {
    if (!this.database) throw new Error('Base de données non initialisée');

    const query = 'DELETE FROM favorites';
    await this.database.executeSql(query);
  }

  // Fermer la base de données
  async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
    }
  }
}

// Instance singleton
export const favoritesDB = new FavoritesDatabase(); 