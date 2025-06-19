import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RechercheScreen = () => {
  const [totalOperateurs, setTotalOperateurs] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getOperateurs();
        console.log(response);
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
  },
});

export default RechercheScreen; 