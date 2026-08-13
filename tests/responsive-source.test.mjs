import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("mobile workspace keeps scrolling and exposes both work panes", async () => {
  const [page, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /mobile-show-\$\{mobilePane\}/);
  assert.match(page, />\s*내용 입력\s*</);
  assert.match(page, />\s*실시간 미리보기\s*</);
  assert.match(styles, /@media \(max-width: 920px\)[\s\S]*body:has\(\.app-shell\) \{ overflow-x: hidden; overflow-y: auto; \}/);
  assert.match(styles, /\.mobile-show-form \.preview-pane, \.mobile-show-preview \.input-pane \{ display: none; \}/);
  assert.match(styles, /\.input-block input, \.input-block textarea, \.compact-row input \{ font-size: 16px; \}/);
});
