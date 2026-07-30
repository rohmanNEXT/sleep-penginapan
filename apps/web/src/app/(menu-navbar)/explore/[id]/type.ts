export interface BedConfig {
  maxKasur: number;
  maxAdult: number;
  maxChild: number;
  maxKamar: number;
  price: number;
  hargaPerChild?: number;
  // legacy compat fields (mapped from DB)
  count?: number;
  type?: string;
  capacity?: number;
  rooms?: number;
  capacityAdults?: number;
  capacityChildren?: number;
}

export type Content = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: "hotels" | string;
  price: number;
  rating: number;
  reviews: number;
  rules: string;
  faq: string;
  fasilitas: string;
  image: string;
  gallery: string[];
  couponId?: string | null;
  isPromo: boolean;
  isPopular: boolean;
  roomId?: string | null;
  bookingId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
  guest?: number;
  minRooms?: number;
  maxRooms?: number;
  maxGuests?: number;
  maxNights?: number;
  closedDates?: string[];
  bedConfigs?: BedConfig[];
  roomsAvailable?: number;
};
