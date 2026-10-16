import { api } from "./dortrl";
interface Links {
  id: number;
  user_id: string;
  link_text: string;
  short_code: string;
  original_url: string;
  created_at: string;
  expires_at: null | string;
}

export const getLinks = async (): Promise<Links[]> => {
  const res = await api.get<Links[]>(`/links`, { withCredentials: true });
  return res.data;
};
