import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getOperateurs } from '../services/bioOperateursApi';

const RechercheScreen = () => {
  const [totalOperateurs, setTotalOperateurs] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getOperateurs();
        setTotalOperateurs(response.nbTotal);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recherche</Text>
      {totalOperateurs !== null && (
        <Text style={styles.subtitle}>
          Nombre total d'opérateurs bio : {totalOperateurs}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default RechercheScreen; 