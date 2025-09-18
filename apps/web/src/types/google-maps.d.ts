export {};

declare global {
  namespace google {
    namespace maps {
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
        toJSON(): LatLngLiteral;
      }

      class Map {
        constructor(element: Element, options?: unknown);
        fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
      }

      type MapTypeStyle = {
        featureType?: string;
        elementType?: string;
        stylers?: Array<Record<string, unknown>>;
      };

      interface Padding {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      }

      class LatLngBounds {
        constructor(sw?: LatLngLiteral, ne?: LatLngLiteral);
        extend(latLng: LatLngLiteral): void;
      }

      class Marker {
        constructor(options?: unknown);
        setPosition(position: LatLngLiteral): void;
        setIcon(icon: unknown): void;
        setMap(map: Map | null): void;
        addListener(type: string, handler: (...args: unknown[]) => void): void;
        map: Map | null;
      }

      namespace marker {
        class AdvancedMarkerElement {
          constructor(options?: {
            map?: Map | null;
            position?: LatLngLiteral;
            content?: HTMLElement;
            title?: string;
          });
          map: Map | null;
          position?: LatLngLiteral;
          content?: HTMLElement;
          addListener(type: string, handler: (...args: unknown[]) => void): void;
        }
      }

      class Polyline {
        constructor(options?: unknown);
        setPath(path: LatLngLiteral[]): void;
        setOptions(options: unknown): void;
        setMap(map: Map | null): void;
      }

      class DirectionsService {
        route(request: DirectionsRequest): Promise<DirectionsResult>;
      }

      interface DirectionsRequest {
        origin: LatLngLiteral;
        destination: LatLngLiteral;
        waypoints?: { location: LatLngLiteral; stopover?: boolean }[];
        travelMode?: TravelMode;
        provideRouteAlternatives?: boolean;
      }

      interface DirectionsResult {
        routes: DirectionsRoute[];
      }

      interface DirectionsRoute {
        overview_path?: LatLng[];
      }

      enum TravelMode {
        WALKING = "WALKING",
      }

      enum SymbolPath {
        CIRCLE = 0,
      }

      namespace geometry {
        namespace spherical {
          function computeHeading(
            from: LatLng | LatLngLiteral,
            to: LatLng | LatLngLiteral,
          ): number;
          function computeOffset(
            from: LatLng | LatLngLiteral,
            distance: number,
            heading: number,
          ): LatLng;
        }
      }
    }
  }

  const google: {
    maps: {
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
        AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
      };
    };
  } | undefined;

  interface Window {
    google?: typeof google;
  }
}
