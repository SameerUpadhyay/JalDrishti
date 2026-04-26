import React, { createContext, useContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const MapContext = createContext({ isLoaded: false, loadError: null });

const libraries = ['visualization'];

export const MapProvider = ({ children }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries,
  });

  return (
    <MapContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapLoader = () => useContext(MapContext);
