export const PROVINCES_BY_COUNTRY = [
  {
    country: "Indonesia",
    provinces: [
      { name: "Bali", districts: ["Denpasar", "Ubud", "Kuta", "Seminyak", "Canggu"] },
      { name: "Jawa Barat", districts: ["Bandung", "Bogor", "Garut", "Lembang", "Pangandaran"] },
      { name: "Jawa Tengah", districts: ["Semarang", "Solo", "Magelang"] },
      { name: "Jawa Timur", districts: ["Surabaya", "Malang", "Batu"] },
      { name: "DKI Jakarta", districts: ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara"] },
      { name: "Sumatera Utara", districts: ["Medan", "Danau Toba"] },
      { name: "Sumatera Barat", districts: ["Padang", "Bukittinggi"] },
      { name: "Yogyakarta", districts: ["Yogyakarta", "Sleman"] },
      { name: "Sulawesi Selatan", districts: ["Makassar", "Toraja"] },
      { name: "Kalimantan Timur", districts: ["Balikpapan", "Samarinda"] }, 
      { name: "Nusa Tenggara Barat", districts: ["Lombok", "Mataram"] },
      { name: "Papua", districts: ["Jayapura", "Raja Ampat"] }
    ]
  },
  {
    country: "Korea Selatan",
    provinces: [
      { name: "Seoul", districts: ["Gangnam", "Hongdae", "Myeongdong", "Itaewon"] },
      { name: "Busan", districts: ["Haeundae", "Seomyeon"] },
      { name: "Jeju", districts: ["Jeju City", "Seogwipo"] }
    ]
  },
  {
    country: "Thailand",
    provinces: [
      { name: "Bangkok", districts: ["Bangkok"] },
      { name: "Chiang Mai", districts: ["Chiang Mai"] },
      { name: "Phuket", districts: ["Patong", "Kata"] }
    ]
  },
  {
    country: "Jepang",
    provinces: [
      { name: "Tokyo", districts: ["Shinjuku", "Shibuya", "Ginza"] },
      { name: "Osaka", districts: ["Osaka"] },
      { name: "Kyoto", districts: ["Kyoto"] },
      { name: "Hokkaido", districts: ["Sapporo", "Niseko"] }
    ]
  }
];

export const PREDEFINED_FACILITIES = [
  "wifi", "kolam renang", "gym", "restoran", "parkir gratis", 
  "ac", "breakfast", "laundry", "rooftop", "coworking space"
];

export interface BedConfig {
  maxKasur: number;
  maxAdult: number;
  maxChild: number;
  maxKamar: number;
  harga: number;
  hargaPerChild: number;
}

export interface Item {
  id: string;
  title: string;
  location: string;
  address?: string;
  price: number;
  rating: number;
  reviewCount?: number;
  startDate?: string;
  endDate?: string;
  image: string;
  category: string;
  isPromo: boolean;
  isPopular: boolean;
  description?: string;
  roomsAvailable?: number;
  facilities?: string[];
  rules?: string;
  faq?: string;
  negara?: string[];
  provinsi?: string[];
  kecamatan?: string[];
  hasCoupon?: boolean;
  couponDiscount?: number;
  couponCode?: string;
  couponStartDate?: string;
  couponEndDate?: string;
  bedConfigs?: BedConfig[];
  images?: string[];
  adminId?: string;
  kategoriPenginapanId?: string;
  kategoriDestinasiId?: string;
  umurPenginapan?: number;
}

export interface CouponItem {
  id: string;
  code: string;
  discount: number;
  hotelId: string;
  hotelTitle: string;
  startDate: string;
  endDate: string;
  isForNewUser?: boolean;
  isSpecial?: boolean;
}
