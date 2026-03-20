import type { WeatherKind } from "./weather";

export type ForecastItem = {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: WeatherKind | string;
    description: string;
    icon: string;
  }>;
  wind: { speed: number };
  dt_txt: string;
};

export type ForecastResponse = {
  cod: string;
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
    coord: { lat: number; lon: number };
  };
};
