export interface TermsResponse {
  id: number;
  type: string;
  title: string;
  content?: string | null;
  version: string;
  createdAt: string;
}
