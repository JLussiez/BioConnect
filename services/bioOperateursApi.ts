import axios from 'axios';

// Types pour les données de l'API
export interface Operateur {
    id: number;
    numeroBio: string;
    raisonSociale: string;
    denominationcourante: string;
    siret: string;
    telephone: string | null;
    email: string;
    codeNAF: string;
    gerant: string;
    dateMaj: string;
    categories?: string[];
    productions?: string[];
}

export interface OperateursResponse {
    nbTotal: string;
    items: Operateur[];
}

const BASE_URL = 'https://opendata.agencebio.org/api/gouv/operateurs';

// Paramètres de recherche
export interface SearchParams {
    departement?: string;
    codePostal?: string;
    ville?: string;
    production?: string;
    page?: number;
    limit?: number;
}

/**
 * Récupère la liste des opérateurs bio avec possibilité de filtrage
 * @param params Paramètres de recherche optionnels
 * @returns Promise contenant la réponse de l'API
 */
export const getOperateurs = async (params: SearchParams = {}): Promise<OperateursResponse> => {
    try {
        const response = await axios.get(`${BASE_URL}`, {
            params: {
                ...params,
                page: params.page || 1,
                limit: params.limit || 20
            }
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