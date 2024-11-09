export interface TermsResponse {
  id: number;
  type: string;
  isRequired: boolean;
  title: string;
  content?: string | null;
  version: number;
  revisionNote?: string | null;
  createdAt: string;
}

export interface TermsRevisionResponse {
  version: number;
  revisionNote: string;
  createdAt: string;
}
