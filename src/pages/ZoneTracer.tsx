import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { colors, spacing, borderRadius } from '../config/theme';

const TraceWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const MapBox = styled.div<{ height?: string }>`
  height: ${(props) => props.height || '360px'};
  border-radius: ${borderRadius.md};
  overflow: hidden;
  border: 1px solid ${colors.border};
  position: relative;
  z-index: 0;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  align-items: center;
`;

const CtrlButton = styled.button<{ variant?: 'primary' | 'success' | 'danger' }>`
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${borderRadius.sm};
  border: 1px solid ${colors.border};
  background: white;
  color: ${colors.textPrimary};
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${colors.neutral};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  ${(props) =>
    props.variant === 'primary' &&
    `border-color: ${colors.primary}; color: ${colors.primary}; background: ${colors.primary}08;`}
  ${(props) =>
    props.variant === 'success' &&
    `border-color: ${colors.success}; color: ${colors.success}; background: ${colors.success}08;`}
  ${(props) =>
    props.variant === 'danger' &&
    `border-color: ${colors.error}; color: ${colors.error}; background: ${colors.error}08;`}
`;

const InfoBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.md};
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.neutral};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.sm};
  font-size: 0.8rem;
  color: ${colors.textSecondary};

  strong {
    color: ${colors.primary};
  }
`;

const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  label {
    font-size: 0.8rem;
    color: ${colors.textSecondary};
    font-weight: 600;
  }
  input[type='color'] {
    width: 44px;
    height: 28px;
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.sm};
    padding: 0;
    cursor: pointer;
    background: white;
  }
`;

const Hint = styled.p`
  font-size: 0.78rem;
  color: ${colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

interface Point {
  lat: number;
  lng: number;
}

interface ZoneTracerProps {
  points: Point[];
  onPointsChange: (pts: Point[]) => void;
  color: string;
  onColorChange: (c: string) => void;
  height?: string;
}

/** Réplique la formule backend geo.polygon_area_sqm (pour l'aperçu). */
export function computeAreaSqm(polygon: Point[]): number {
  if (!polygon || polygon.length < 3) return 0;
  const lats = polygon.map((p) => p.lat);
  const lngs = polygon.map((p) => p.lng);
  const refLat = (lats.reduce((a, b) => a + b, 0) / lats.length) * (Math.PI / 180);
  const mPerDegLat = 111132.92;
  const mPerDegLng = 111319.49 * Math.cos(refLat);
  const n = polygon.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % n];
    const x1 = p1.lng * mPerDegLng;
    const y1 = p1.lat * mPerDegLat;
    const x2 = p2.lng * mPerDegLng;
    const y2 = p2.lat * mPerDegLat;
    area += x1 * y2 - x2 * y1;
  }
  return Math.round(Math.abs(area) / 2);
}

export const ZoneTracer: React.FC<ZoneTracerProps> = ({
  points,
  onPointsChange,
  color,
  onColorChange,
  height,
}) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const groupRef = useRef<L.LayerGroup | null>(null);
  const posRef = useRef<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [pos, setPos] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [watching, setWatching] = useState(false);

  // ---- carte ----
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { zoomControl: true });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    groupRef.current = group;

    map.on('click', (e: L.LeafletMouseEvent) => {
      const p: Point = { lat: e.latlng.lat, lng: e.latlng.lng };
      onPointsChange([...pointsRef.current, p]);
    });

    // Position initiale de l'utilisateur (vue)
    const initial = posRef.current ?? pointsRef.current[0];
    if (initial) {
      map.setView([initial.lat, initial.lng], 18);
    } else {
      map.setView([0, 0], 2);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refs pour éviter les re-inits
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const colorRef = useRef(color);
  colorRef.current = color;

  const toggleWatch = () => {
    if (watching) {
      setWatching(false);
      return;
    }
    if (!('geolocation' in navigator)) {
      alert('Géolocalisation non supportée');
      return;
    }
    setWatching(true);
    navigator.geolocation.watchPosition(
      (p) => {
        const next = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
        posRef.current = next;
        setPos(next);
        const map = mapRef.current;
        if (map && !posRef.current?.focused) {
          (posRef.current as any).focused = true;
          map.flyTo([next.lat, next.lng], Math.max(map.getZoom(), 18));
        }
      },
      (err) => {
        setWatching(false);
        alert(
          err.code === err.PERMISSION_DENIED
            ? 'Partage de localisation refusé : activez-le pour tracer votre zone'
            : 'Impossible de récupérer la position'
        );
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
  };

  const useMyPosition = () => {
    const cur = posRef.current;
    if (!cur) {
      // tentative ponctuelle
      if (!('geolocation' in navigator)) {
        alert('Géolocalisation non supportée');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const next = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
          posRef.current = next;
          setPos(next);
          onPointsChange([...pointsRef.current, { lat: next.lat, lng: next.lng }]);
          mapRef.current?.flyTo([next.lat, next.lng], 18);
        },
        () => alert('Géolocalisation refusée'),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
      return;
    }
    onPointsChange([...pointsRef.current, { lat: cur.lat, lng: cur.lng }]);
    mapRef.current?.flyTo([cur.lat, cur.lng], 18);
  };

  const undoLast = () => onPointsChange(pointsRef.current.slice(0, -1));
  const clearAll = () => {
    onPointsChange([]);
    mapRef.current?.flyTo([0, 0], 2);
  };

  // ---- redessiner les couches ----
  useEffect(() => {
    const map = mapRef.current;
    const group = groupRef.current;
    if (!map || !group) return;
    group.clearLayers();

    const pts = pointsRef.current;
    const curColor = colorRef.current;
    const curPos = posRef.current;

    // points du tracé
    pts.forEach((p, i) => {
      L.circleMarker([p.lat, p.lng], {
        radius: i === 0 ? 7 : 5,
        color: '#ffffff',
        weight: 2,
        fillColor: i === 0 ? colors.primary : '#dc2626',
        fillOpacity: 1,
      })
        .bindTooltip(`Point ${i + 1}`)
        .addTo(group);
    });

    // polygone (fermé) dès 3 points
    if (pts.length >= 3) {
      L.polygon(pts.map((p) => [p.lat, p.lng]), {
        color: curColor,
        weight: 2,
        fillColor: curColor,
        fillOpacity: 0.18,
      }).addTo(group);
    }

    // trait dynamique : premier point de la zone → position courante
    if (pts.length > 0 && curPos) {
      L.polyline(
        [
          [pts[0].lat, pts[0].lng],
          [curPos.lat, curPos.lng],
        ],
        { color: curColor, weight: 2, dashArray: '6 6', opacity: 0.8 }
      ).addTo(group);
    }

    // position courante + cercle de précision (~5m)
    if (curPos) {
      L.circle([curPos.lat, curPos.lng], {
        radius: Math.max(curPos.accuracy || 5, 5),
        color: colors.info,
        weight: 1,
        fillColor: colors.info,
        fillOpacity: 0.12,
        interactive: false,
      }).addTo(group);
      L.circleMarker([curPos.lat, curPos.lng], {
        radius: 6,
        color: '#ffffff',
        weight: 2,
        fillColor: colors.info,
        fillOpacity: 1,
        interactive: false,
      }).addTo(group);
    }
  }, [points, color, pos]);

  const area = computeAreaSqm(points);

  return (
    <TraceWrap>
      <MapBox ref={mapEl} height={height} />
      <Controls>
        <CtrlButton variant="primary" onClick={toggleWatch} disabled={!('geolocation' in navigator)}>
          {watching ? 'Stop suivi position' : 'Suivre ma position'}
        </CtrlButton>
        <CtrlButton onClick={useMyPosition}>Ajouter ma position</CtrlButton>
        <CtrlButton onClick={undoLast} disabled={points.length === 0}>
          Annuler dernier point
        </CtrlButton>
        <CtrlButton variant="danger" onClick={clearAll} disabled={points.length === 0}>
          Effacer
        </CtrlButton>
        <ColorRow>
          <label>Couleur</label>
          <input type="color" value={color} onChange={(e) => onColorChange(e.target.value)} />
        </ColorRow>
      </Controls>
      <InfoBar>
        <span>
          Points : <strong>{points.length}</strong>
        </span>
        <span>
          Surface : <strong>{area.toLocaleString()} m²</strong>
        </span>
        {pos && (
          <span>
            Précision : <strong>~{Math.round(pos.accuracy)}m</strong>
          </span>
        )}
      </InfoBar>
      <Hint>
        Cliquez sur la carte pour placer des points (ou « Ajouter ma position »). Déplacez-vous autour
        de la zone pour un tracé précis (~5 m). Le premier point relie vos déplacements : les 3 premiers
        points définissent le polygone.
      </Hint>
    </TraceWrap>
  );
};