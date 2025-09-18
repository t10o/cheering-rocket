import { useEffect, useState } from "react";

import { env } from "@/config/env";

export type GoogleMapsApi = {
  Map: typeof google.maps.Map;
  LatLngBounds: typeof google.maps.LatLngBounds;
  Marker: typeof google.maps.Marker;
  Polyline: typeof google.maps.Polyline;
  DirectionsService: typeof google.maps.DirectionsService;
  SymbolPath: typeof google.maps.SymbolPath;
  TravelMode: typeof google.maps.TravelMode;
  LatLng: typeof google.maps.LatLng;
  geometry?: typeof google.maps.geometry;
  marker?: {
    AdvancedMarkerElement?: typeof google.maps.marker.AdvancedMarkerElement;
  };
};

const libraries = ["geometry", "marker"];
const isBrowser = typeof window !== "undefined";
let loadPromise: Promise<GoogleMapsApi> | null = null;

const createLoader = () => {
  if (!isBrowser) {
    return Promise.reject(new Error("Google Maps API is not available on the server"));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps as GoogleMapsApi);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: env.googleMapsApiKey,
      libraries: libraries.join(","),
      language: "ja",
      region: "JP",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      reject(new Error("Failed to load Google Maps script"));
    };
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps as GoogleMapsApi);
      } else {
        reject(new Error("Google Maps API did not initialize correctly"));
      }
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};

export const useGoogleMaps = () => {
  const [mapsApi, setMapsApi] = useState<GoogleMapsApi | null>(null);
  const [advancedMarkerAvailable, setAdvancedMarkerAvailable] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    createLoader()
      .then((maps) => {
        if (cancelled) return;
        setMapsApi(maps);
        const supportsAdvancedMarkers = Boolean(
          maps.marker?.AdvancedMarkerElement && env.googleMapsMapId,
        );
        setAdvancedMarkerAvailable(supportsAdvancedMarkers);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError : new Error("Failed to load Google Maps"));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    mapsApi,
    advancedMarkerAvailable,
    error,
    isLoaded: mapsApi != null,
  };
};
