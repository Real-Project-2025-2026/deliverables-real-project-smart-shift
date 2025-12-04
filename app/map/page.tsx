"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export default function MapPage() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [11.57, 48.14], // Minhen za sada
      zoom: 12,
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
