
export interface Author {
  name: string;
  role: string;
  jobTitle?: string;
  bio: string;
  handle: string;
  avatar: string;
  sameAs?: string[];
}

export interface Guide {
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: Author;
  featuredImage?: string;
  date?: string;
}

export interface PriceData {
  gold24k: number;
  gold22k: number;
  silver: number;
  lastUpdated: string;
}

export interface ChartDataPoint {
  time: string;
  price: number;
}
