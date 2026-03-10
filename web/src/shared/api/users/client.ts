import { createUsersAPI } from "@conmarket/apis";
import { apiRequest } from "../http";

export const usersApi = createUsersAPI(apiRequest);
