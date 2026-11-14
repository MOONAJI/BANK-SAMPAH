// URL backend Express, contoh: http://localhost:5000/api (diatur di .env.local).
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:5000/api").replace(
  /\/$/,
  "",
);

export const APP_NAME = "Bank Sampah RW 05";
