export type ScholarshipRecord = {
  id: string;
  name: string;
  eligibility: string;
  requiredDocuments: string[];
  applicationPeriod: string;
  officialPortal: string | null;
};
