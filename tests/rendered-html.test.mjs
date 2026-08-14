import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /playwell-logo\.png/);
  assert.match(html, /class="welcome-shell"/);
  assert.match(html, /로봇·코딩의 경험을/);
  assert.match(html, /하나의 포트폴리오/);
  assert.doesNotMatch(html, /하나의 포트폴리오로/);
  assert.doesNotMatch(html, /시작하기 전에 4단계 제작 과정을 먼저 보여드려요/);
  assert.match(html, /작업 흐름 확인하기/);
  assert.match(html, /PLAYWELL ROBOT PORTFOLIO LAB/);
  assert.match(html, /playwell-portfolio-hero\.png/);
  assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(html, /rel="apple-touch-icon"[^>]*href="\/apple-touch-icon\.png"/);
  assert.match(html, /rel="icon"[^>]*href="\/favicon-32x32\.png"/);
});
