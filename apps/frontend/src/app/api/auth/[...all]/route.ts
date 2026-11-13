import { auth } from "@/lib/auth";
import { rawPrisma } from "@/lib/prisma";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

export const POST = async (request: Request) => {
  try {
    const res = await handlers.POST(request);
    if (!res.ok) {
      console.error(`[BetterAuth POST Error ${res.status}]`, res.statusText);
    }
    return res;
  } catch (err: any) {
    console.error("[BetterAuth POST Exception]", err);
    return new Response(
      JSON.stringify({
        error: "INTERNAL_SERVER_ERROR",
        message: err?.message || "Internal server error occurred in auth handler",
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};

export const GET = async (request: Request) => {
  try {
    const res = await handlers.GET(request);
    const location = res.headers.get("Location");
    if (location) {
      if (location.includes("error")) {
        console.error(`[BetterAuth GET Redirecting to Error]: ${location}`);
        if (location.includes("error=internal_server_error") && !location.includes("error_description")) {
          let extraDesc = "Database query failed during authentication callback.";
          try {
            await rawPrisma.$queryRaw`SELECT 1`;
          } catch (dbErr: any) {
            extraDesc = `Database unreachable: ${dbErr?.message || dbErr}`;
          }
          const separator = location.includes("?") ? "&" : "?";
          const newLocation = `${location}${separator}error_description=${encodeURIComponent(extraDesc)}`;
          const newHeaders = new Headers(res.headers);
          newHeaders.set("Location", newLocation);
          return new Response(res.body, {
            status: res.status,
            statusText: res.statusText,
            headers: newHeaders,
          });
        }
      } else {
        console.log(`[BetterAuth GET Redirecting]: ${location}`);
      }
    } else if (!res.ok) {
      console.error(`[BetterAuth GET Error ${res.status}]`, res.statusText);
    }
    return res;
  } catch (err: any) {
    console.error("[BetterAuth GET Exception]", err);
    return new Response(
      JSON.stringify({
        error: "INTERNAL_SERVER_ERROR",
        message: err?.message || "Internal server error occurred in auth handler",
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};


