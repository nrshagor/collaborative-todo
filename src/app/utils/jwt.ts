import { jwtDecode } from "jwt-decode";
import { getCookie } from "cookie-handler-pro";

export interface DecodedToken {
  id: number;
  iat: number;
  exp: number;
  [key: string]: string | number | boolean | null;
}

export const auth = (): DecodedToken | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const cookieToken = getCookie("token");
  if (cookieToken) {
    try {
      const decoded = jwtDecode<DecodedToken>(cookieToken);
      return decoded;
    } catch (error) {
      console.error("Invalid token", error);
    }
  } else {
    // console.error("No token found");
  }
  return null;
};
