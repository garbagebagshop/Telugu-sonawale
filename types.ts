
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

export interface Guide {
  title: string;
  slug: string;
  summary: string;
  content: string;
}
