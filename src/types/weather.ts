export type WeatherKind = "Clear" | "Clouds" | "Rain" | "Snow" | "Haze" | "Mist";

export type WeatherApiSuccess = {
  cod: number;
  name: string;
  timezone: number;
  visibility?: number;
  coord?: { lon: number; lat: number };
  weather: Array<{
    main: WeatherKind | string;
    description: string;
    icon?: string;
  }>;
  main: {
    temp: number;
    feels_like?: number;
    temp_min?: number;
    temp_max?: number;
    humidity: number;
    pressure?: number;
  };
  clouds?: { all: number };
  sys?: { country?: string; sunrise?: number; sunset?: number };
  wind: {
    speed: number;
    deg?: number;
  };
};

export type WeatherApiError = {
  cod: number | string;
  message: string;
};

export type WeatherState =
  | { status: "loading"; data: null; notFound: false }
  | { status: "error"; data: null; notFound: true }
  | { status: "ready"; data: WeatherApiSuccess; notFound: false };
