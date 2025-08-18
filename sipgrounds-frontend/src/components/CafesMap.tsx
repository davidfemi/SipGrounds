import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Cafe } from '../services/api';

// Mapbox access token - you'll need to set this in your environment
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGF2aWRjb2RlcyIsImEiOiJjbTUxbWU1d3MxcnhuMmpwcHd3cmdpZTJmIn0.OC6rGCDPkAWNvYVGM99rvQ';

interface CafesMapProps {
  cafes: Cafe[];
  height?: string;
}

const CafesMap: React.FC<CafesMapProps> = ({ cafes, height = '500px' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set the access token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [-103.5917, 40.6699], // Center of US
      zoom: 3
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl());

    // Wait for map to load before adding sources and layers
    map.current.on('load', () => {
      if (!map.current) return;

      // Convert campgrounds to GeoJSON format
      const geojsonData = {
        type: 'FeatureCollection' as const,
        features: cafes
          .filter((cafe: Cafe) => cafe.geometry?.coordinates)
          .map((cafe: Cafe) => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: cafe.geometry!.coordinates
            },
            properties: {
              cluster: false,
              cafeId: cafe._id,
              title: cafe.name || cafe.title,
              location: cafe.location,
              price: cafe.price || cafe.priceRange,
              popUpMarkUp: `
                <div style="min-width:220px">
                  <h6 style="margin-bottom:4px">${cafe.name || cafe.title}</h6>
                  <div style="margin-bottom:6px">${cafe.location}</div>
                  <a
                    href="#"
                    data-select-store="${cafe._id}"
                    style="display:inline-block;padding:6px 10px;border-radius:6px;background:#f59e0b;color:#fff;text-decoration:none;font-weight:600"
                  >
                    Select as pickup store
                  </a>
                </div>
              `
            }
          }))
      };

      // Add the campgrounds source
      map.current.addSource('campgrounds', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add cluster layer
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#F1C40F',
            10,
            '#FF6600',
            30,
            '#16A085'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15,
            10,
            20,
            30,
            25
          ]
        }
      });

      // Add cluster count layer
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      // Add unclustered points layer
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 14,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      // Add click handlers
      map.current.on('click', 'clusters', (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;
        
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        
        if (!features || features.length === 0 || !features[0].properties) return;
        
        const clusterId = features[0].properties.cluster_id;
        const source = map.current.getSource('campgrounds') as mapboxgl.GeoJSONSource;
        
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current || zoom === null || zoom === undefined) return;
          
          map.current.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          });
        });
      });

      // Add popup for individual campgrounds
      map.current.on('click', 'unclustered-point', (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;
        
        const feature = e.features[0];
        if (!feature.properties) return;
        
        const coordinates = (feature.geometry as any).coordinates.slice();
        const popUpMarkUp = feature.properties.popUpMarkUp;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const popup = new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(popUpMarkUp)
          .addTo(map.current);

        // Attach click handler to "Select as pickup store" link to update dropdown
        setTimeout(() => {
          const el = document.querySelector('[data-select-store]') as HTMLAnchorElement | null;
          if (!el) return;
          el.addEventListener('click', (ev) => {
            ev.preventDefault();
            const id = el.getAttribute('data-select-store');
            const select = document.querySelector('select.form-select');
            if (select && id) {
              (select as HTMLSelectElement).value = id;
              const event = new Event('change', { bubbles: true });
              select.dispatchEvent(event);
            }
            popup.remove();
          }, { once: true });
        }, 0);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'clusters', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'clusters', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      map.current.on('mouseenter', 'unclustered-point', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'unclustered-point', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [cafes]);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '100%', 
        height: height,
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  );
};

export default CafesMap; 