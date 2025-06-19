import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Operateur } from '../services/bioOperateursApi';

const OperateurDetailsScreen = ({ route, navigation }: any) => {
  const { operateur } = route.params;

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

  const getMainAddress = () => {
    if (!operateur.adressesOperateurs || operateur.adressesOperateurs.length === 0) return null;
    return operateur.adressesOperateurs.find((addr: any) => addr.active) || operateur.adressesOperateurs[0];
  };

  const mainAddress = getMainAddress();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"< Retour"}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Détails de l'opérateur</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informations principales */}
        <View style={styles.section}>
          <Text style={styles.companyName}>
            {operateur.denominationcourante || operateur.raisonSociale}
          </Text>
          <Text style={styles.bioNumber}>Bio N° {operateur.numeroBio}</Text>
          {operateur.gerant && (
            <Text style={styles.manager}>Gérant: {operateur.gerant}</Text>
          )}
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT</Text>
          <View style={styles.card}>
            {(operateur.telephoneNational || operateur.telephone) && (
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => handleCall(operateur.telephoneNational || operateur.telephone)}
              >
                <Text style={styles.contactLabel}>Téléphone:</Text>
                <Text style={styles.contactValue}>
                  {operateur.telephoneNational || operateur.telephone}
                </Text>
              </TouchableOpacity>
            )}
            
            {operateur.email && (
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => handleEmail(operateur.email)}
              >
                <Text style={styles.contactLabel}>Email:</Text>
                <Text style={styles.contactValueLink}>{operateur.email}</Text>
              </TouchableOpacity>
            )}

            {operateur.reseau && (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Réseau:</Text>
                <Text style={styles.contactValue}>{operateur.reseau}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Adresse */}
        {mainAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADRESSE</Text>
            <View style={styles.card}>
              <Text style={styles.addressText}>
                {mainAddress.lieu && `${mainAddress.lieu}\n`}
                {mainAddress.codePostal} {mainAddress.ville}
              </Text>
              {mainAddress.typeAdresseOperateurs && (
                <Text style={styles.addressType}>
                  Type: {mainAddress.typeAdresseOperateurs}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Activités */}
        {operateur.activites && operateur.activites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACTIVITÉS</Text>
            <View style={styles.card}>
              {operateur.activites.map((activite: any) => (
                <Text key={activite.id} style={styles.listItem}>
                  • {activite.nom}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Productions */}
        {operateur.productions && operateur.productions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRODUCTIONS</Text>
            {operateur.productions.slice(0, 5).map((production: any) => (
              <View key={production.id} style={styles.productionCard}>
                <Text style={styles.productionName}>{production.nom}</Text>
                {production.code && (
                  <Text style={styles.productionCode}>Code: {production.code}</Text>
                )}
              </View>
            ))}
            {operateur.productions.length > 5 && (
              <Text style={styles.moreItems}>
                ... et {operateur.productions.length - 5} autres productions
              </Text>
            )}
          </View>
        )}

        {/* Informations administratives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>SIRET:</Text>
              <Text style={styles.infoValue}>{operateur.siret}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Code NAF:</Text>
              <Text style={styles.infoValue}>{operateur.codeNAF}</Text>
            </View>
            {operateur.mixite && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mixité:</Text>
                <Text style={styles.infoValue}>{operateur.mixite}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dernière MAJ:</Text>
              <Text style={styles.infoValue}>{formatDate(operateur.dateMaj)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  bioNumber: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
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
    paddingVertical: 8,
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
    textDecorationLine: 'underline',
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  addressType: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  listItem: {
    fontSize: 14,
    color: '#333',
    paddingVertical: 4,
  },
  productionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  productionCode: {
    fontSize: 14,
    color: '#666',
  },
  moreItems: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  },
});

export default OperateurDetailsScreen; 