export type InstitutionRecord = {
  id: string;
  name: string;
  city: string;
  state: string;
  type: string;
  management: string;
  affiliation: string | null;
  officialUrl: string | null;
  courseIds: string[];
  nirfRank: number | null;
  rating: number | null;
  programmeSummary: string;
};
