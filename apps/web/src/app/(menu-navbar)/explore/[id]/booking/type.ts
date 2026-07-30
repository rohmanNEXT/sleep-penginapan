export type Item = {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  category?: string;
  kamarId?: string;
  kamarList?: any[];
};
