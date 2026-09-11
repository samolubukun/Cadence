import createClient from "openapi-fetch";
import type { paths } from "@/types/cadence-api";
import { env } from "./env";

export const cadence = createClient<paths>({
  baseUrl: env.CADENCE_API_URL,
  headers: {
    "x-api-key": env.CADENCE_API_KEY,
  },
});

export const cadenceClient = cadence;

// Backward compatibility alias
export const chatterbox = cadence;
