import assert from "node:assert/strict";
import { test } from "node:test";
import { msToKmh } from "./units";

test("msToKmh converts 10 m/s to 36.0 km/h", () => {
  assert.equal(msToKmh(10), 36);
});
