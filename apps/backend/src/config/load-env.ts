import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

// Backend-local values take precedence over repository defaults; deployed environment wins.
loadEnv({ path: resolve(__dirname, "../../.env"), quiet: true });
loadEnv({ path: resolve(__dirname, "../../../../.env"), quiet: true });
