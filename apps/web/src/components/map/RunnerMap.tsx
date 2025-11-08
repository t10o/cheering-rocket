import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import { env } from "@/config/env";
import { type GoogleMapsApi,useGoogleMaps } from "@/hooks/useGoogleMaps";
import type { RunnerSnapshot } from "@/types/cheer";
import { colorForId } from "@/utils/color";

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 35.6809591, lng: 139.7673068 }; // 東京駅あたり
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "water",
    stylers: [{ color: "#c9e8ff" }],
  },
];

const buildMarkerContent = (
  runner: RunnerSnapshot,
  color: string,
  isHighlighted: boolean,
) => {
  const root = document.createElement("div");
  root.className = clsx(
    "relative flex h-14 w-14 items-center justify-center rounded-full border-4 bg-white shadow-lg",
    isHighlighted ? "border-marathon-500" : "border-white",
  );
  root.style.boxShadow = "0 6px 18px rgba(0,0,0,0.18)";

  const ring = document.createElement("div");
  ring.className = "absolute inset-0 rounded-full";
  ring.style.boxShadow = `0 0 0 4px ${color}30`;
  root.appendChild(ring);

  if (runner.profile.photoUrl) {
    const img = document.createElement("img");
    img.src = runner.profile.photoUrl;
    img.alt = `${runner.profile.displayName}のアイコン`;
    img.className = "h-12 w-12 rounded-full object-cover";
    img.onerror = () => {
      img.remove();
      root.appendChild(buildFallbackAvatar(runner.profile.displayName, color));
    };
    root.appendChild(img);
  } else {
    root.appendChild(buildFallbackAvatar(runner.profile.displayName, color));
  }

  return root;
};

const buildFallbackAvatar = (name: string, color: string) => {
  const avatar = document.createElement("div");
  avatar.className = "flex h-12 w-12 items-center justify-center rounded-full text-white";
  avatar.style.background = color;
  avatar.textContent = name?.charAt(0)?.toUpperCase() || "R";
  return avatar;
};

const latLngLiteral = (
  point:
    | { latitude: number; longitude: number }
    | { lat: number; lng: number }
    | google.maps.LatLngLiteral,
) => ({
  lat:
    "lat" in point && typeof point.lat === "number"
      ? point.lat
      : (point as { latitude: number }).latitude,
  lng:
    "lng" in point && typeof point.lng === "number"
      ? point.lng
      : (point as { longitude: number }).longitude,
});

const pathSignature = (points: google.maps.LatLngLiteral[]) =>
  points.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join("|");

type RunnerLayer = {
  marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker;
  markerContent?: HTMLElement;
  polyline: google.maps.Polyline;
  shadowPolyline: google.maps.Polyline;
  color: string;
  lastPathSignature?: string;
};

type RunnerMapProps = {
  runners: RunnerSnapshot[];
  selectedRunId?: string | null;
  onSelectRunner?: (runId: string) => void;
};

export const RunnerMap = ({
  runners,
  selectedRunId,
  onSelectRunner,
}: RunnerMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<Map<string, RunnerLayer>>(new Map());
  const [directionService, setDirectionService] = useState<
    google.maps.DirectionsService | null
  >(null);

  const { mapsApi, advancedMarkerAvailable, error, isLoaded } = useGoogleMaps();

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    runners.forEach((runner) => {
      const runId = runner.profile.runId;
      if (runId) {
        map.set(runId, colorForId(runId));
      }
    });
    return map;
  }, [runners]);

  useEffect(() => {
    if (!mapsApi) return;
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const mapOptions: google.maps.MapOptions = {
      center: DEFAULT_CENTER,
      zoom: 14,
      disableDefaultUI: true,
      styles: MAP_STYLES,
    };

    if (env.googleMapsMapId) {
      mapOptions.mapId = env.googleMapsMapId;
    }

    mapRef.current = new mapsApi.Map(containerRef.current, mapOptions);

    setDirectionService(new mapsApi.DirectionsService());
  }, [mapsApi]);

  const fitMapToRunners = useCallback(() => {
    const map = mapRef.current;
    const maps = mapsApi;
    if (!map || !maps) return;
    if (runners.length === 0) return;

    const bounds = new maps.LatLngBounds();
    let hasValidPoint = false;

    runners.forEach((runner) => {
      if (runner.lastKnownLocation) {
        bounds.extend(latLngLiteral(runner.lastKnownLocation));
        hasValidPoint = true;
      }

      runner.path.forEach((point) => {
        bounds.extend(latLngLiteral(point));
        hasValidPoint = true;
      });
    });

    if (hasValidPoint) {
      map.fitBounds(bounds, 80);
    }
  }, [mapsApi, runners]);

  useEffect(() => {
    if (!isLoaded) return;
    fitMapToRunners();
  }, [isLoaded, runners, fitMapToRunners]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApi;
    if (!map || !maps) return;

    const overlays = overlaysRef.current;
    const currentRunIds = new Set(runners.map((runner) => runner.profile.runId));

    // Remove overlays for runners no longer present
    overlays.forEach((overlay, runId) => {
      if (!currentRunIds.has(runId)) {
        overlay.marker.map = null;
        overlay.polyline.setMap(null);
        overlay.shadowPolyline.setMap(null);
        overlays.delete(runId);
      }
    });

    const updateRunnerLayer = async (
      runner: RunnerSnapshot,
      orderIndex: number,
    ) => {
      const runId = runner.profile.runId;
      const color = colorMap.get(runId) ?? "#FF6B6B";
      let layer = overlays.get(runId);

      if (!layer) {
        const basePolyline = new maps.Polyline({
          map,
          strokeColor: color,
          strokeOpacity: 0.9,
          strokeWeight: 5,
          geodesic: true,
        });

        const shadowPolyline = new maps.Polyline({
          map,
          strokeColor: "#000000",
          strokeOpacity: 0.08,
          strokeWeight: 9,
        });

        const AdvancedMarker = maps.marker?.AdvancedMarkerElement;
        let marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker;
        if (advancedMarkerAvailable && AdvancedMarker) {
          const content = buildMarkerContent(
            runner,
            color,
            runId === selectedRunId,
          );
          marker = new AdvancedMarker({
            map,
            position: runner.lastKnownLocation
              ? latLngLiteral(runner.lastKnownLocation)
              : DEFAULT_CENTER,
            content,
            title: runner.profile.displayName,
          });
          layer = {
            marker,
            markerContent: content,
            polyline: basePolyline,
            shadowPolyline,
            color,
          };
        } else {
          const circleSymbol =
            maps.SymbolPath?.CIRCLE ?? google.maps.SymbolPath.CIRCLE ?? 0;

          marker = new maps.Marker({
            map,
            position: runner.lastKnownLocation
              ? latLngLiteral(runner.lastKnownLocation)
              : DEFAULT_CENTER,
            title: runner.profile.displayName,
            icon: {
              path: circleSymbol,
              scale: 12,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 3,
            },
          });
          layer = {
            marker,
            polyline: basePolyline,
            shadowPolyline,
            color,
          };
        }

        overlays.set(runId, layer);

        marker.addListener("click", () => {
          onSelectRunner?.(runId);
        });
      }

      // Update marker position and style
      if (runner.lastKnownLocation) {
        const position = latLngLiteral(runner.lastKnownLocation);
        const AdvancedMarker = maps.marker?.AdvancedMarkerElement;
        if (AdvancedMarker && layer.marker instanceof AdvancedMarker) {
          layer.marker.position = position;
          if (layer.markerContent) {
            const content = buildMarkerContent(
              runner,
              layer.color,
              runId === selectedRunId,
            );
            layer.marker.content = content;
            layer.markerContent = content;
          }
        } else {
          const basicMarker = layer.marker as google.maps.Marker;
          basicMarker.setPosition(position);
          const circleSymbol =
            maps.SymbolPath?.CIRCLE ?? google.maps.SymbolPath.CIRCLE ?? 0;

          basicMarker.setIcon({
            path: circleSymbol,
            scale: runId === selectedRunId ? 14 : 12,
            fillColor: layer.color,
            fillOpacity: 1,
            strokeColor: runId === selectedRunId ? "#111827" : "white",
            strokeWeight: runId === selectedRunId ? 4 : 3,
          });
        }
      }

      // Update path with road snapping
      const trimmedPath = runner.path.slice(-env.historicalPointsWindow);

      const matchedPath = await buildRoadAlignedPath(directionService, trimmedPath, maps);

      const offsetPath = applyRunnerOffset(
        matchedPath,
        maps,
        orderIndex,
      );

      const signature = pathSignature(offsetPath);
      if (signature !== layer.lastPathSignature) {
        layer.shadowPolyline.setPath(offsetPath);
        layer.polyline.setPath(offsetPath);
        layer.polyline.setOptions({ strokeColor: layer.color });
        layer.lastPathSignature = signature;
      }
    };

    const updateAllRunners = async () => {
      for (let i = 0; i < runners.length; i += 1) {
        const runner = runners[i]!;
        try {
          await updateRunnerLayer(runner, i);
        } catch (updateError) {
          console.error("Failed to update runner layer", updateError);
        }
      }
    };

    void updateAllRunners();
  }, [
    advancedMarkerAvailable,
    colorMap,
    directionService,
    mapsApi,
    onSelectRunner,
    runners,
    selectedRunId,
  ]);

  if (error) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-3xl bg-white text-red-600 shadow-lg">
        <p>地図の読み込み中にエラーが発生しました: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-white/60 shadow-xl">
      <div ref={containerRef} className="h-full w-full" role="presentation" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <span className="text-gray-500">地図を読み込んでいます...</span>
        </div>
      )}
    </div>
  );
};

type PathPoint = {
  lat: number;
  lng: number;
};

const buildRoadAlignedPath = async (
  service: google.maps.DirectionsService | null,
  points: RunnerSnapshot["path"],
  mapsApi?: GoogleMapsApi | null,
): Promise<PathPoint[]> => {
  if (!mapsApi) return points.map(latLngLiteral);
  if (!service) return points.map(latLngLiteral);
  if (!points || points.length < 2) return points.map(latLngLiteral);

  const chunkSize = 8;
  const results: PathPoint[] = [];

  for (let start = 0; start < points.length - 1; start += chunkSize - 1) {
    const chunk = points.slice(start, Math.min(points.length, start + chunkSize));
    if (chunk.length < 2) continue;

    try {
      const travelMode =
        mapsApi.TravelMode?.WALKING ?? google.maps.TravelMode.WALKING;

      const origin = chunk[0]!;
      const destination = chunk[chunk.length - 1]!;

      const request: google.maps.DirectionsRequest = {
        origin: latLngLiteral(origin),
        destination: latLngLiteral(destination),
        waypoints: chunk.slice(1, -1).map((point) => ({
          location: latLngLiteral(point),
          stopover: false,
        })),
        travelMode,
        provideRouteAlternatives: false,
      };

      const response = await service.route(request);
      const route = response.routes?.[0];
      if (!route) {
        chunk.forEach((point, index) => {
          if (start !== 0 && index === 0) return;
          results.push(latLngLiteral(point));
        });
        continue;
      }

      const overview = route.overview_path ?? [];
      overview.forEach((latLng, index) => {
        const literal = latLngLiteral(latLng.toJSON());
        if (start !== 0 && index === 0) {
          return;
        }
        results.push(literal);
      });
    } catch (error) {
      console.error("Directions request failed", error);
      const fallback = chunk.map(latLngLiteral);
      fallback.forEach((point, index) => {
        if (start !== 0 && index === 0) return;
        results.push(point);
      });
    }
  }

  return results;
};

const applyRunnerOffset = (
  path: PathPoint[],
  mapsApi: GoogleMapsApi | null | undefined,
  index: number,
): PathPoint[] => {
  if (!mapsApi || !path.length) return path;
  if (index === 0) return path;

  const offsetDistanceMeters = 3 * index;
  const spherical = mapsApi.geometry?.spherical;
  if (!spherical) return path;

  return path.map((point, i) => {
    const current = new mapsApi.LatLng(point.lat, point.lng);
    const nextPoint = path[i + 1] ?? path[i - 1];
    const next = nextPoint
      ? new mapsApi.LatLng(nextPoint.lat, nextPoint.lng)
      : null;

    if (!next) return point;

    const heading = spherical.computeHeading(current, next);
    const offsetLatLng = spherical.computeOffset(
      current,
      offsetDistanceMeters,
      heading + 90,
    );

    return { lat: offsetLatLng.lat(), lng: offsetLatLng.lng() };
  });
};
