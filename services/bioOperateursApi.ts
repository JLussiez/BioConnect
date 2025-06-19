import axios from 'axios';

// Types pour les données de l'API (structure réelle)
export interface AdresseOperateur {
    id: number;
    lieu: string;
    codePostal: string;
    ville: string;
    lat: number;
    long: number;
    active: boolean;
    departementId: number;
    typeAdresseOperateurs: string;
}

export interface SiteWeb {
    id: number;
    url: string;
    typeSiteWeb: string;
}

export interface Activite {
    id: number;
    nom: string;
}

export interface EtatProduction {
    id: number;
    etatProduction: string;
    anneeReferenceControle: number;
}

export interface Production {
    id: number;
    nom: string;
    code: string;
    etatProductions: EtatProduction[];
}

export interface Certificat {
    organisme: string;
    etatCertification: string;
    dateSuspension?: string;
    dateArret?: string;
    dateEngagement: string;
    dateNotification: string;
    url?: string;
}

export interface Operateur {
    id: number;
    raisonSociale: string;
    denominationcourante: string;
    siret: string;
    numeroBio: string;
    gerant: string;
    telephone: string;
    telephoneNational: string;
    email: string;
    dateMaj: string;
    codeNAF: string;
    reseau: string;
    adressesOperateurs: AdresseOperateur[];
    sitesWeb: SiteWeb[];
    activites: Activite[];
    productions: Production[];
    certificats: Certificat[];
    mixite: string;
}

export interface OperateursResponse {
    nbTotal: string;
    items: Operateur[];
}

const BASE_URL = 'https://opendata.agencebio.org/api/gouv/operateurs';

// Paramètres de recherche étendus
export interface SearchParams {
    departement?: string;
    codePostal?: string;
    ville?: string;
    production?: string;
    nom?: string;
    activite?: string;
    lat?: number;
    lng?: number;
    dist?: number; // Distance en km pour la recherche géographique
    debut?: number; // Pour la pagination (au lieu de page)
    nb?: number; // Nombre de résultats (au lieu de limit)
}

// Types pour les filtres
export const CATEGORIES_FILTRES = {
    VENTE_DIRECTE: 'Vente directe',
    MAGASIN_SPECIALISE: 'Magasin spécialisé',
    GROSSISTE: 'Grossiste',
    RESTAURANT: 'Restaurant',
    TRANSFORMATEUR: 'Transformateur'
};

/**
 * Récupère la liste des opérateurs bio avec possibilité de filtrage
 * @param params Paramètres de recherche optionnels
 * @returns Promise contenant la réponse de l'API
 */
export const getOperateurs = async (params: SearchParams = {}): Promise<OperateursResponse> => {
    try {
        const queryParams: any = {
            debut: params.debut || 0,
            nb: Math.min(params.nb || 20, 20) // Limite max à 20
        };

        // Ajout conditionnel des paramètres
        if (params.departement) queryParams.departement = params.departement;
        if (params.codePostal) queryParams.codePostal = params.codePostal;
        if (params.ville) queryParams.ville = params.ville;
        if (params.production) queryParams.production = params.production;
        if (params.nom) queryParams.nom = params.nom;
        if (params.activite) queryParams.activite = params.activite;
        
        // Paramètres de géolocalisation
        if (params.lat && params.lng) {
            queryParams.lat = params.lat;
            queryParams.lng = params.lng;
            if (params.dist) queryParams.dist = params.dist;
        }

        const response = await axios.get(`${BASE_URL}`, {
            params: queryParams
        });
        
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des opérateurs:', error);
        throw error;
    }
};

/**
 * Récupère les détails d'un opérateur spécifique
 * @param numeroBio Numéro bio de l'opérateur
 * @returns Promise contenant les détails de l'opérateur
 */
export const getOperateurDetails = async (numeroBio: string): Promise<Operateur> => {
    try {
        const response = await axios.get(`${BASE_URL}/${numeroBio}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des détails de l'opérateur ${numeroBio}:`, error);
        throw error;
    }
}; 