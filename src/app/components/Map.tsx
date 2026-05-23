import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getInitialCity } from "@/domains/cities/cityConfig";
import { getMapboxToken, reverseMapboxGeocode, type RouteStop } from "@/domains/maps/mapboxService";

interface MapProps {
  routePoints?: RouteStop[];
  routeGeometry?: GeoJSON.LineString | null;
  onLocationSelect?: (point: RouteStop) => void;
}

const city = getInitialCity();

export function Map({ routePoints = [], routeGeometry, onLocationSelect }: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = getMapboxToken();
    if (!token) return;

    mapboxgl.accessToken = token;
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [city.centerLng, city.centerLat],
      zoom: 14,
      attributionControl: true,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    mapRef.current.on("click", async (event) => {
      if (!onLocationSelect) return;
      try {
        const address = await reverseMapboxGeocode({
          lat: event.lngLat.lat,
          lng: event.lngLat.lng,
        });
        onLocationSelect({ ...address, kind: routePoints.length === 0 ? "origin" : "destination" });
      } catch (error) {
        console.error(error);
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onLocationSelect, routePoints.length]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = routePoints.map((point) => {
      const color = point.kind === "origin" ? "#0F5F4A" : point.kind === "destination" ? "#8B2E2E" : "#ECECEC";
      return new mapboxgl.Marker({ color })
        .setLngLat([point.lng, point.lat])
        .setPopup(new mapboxgl.Popup().setText(point.fullAddress))
        .addTo(map);
    });

    const source = map.getSource("vai-route") as mapboxgl.GeoJSONSource | undefined;
    const routeFeature: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: routeGeometry ?? { type: "LineString", coordinates: [] },
    };

    const syncRoute = () => {
      if (map.getSource("vai-route")) {
        (map.getSource("vai-route") as mapboxgl.GeoJSONSource).setData(routeFeature);
        return;
      }

      map.addSource("vai-route", { type: "geojson", data: routeFeature });
      map.addLayer({
        id: "vai-route-line",
        type: "line",
        source: "vai-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#0F5F4A", "line-width": 5 },
      });
    };

    if (map.isStyleLoaded()) syncRoute();
    else map.once("load", syncRoute);

    if (routeGeometry?.coordinates.length) {
      const bounds = new mapboxgl.LngLatBounds();
      routeGeometry.coordinates.forEach((coordinate) => bounds.extend(coordinate as [number, number]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
    } else if (routePoints.length) {
      const bounds = new mapboxgl.LngLatBounds();
      routePoints.forEach((point) => bounds.extend([point.lng, point.lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
    }

    void source;
  }, [routeGeometry, routePoints]);

  if (!getMapboxToken()) {
    return (
      <div className="w-full h-full rounded-2xl border border-border bg-card p-4 flex items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">
          Configure VITE_MAPBOX_TOKEN para ativar mapa, autocomplete e rota real.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden border border-border" />;
}
