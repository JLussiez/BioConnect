import React, { useState, useEffect } from 'react';
import { Operateur } from '../services/bioOperateursApi';
import { favoritesDB } from '../services/favoritesDatabase';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';

const OperateurDetailsScreen = ({ route, navigation }: any) => {
  const { operateur } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);

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

  const handleWebsite = (url: string) => {
    if (url) {
      // Ajouter https:// si le protocole n'est pas spécifié
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(formattedUrl).catch(() => {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
      });
    }
  };

  // Vérifier si l'opérateur est déjà en favori au chargement
  useEffect(() => {
    checkFavoriteStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    try {
      await favoritesDB.initDatabase();
      const isAlreadyFavorite = await favoritesDB.isFavorite(operateur.id);
      setIsFavorite(isAlreadyFavorite);
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoritesDB.removeFavorite(operateur.id);
        setIsFavorite(false);
        Alert.alert(
          'Retiré des favoris',
          `${operateur.denominationcourante || operateur.raisonSociale} a été retiré de vos favoris`
        );
      } else {
        await favoritesDB.addFavorite(operateur);
        setIsFavorite(true);
        Alert.alert(
          'Ajouté aux favoris',
          `${operateur.denominationcourante || operateur.raisonSociale} a été ajouté à vos favoris`
        );
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const getMainAddress = () => {
    if (!operateur.adressesOperateurs || operateur.adressesOperateurs.length === 0) return null;
    return operateur.adressesOperateurs.find((addr: any) => addr.active) || operateur.adressesOperateurs[0];
  };

  const mainAddress = getMainAddress();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <View style={styles.backButtonContent}>
              <Icon name="arrow-left" size={16} color="#4CAF50" />
              <Text style={styles.backButtonText}>Retour</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
            <View style={styles.favoriteButtonContent}>
              <Icon name={isFavorite ? "star" : "star-o"} size={14} color="#fff" />
              <Text style={styles.favoriteButtonText}>
                {isFavorite ? 'Favori' : 'Ajouter'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Détails de l'opérateur</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informations principales */}
        <View style={styles.section}>
          <View style={styles.mainInfoCard}>
            <Text style={styles.companyName}>
              {operateur.denominationcourante || operateur.raisonSociale}
            </Text>
            <View style={styles.bioNumberContainer}>
              <Text style={styles.bioNumber}>N° BIO : {operateur.numeroBio}</Text>
            </View>
            {operateur.gerant && (
              <Text style={styles.manager}>Gérant : {operateur.gerant}</Text>
            )}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="phone" size={16} color="#2E7D32" />
            <Text style={styles.sectionTitle}>CONTACT</Text>
          </View>
          <View style={styles.card}>
            {(operateur.telephoneNational || operateur.telephone) && (
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => handleCall(operateur.telephoneNational || operateur.telephone)}
              >
                <Text style={styles.contactLabel}>Téléphone</Text>
                <Text style={styles.contactValueLink}>
                  {operateur.telephoneNational || operateur.telephone}
                </Text>
              </TouchableOpacity>
            )}
            
            {operateur.email && (
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => handleEmail(operateur.email)}
              >
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValueLink}>{operateur.email}</Text>
              </TouchableOpacity>
            )}

            {operateur.reseau && (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Réseau</Text>
                <Text style={styles.contactValue}>{operateur.reseau}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Adresses */}
        {operateur.adressesOperateurs && operateur.adressesOperateurs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="map-marker" size={16} color="#2E7D32" />
              <Text style={styles.sectionTitle}>ADRESSES</Text>
            </View>
            {operateur.adressesOperateurs.map((adresse: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.addressText}>
                  {adresse.lieu && `${adresse.lieu}\n`}
                  {adresse.codePostal} {adresse.ville}
                </Text>
                {adresse.typeAdresseOperateurs && (
                  <View style={styles.addressTypeContainer}>
                    <Text style={styles.addressType}>
                      Type : {adresse.typeAdresseOperateurs}
                    </Text>
                  </View>
                )}
                {!adresse.active && (
                  <Text style={styles.inactiveLabel}>Adresse inactive</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Sites Web */}
        {operateur.sitesWeb && operateur.sitesWeb.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="globe" size={16} color="#2E7D32" />
              <Text style={styles.sectionTitle}>SITES WEB</Text>
            </View>
            <View style={styles.card}>
              {operateur.sitesWeb.map((site: any, index: number) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.websiteRow}
                  onPress={() => handleWebsite(site.url)}
                >
                  <Text style={styles.websiteLabel}>{site.nom || 'Site web'}</Text>
                  <Text style={styles.websiteUrl}>{site.url}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Activités */}
        {operateur.activites && operateur.activites.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="industry" size={16} color="#2E7D32" />
              <Text style={styles.sectionTitle}>ACTIVITÉS</Text>
            </View>
            <View style={styles.card}>
              {operateur.activites.map((activite: any) => (
                <View key={activite.id} style={styles.activityItem}>
                  <Text style={styles.activityName}>{activite.nom}</Text>
                  {activite.code && (
                    <Text style={styles.activityCode}>Code : {activite.code}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Productions */}
        {operateur.productions && operateur.productions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="leaf" size={16} color="#2E7D32" />
              <Text style={styles.sectionTitle}>PRODUCTIONS ({operateur.productions.length})</Text>
            </View>
            <View style={styles.card}>
              {operateur.productions.map((production: any) => (
                <View key={production.id} style={styles.productionItem}>
                  <Text style={styles.productionName}>{production.nom}</Text>
                  {production.code && (
                    <Text style={styles.productionCode}>Code : {production.code}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Certificats */}
        {operateur.certificats && operateur.certificats.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="certificate" size={16} color="#2E7D32" />
              <Text style={styles.sectionTitle}>CERTIFICATS</Text>
            </View>
            {operateur.certificats.map((certificat: any, index: number) => (
              <View key={index} style={styles.certificateCard}>
                <Text style={styles.certificateName}>
                  {certificat.nom || 'Certificat bio'}
                </Text>
                {certificat.organisme && (
                  <Text style={styles.certificateOrganisme}>
                    Organisme : {certificat.organisme}
                  </Text>
                )}
                {certificat.dateDebut && certificat.dateFin && (
                  <Text style={styles.certificateDates}>
                    Validité : {formatDate(certificat.dateDebut)} - {formatDate(certificat.dateFin)}
                  </Text>
                )}
                {certificat.etatCertificat && (
                  <View style={[
                    styles.certificateStatus,
                    { backgroundColor: certificat.etatCertificat === 'Valide' ? '#E8F5E8' : '#FFF3E0' }
                  ]}>
                    <Text style={[
                      styles.certificateStatusText,
                      { color: certificat.etatCertificat === 'Valide' ? '#2E7D32' : '#F57C00' }
                    ]}>
                      {certificat.etatCertificat}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Informations administratives */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="clipboard" size={16} color="#2E7D32" />
            <Text style={styles.sectionTitle}>INFORMATIONS ADMINISTRATIVES</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>SIRET</Text>
              <Text style={styles.infoValue}>{operateur.siret}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Code NAF</Text>
              <Text style={styles.infoValue}>{operateur.codeNAF}</Text>
            </View>
            {operateur.mixite && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mixité</Text>
                <Text style={styles.infoValue}>{operateur.mixite}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dernière mise à jour</Text>
              <Text style={styles.infoValue}>{formatDate(operateur.dateMaj)}</Text>
            </View>
          </View>
        </View>

        {/* Espacement en bas pour éviter que le contenu soit coupé */}
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  favoriteButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  favoriteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  favoriteButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 12,
  },
  bioNumberContainer: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  bioNumber: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  manager: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  contactValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  contactValueLink: {
    fontSize: 14,
    color: '#4CAF50',
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  websiteRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  websiteLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  websiteUrl: {
    fontSize: 14,
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  addressTypeContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addressType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  inactiveLabel: {
    fontSize: 12,
    color: '#f57c00',
    fontStyle: 'italic',
    marginTop: 8,
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  activityCode: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  productionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productionName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  productionCode: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  certificateCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  certificateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  certificateOrganisme: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  certificateDates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  certificateStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  certificateStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default OperateurDetailsScreen; 