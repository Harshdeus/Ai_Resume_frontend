export interface JD {
  id: string;
  companyName: string;
  position: string;
  yearsOfExperience: string;
  openTillDate: string;
  status: 'Open' | 'Closed';
  description: string;
  fileUrl?: string;
}

export interface Candidate {
  id: string;
  companyName: string;
  position: string;
  candidateName: string;
  candidateExperience: string;
  matchingScore: number;
  dateExtracted: string;
  fileLink: string;
}

export interface MatchResult {
  matchScore: number;
}
