import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertPublicHttpUrl, isPublicIpAddress, resolveLimeAsset } from "../lime-assets";

describe("Lime Slides assets", () => {
  it("blocks loopback, private, link-local, and reserved addresses", () => {
    for (const address of ["127.0.0.1", "10.0.0.2", "172.20.1.1", "192.168.1.1", "169.254.169.254", "::1", "fc00::1", "fe80::1", "::ffff:127.0.0.1"]) {
      assert.equal(isPublicIpAddress(address), false, `${address} must be blocked`);
    }
    assert.equal(isPublicIpAddress("8.8.8.8"), true);
    assert.equal(isPublicIpAddress("2606:4700:4700::1111"), true);
  });

  it("rejects local and private URLs before making a network request", async () => {
    for (const url of ["http://localhost/", "https://app.localhost/", "http://127.0.0.1/", "http://169.254.169.254/latest/meta-data"]) {
      await assert.rejects(assertPublicHttpUrl(url), /Private|local/);
    }
    assert.equal((await assertPublicHttpUrl("https://8.8.8.8/asset.png")).protocol, "https:");
  });

  it("resolves a logo from the installed Simple Icons package without network access", async () => {
    const asset = await resolveLimeAsset({ type: "logo", query: "github" });
    assert.ok(asset);
    assert.equal(asset.type, "logo");
    assert.match(asset.dataUri, /^data:image\/svg\+xml;base64,/);
    assert.equal(asset.alt, "GitHub logo");
    assert.ok(asset.cacheKey.length === 64);
  });

  it("returns null for an explicit no-asset request", async () => {
    assert.equal(await resolveLimeAsset({ type: "none" }), null);
  });
});
