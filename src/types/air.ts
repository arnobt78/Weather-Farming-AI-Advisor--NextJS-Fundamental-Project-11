export type AirPollutionComponents = {
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  nh3: number;
};

export type AirPollutionItem = {
  dt: number;
  main: { aqi: 1 | 2 | 3 | 4 | 5 };
  components: AirPollutionComponents;
};

export type AirPollutionResponse = {
  coord: { lon: number; lat: number };
  list: AirPollutionItem[];
}
