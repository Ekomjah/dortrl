import { api } from "./dortrl";

export interface Link {
  id: number;
  user_id: string;
  link_text: string | null;
  short_code: string;
  original_url: string;
  created_at: string;
  expires_at: string | null;
}

export interface Click {
  clicked_at: string;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
}

export interface LinkStats extends Link {
  clicks: Click[];
}

export interface CreateLinkInput {
  original_url: string;
  link_text?: string;
  expires_at?: string;
}

export type UpdateLinkInput = Partial<CreateLinkInput>;

const config = { withCredentials: true };

export async function getLinks(): Promise<Link[]> {
  const res = await api.get<Link[]>("/links", config);
  return res.data;
}

export async function getLinkStats(code: string): Promise<LinkStats> {
  const res = await api.get<LinkStats>(
    `/${encodeURIComponent(code)}/stats`,
    config,
  );
  return res.data;
}

export async function createLink(input: CreateLinkInput): Promise<Link> {
  const res = await api.post<Link>("/links", input, config);
  return res.data;
}

export async function updateLink(
  code: string,
  input: UpdateLinkInput,
): Promise<Link> {
  const res = await api.patch<Link>(
    `/links/${encodeURIComponent(code)}`,
    input,
    config,
  );
  return res.data;
}

export async function deleteLink(code: string): Promise<void> {
  await api.delete(`/links/${encodeURIComponent(code)}`, config);
}
