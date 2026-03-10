import axios, { type AxiosRequestConfig } from "axios";
import { GINPLUS_BASE_URL, GINPLUS_APP_KEY, GINPLUS_COMPANY_NAME } from "./const";
import { createGinplusAPI } from "@conmarket/apis";

const ginplusInstance = axios.create({
  baseURL: GINPLUS_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

ginplusInstance.interceptors.request.use((config) => {
  config.params = {
    ...(config.params || {}),
    key: GINPLUS_APP_KEY,
    companyNm: GINPLUS_COMPANY_NAME,
  };
  return config;
});

const ginplusRequest = async <TData = unknown>(
  config: AxiosRequestConfig,
) => {
  const res = await ginplusInstance.request<TData>(config);
  return res.data;
};

export const ginplusApi = createGinplusAPI(ginplusRequest);
