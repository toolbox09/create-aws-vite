import { createAuthAPI } from "@conmarket/apis";
import { apiRequest } from "../http";

export const authApi = createAuthAPI(apiRequest);
