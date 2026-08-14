import assert from "node:assert/strict";
import test from "node:test";

import {
  INITIAL_DATA,
  reorderSections,
  resolvePortfolioSections,
  stepComplete,
} from "../app/workflow.ts";

test("fresh data does not mark composition or design as complete", () => {
  for (let step = 1; step <= 9; step += 1) {
    assert.equal(stepComplete(step, INITIAL_DATA), false, `step ${step} should be incomplete`);
  }
});

test("section order follows the dragged block destination", () => {
  assert.deepEqual(
    reorderSections(["Competition Journey", "About", "Skills"], 2, 0),
    ["Skills", "Competition Journey", "About"],
  );
});

test("entered awards are included in the preview section list", () => {
  const sections = resolvePortfolioSections({
    sections: ["Competition Journey", "About"],
    sectionOther: "",
    awards: [{ id: "award-test", competition: "WRO", result: "은상" }],
  });

  assert.deepEqual(sections, ["Competition Journey", "About", "Certifications & Awards"]);
});
