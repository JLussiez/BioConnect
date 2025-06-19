import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { Operateur } from '../services/bioOperateursApi';

interface OpenStreetMapViewProps {
  operateurs: Operateur[];
  userLocation?: { latitude: number; longitude: number };
  onMarkerPress?: (operateur: Operateur) => void;
}

const OpenStreetMapView: React.FC<OpenStreetMapViewProps> = ({
  operateurs,
  userLocation,
  onMarkerPress,
}) => {
  // Générer les marqueurs pour les opérateurs
  const generateMarkers = () => {
    return operateurs
      .filter(op => op.adresseOperateur?.lat && op.adresseOperateur?.long)
      .map(operateur => ({
        lat: operateur.adresseOperateur!.lat!,
        lng: operateur.adresseOperateur!.long!,
        title: operateur.denominationcourante || operateur.raisonSociale,
        description: `${operateur.adresseOperateur!.ville} - ${operateur.categories?.join(', ') || ''}`,
        id: operateur.numeroBio,
      }));
  };

  // Calculer le centre et le zoom optimal
  const getMapCenter = () => {
    if (userLocation) {
      return { lat: userLocation.latitude, lng: userLocation.longitude, zoom: 12 };
    }
    
    const markers = generateMarkers();
    if (markers.length === 0) {
      return { lat: 46.603354, lng: 1.888334, zoom: 6 }; // Centre de la France
    }
    
    const lats = markers.map(m => m.lat);
    const lngs = markers.map(m => m.lng);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    return { lat: centerLat, lng: centerLng, zoom: 10 };
  };

  const center = getMapCenter();
  const markers = generateMarkers();

  // HTML avec Leaflet.js pour OpenStreetMap
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .custom-popup {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .popup-title {
                font-weight: bold;
                color: #2E7D32;
                margin-bottom: 5px;
            }
            .popup-description {
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // Initialiser la carte
            var map = L.map('map').setView([${center.lat}, ${center.lng}], ${center.zoom});
            
            // Ajouter les tuiles OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);
            
            // Icône personnalisée pour les opérateurs bio
            var bioIcon = L.divIcon({
                className: 'custom-div-icon',
                html: '<div style="background-color: #4CAF50; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            // Icône pour la position utilisateur
            var userIcon = L.divIcon({
                className: 'custom-div-icon',
                html: '<div style="background-color: #2196F3; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });
            
            // Ajouter la position utilisateur si disponible
            ${userLocation ? `
            L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon})
                .addTo(map)
                .bindPopup('<div class="custom-popup"><div class="popup-title">📍 Ma position</div></div>');
            ` : ''}
            
            // Ajouter les marqueurs des opérateurs
            ${markers.map(marker => `
            L.marker([${marker.lat}, ${marker.lng}], {icon: bioIcon})
                .addTo(map)
                .bindPopup(\`<div class="custom-popup">
                    <div class="popup-title">${marker.title.replace(/'/g, "\\'")}</div>
                    <div class="popup-description">${marker.description.replace(/'/g, "\\'")}</div>
                </div>\`)
                .on('click', function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'markerPress',
                        operatorId: '${marker.id}'
                    }));
                });
            `).join('')}
            
            // Ajuster la vue pour inclure tous les marqueurs
            ${markers.length > 0 ? `
            var group = new L.featureGroup([
                ${markers.map(marker => `L.marker([${marker.lat}, ${marker.lng}])`).join(',')}
                ${userLocation ? `, L.marker([${userLocation.latitude}, ${userLocation.longitude}])` : ''}
            ]);
            if (group.getLayers().length > 1) {
                map.fitBounds(group.getBounds().pad(0.1));
            }
            ` : ''}
        </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress' && onMarkerPress) {
        const operateur = operateurs.find(op => op.numeroBio === data.operatorId);
        if (operateur) {
          onMarkerPress(operateur);
        }
      }
    } catch (error) {
      console.error('Erreur parsing message WebView:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: mapHtml }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default OpenStreetMapView; 