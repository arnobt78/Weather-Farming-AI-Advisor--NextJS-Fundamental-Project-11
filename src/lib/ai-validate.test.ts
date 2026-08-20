import assert from "node:assert/strict";
import { test } from "node:test";
import { validateFarmingTipsBody, validateSummaryBody } from "./ai-validate";

test("validateSummaryBody rejects missing city", () => {
  const result = validateSummaryBody({
    weather: {
      temp: 12,
      humidity: 40,
      wind: 10,
      main: "Clear",
      description: "clear sky",
    },
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "city required");
});

test("validateSummaryBody rejects missing weather", () => {
  const result = validateSummaryBody({ city: "Frankfurt" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "weather required");
});

test("validateSummaryBody accepts a valid body", () => {
  const result = validateSummaryBody({
    city: " Frankfurt ",
    weather: {
      temp: 12,
      humidity: 40,
      wind: 36,
      main: "Clear",
      description: "clear sky",
    },
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.city, "Frankfurt");
    assert.equal(result.weather.wind, 36);
  }
});

test("validateFarmingTipsBody allows omitted weather", () => {
  const result = validateFarmingTipsBody({ city: "London" });
  assert.equal(result.ok, true);
});
