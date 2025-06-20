import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Operateur } from '../services/bioOperateursApi';

interface OpenStreetMapViewProps {
  operateurs: Operateur[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
}

const OpenStreetMapView: React.FC<OpenStreetMapViewProps> = ({
  operateurs,
  initialRegion = { latitude: 46.603354, longitude: 1.888334, zoom: 6 }, // Centre de la France
}) => {
  const webViewRef = useRef<WebView>(null);

  // Préparer les marqueurs pour la carte
  const getMarkersData = () => {
    const markers: any[] = [];
    
    operateurs.forEach((operateur) => {
      operateur.adressesOperateurs.forEach((adresse) => {
        if (adresse.lat && adresse.long) {
          markers.push({
            id: `${operateur.numeroBio}-${adresse.id}`,
            numeroBio: operateur.numeroBio,
            latitude: adresse.lat,
            longitude: adresse.long,
            title: operateur.denominationcourante || operateur.raisonSociale,
            subtitle: `${adresse.lieu}, ${adresse.codePostal} ${adresse.ville}`,
            activites: operateur.activites.map(a => a.nom).join(', '),
          });
        }
      });
    });
    
    return markers;
  };

  // HTML et JavaScript pour la carte Leaflet
  const getMapHTML = () => {
    const markers = getMarkersData();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Carte des Opérateurs Bio</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
              integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
              crossorigin=""/>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #map {
                height: 100vh;
                width: 100vw;
            }
            .custom-popup {
                font-size: 14px;
                line-height: 1.4;
            }
            .popup-title {
                font-weight: bold;
                color: #2E7D32;
                margin-bottom: 5px;
            }
            .popup-address {
                color: #666;
                margin-bottom: 5px;
            }
            .popup-activities {
                color: #4CAF50;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
                integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
                crossorigin=""></script>
        
        <script>
            // Initialiser la carte
            var map = L.map('map').setView([${initialRegion.latitude}, ${initialRegion.longitude}], ${initialRegion.zoom});
            
            // Ajouter la couche OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Icône personnalisée pour les marqueurs
            var customIcon = L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color: #4CAF50; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            // Ajouter les marqueurs
            var markers = ${JSON.stringify(markers)};
            var bounds = L.latLngBounds();
            
            markers.forEach(function(markerData) {
                var marker = L.marker([markerData.latitude, markerData.longitude], { icon: customIcon })
                    .addTo(map);
                
                // Contenu du popup
                var popupContent = '<div class="custom-popup">' +
                    '<div class="popup-title">' + markerData.title + '</div>' +
                    '<div class="popup-address">' + markerData.subtitle + '</div>' +
                    '<div class="popup-activities">' + markerData.activites + '</div>' +
                    '</div>';
                
                marker.bindPopup(popupContent);
                
                                 // Le marqueur affiche juste le popup au clic
                 // Pas de redirection vers les détails
                
                // Ajouter à la bounding box
                bounds.extend([markerData.latitude, markerData.longitude]);
            });
            
            // Ajuster la vue pour montrer tous les marqueurs
            if (markers.length > 0) {
                map.fitBounds(bounds, { padding: [20, 20] });
            }
            
            // Gérer les messages de React Native
            document.addEventListener('message', function(e) {
                var data = JSON.parse(e.data);
                if (data.type === 'centerOnLocation') {
                    map.setView([data.latitude, data.longitude], data.zoom || 12);
                }
            });
        </script>
    </body>
    </html>
    `;
  };

  // Plus besoin de gérer les messages WebView
  const handleWebViewMessage = (event: any) => {
    // Aucune action nécessaire, les marqueurs affichent juste les popups
  };

  // Méthode pour centrer la carte sur une localisation
  const centerOnLocation = (latitude: number, longitude: number, zoom: number = 12) => {
    const message = JSON.stringify({
      type: 'centerOnLocation',
      latitude,
      longitude,
      zoom
    });
    
    webViewRef.current?.postMessage(message);
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: getMapHTML() }}
        style={styles.webView}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});

export default OpenStreetMapView; 