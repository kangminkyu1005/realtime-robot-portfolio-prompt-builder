import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const publicFile = (name) => new URL(`../public/${name}`, import.meta.url);

async function pngSize(name) {
  const buffer = await readFile(publicFile(name));
  assert.equal(buffer.subarray(1, 4).toString("ascii"), "PNG");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test("shortcut manifest uses the Playwell app identity", async () => {
  const manifest = JSON.parse(
    await readFile(publicFile("manifest.webmanifest"), "utf8"),
  );

  assert.equal(manifest.short_name, "로봇 포트폴리오");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.background_color, "#FDF7EE");
  assert.equal(manifest.theme_color, "#038B78");
  assert.deepEqual(
    manifest.icons.map(({ src, sizes, purpose }) => ({ src, sizes, purpose })),
    [
      { src: "/icon-192.png", sizes: "192x192", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        purpose: "maskable",
      },
    ],
  );
});

test("every shortcut icon is exported at the declared size", async () => {
  assert.deepEqual(await pngSize("favicon-32x32.png"), {
    width: 32,
    height: 32,
  });
  assert.deepEqual(await pngSize("apple-touch-icon.png"), {
    width: 180,
    height: 180,
  });
  assert.deepEqual(await pngSize("icon-192.png"), {
    width: 192,
    height: 192,
  });
  assert.deepEqual(await pngSize("icon-512.png"), {
    width: 512,
    height: 512,
  });
  assert.deepEqual(await pngSize("icon-maskable-512.png"), {
    width: 512,
    height: 512,
  });
});
