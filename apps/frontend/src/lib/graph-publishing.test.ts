// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { publishGraph, type Publication } from "../../../../libraries/integrations/src/graph-publisher";

const base: Publication = { provider: "instagram", token: "private-token", externalId: "100", caption: "Caption", assets: ["https://media.example/a.jpg", "https://media.example/b.mp4"] };
describe("Graph publishing", () => {
  it.each(["threads", "instagram"])("waits for every %s carousel item before publishing the parent", async provider => {
    const posts: URLSearchParams[] = [];
    const mock = vi.fn<typeof fetch>(async (_url, init) => {
      if (init?.method === "GET") return Response.json({ status: "FINISHED", status_code: "FINISHED" });
      posts.push(init?.body as URLSearchParams);
      return Response.json({ id: String(posts.length) });
    });
    expect(await publishGraph({ ...base, provider }, mock)).toBe("4");
    expect(posts[0].get("is_carousel_item")).toBe("true");
    expect(posts[1].get("media_type")).toBe("VIDEO");
    expect(posts[2].get("children")).toBe("1,2");
    expect(posts[3].get("creation_id")).toBe("3");
    expect(mock.mock.calls.at(-1)?.[0]).toContain(provider === "threads" ? "/threads_publish" : "/media_publish");
  });
  it("creates a text container on Threads and rejects text-only Instagram", async () => {
    const mock = vi.fn<typeof fetch>(async (_url, init) => Response.json(init?.method === "GET" ? { status: "FINISHED" } : { id: "101" }));
    await expect(publishGraph({ ...base, provider: "threads", assets: [] }, mock)).resolves.toBe("101");
    expect((mock.mock.calls[0][1]?.body as URLSearchParams).get("media_type")).toBe("TEXT");
    await expect(publishGraph({ ...base, assets: [] }, mock)).rejects.toThrow("Instagram requires");
  });
  it("stages Facebook photos before creating one feed post", async () => {
    const mock = vi.fn<typeof fetch>(async () => Response.json({ id: "101" }));
    await publishGraph({ ...base, provider: "facebook", assets: [base.assets[0], base.assets[0]] }, mock);
    expect(mock.mock.calls.map(([url]) => new URL(String(url)).pathname.split("/").pop())).toEqual(["photos", "photos", "feed"]);
    expect((mock.mock.calls[0][1]?.body as URLSearchParams).get("published")).toBe("false");
  });
  it("stops after a failed media container", async () => {
    const mock = vi.fn<typeof fetch>(async (_url, init) => Response.json(init?.method === "GET" ? { status_code: "ERROR" } : { id: "101" }));
    await expect(publishGraph(base, mock)).rejects.toThrow("ERROR");
    expect(mock).toHaveBeenCalledTimes(2);
  });
});
