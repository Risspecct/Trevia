export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  googleRating: number;
  safetyScore: number;
  cleanlinessScore: number;
  emergencyProximity: string;
  confidenceScore: number;
  crowdLevel: "Low" | "Medium" | "High";
  category: string;
}

export const locations: Location[] = [
  {
    id: "1",
    name: "India Gate",
    lat: 28.6129,
    lng: 77.2295,
    googleRating: 4.6,
    safetyScore: 85,
    cleanlinessScore: 72,
    emergencyProximity: "0.8 km",
    confidenceScore: 88,
    crowdLevel: "High",
    category: "Monument",
  },
  {
    id: "2",
    name: "Taj Mahal",
    lat: 27.1751,
    lng: 78.0421,
    googleRating: 4.8,
    safetyScore: 90,
    cleanlinessScore: 80,
    emergencyProximity: "1.2 km",
    confidenceScore: 94,
    crowdLevel: "High",
    category: "Heritage",
  },
  {
    id: "3",
    name: "Jaipur City Palace",
    lat: 26.9260,
    lng: 75.8235,
    googleRating: 4.5,
    safetyScore: 82,
    cleanlinessScore: 75,
    emergencyProximity: "0.5 km",
    confidenceScore: 84,
    crowdLevel: "Medium",
    category: "Heritage",
  },
  {
    id: "4",
    name: "Marina Beach",
    lat: 13.0500,
    lng: 80.2824,
    googleRating: 4.3,
    safetyScore: 70,
    cleanlinessScore: 60,
    emergencyProximity: "1.5 km",
    confidenceScore: 72,
    crowdLevel: "High",
    category: "Beach",
  },
  {
    id: "5",
    name: "Leh Ladakh",
    lat: 34.1526,
    lng: 77.5771,
    googleRating: 4.9,
    safetyScore: 78,
    cleanlinessScore: 92,
    emergencyProximity: "5 km",
    confidenceScore: 90,
    crowdLevel: "Low",
    category: "Adventure",
  },
];

export interface TransportOption {
  mode: string;
  icon: string;
  distance: string;
  time: string;
  price: string;
  available: boolean;
}

export const transportOptions: TransportOption[] = [
  { mode: "Uber", icon: "🚗", distance: "12.5 km", time: "25 min", price: "₹280", available: true },
  { mode: "Bus", icon: "🚌", distance: "14.2 km", time: "45 min", price: "₹35", available: true },
  { mode: "Metro", icon: "🚇", distance: "11.8 km", time: "20 min", price: "₹50", available: true },
  { mode: "Auto", icon: "🛺", distance: "12.5 km", time: "30 min", price: "₹180", available: true },
];

export interface ScheduleEntry {
  id: string;
  day: number;
  locationName: string;
  time: string;
}
