import { createAdminAPI } from "@conmarket/apis";
import { apiRequest } from "../http";

export const adminApi = createAdminAPI(apiRequest);
