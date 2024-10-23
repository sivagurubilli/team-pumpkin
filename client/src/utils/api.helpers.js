import axios from "axios";
import { API_BASE_URL } from "./api.constants";

export function AxiosSetup() {
  axios.defaults.baseURL = API_BASE_URL;
}