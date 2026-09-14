// Delivery-location UI state — FRONTEND ONLY.
// There is no backend location API on the website; the service area is
// Birmaharajpur and the chosen area label is persisted locally so the
// header, hero and location modal stay in sync.
import { createContext, useContext, useState, type ReactNode } from 'react';

export const SERVING_CITY = 'Birmaharajpur';

export const AREAS = [
  { name: 'Main Market', note: 'Fastest delivery · 15–25 min' },
  { name: 'College Road', note: '15–30 min' },
  { name: 'Hospital Chowk', note: '20–30 min' },
  { name: 'Bus Stand Area', note: '20–30 min' },
  { name: 'Block Office Area', note: '20–35 min' },
  { name: 'Station Road', note: '25–35 min' },
];

interface DeliveryLocationState {
  city: string;
  area: string;
  locOpen: boolean;
  setLocOpen: (open: boolean) => void;
  chooseArea: (area: string) => void;
}

const Ctx = createContext<DeliveryLocationState>(null!);
export const useDeliveryLocation = () => useContext(Ctx);

export function DeliveryLocationProvider({ children }: { children: ReactNode }) {
  const [area, setArea] = useState<string>(() => {
    try {
      return localStorage.getItem('fm_area') || AREAS[0].name;
    } catch {
      return AREAS[0].name;
    }
  });
  const [locOpen, setLocOpen] = useState(false);

  const chooseArea = (a: string) => {
    setArea(a);
    try {
      localStorage.setItem('fm_area', a);
    } catch {
      /* ignore */
    }
    setLocOpen(false);
  };

  return (
    <Ctx.Provider value={{ city: SERVING_CITY, area, locOpen, setLocOpen, chooseArea }}>
      {children}
    </Ctx.Provider>
  );
}
