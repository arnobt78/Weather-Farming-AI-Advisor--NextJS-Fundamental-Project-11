import type { WeatherKind } from "@/types/weather";

export const DEFAULT_CITY = "Frankfurt";
export const CITY_COOKIE_KEY = "weather-live-city";
export const SAVED_CITIES_COOKIE_KEY = "weather-live-saved-cities";
export const BG_IMAGE_COOKIE_KEY = "weather-live-bg";

export const WEATHER_IMAGES: Record<string, string> = {
  Clear: "/images/sunny.png",
  Clouds: "/images/cloudy.png",
  Rain: "/images/rainy.png",
  Snow: "/images/snowy.png",
  Haze: "/images/cloudy.png",
  Mist: "/images/cloudy.png",
};

export const WEATHER_GRADIENTS: Record<string, string> = {
  Clear: "from-[#f3b07c] to-[#fcd283]",
  Clouds: "from-[#57d6d4] to-[#71eeec]",
  Rain: "from-[#5bc8fb] to-[#80eaff]",
  Snow: "from-[#aff2ff] to-[#ffffff]",
  Haze: "from-[#57d6d4] to-[#71eeec]",
  Mist: "from-[#57d6d4] to-[#71eeec]",
};

export const SUPPORTED_WEATHER_KINDS: WeatherKind[] = [
  "Clear",
  "Clouds",
  "Rain",
  "Snow",
  "Haze",
  "Mist",
];

/** Weather GIF overlays mapped to weather type */
export const WEATHER_GIFS: Record<string, string> = {
  Clear: "/background/sunny.gif",
  Clouds: "/background/cloudy1.gif",
  Rain: "/background/rainy.gif",
  Snow: "/background/snowy.gif",
  Haze: "/background/haze.gif",
  Mist: "/background/haze.gif",
};

/** Unsplash search keywords per weather type for dynamic backgrounds */
export const WEATHER_UNSPLASH_QUERY: Record<string, string> = {
  Clear: "sunny sky",
  Clouds: "cloudy sky",
  Rain: "rain weather",
  Snow: "snow landscape",
  Haze: "hazy sky",
  Mist: "mist nature",
};
