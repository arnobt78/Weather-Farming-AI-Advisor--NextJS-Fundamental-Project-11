import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchWeatherByCity } from "./openweather";

test("fetchWeatherByCity returns null when OPENWEATHER_API_KEY is missing", async () => {
  const previous = process.env.OPENWEATHER_API_KEY;
  delete process.env.OPENWEATHER_API_KEY;
  try {
    const result = await fetchWeatherByCity("London");
    assert.equal(result, null);
  } finally {
    if (previous !== undefined) {
      process.env.OPENWEATHER_API_KEY = previous;
    }
  }
});
