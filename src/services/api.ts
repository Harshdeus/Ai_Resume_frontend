import axios from 'axios';
import { JD, Candidate, MatchResult } from '../types';

// Mock API base URL
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Mocking API calls with local storage for persistence in the session
const getStoredJDs = (): JD[] => {
  const stored = localStorage.getItem('jds');
  return stored ? JSON.parse(stored) : [
    {
      id: '1',
      companyName: 'Google',
      position: 'Senior Software Engineer',
      yearsOfExperience: '5+',
      openTillDate: '2026-04-01',
      status: 'Open',
      description: 'We are looking for a senior software engineer with expertise in React and Node.js.',
    },
    {
      id: '2',
      companyName: 'Meta',
      position: 'Product Manager',
      yearsOfExperience: '3+',
      openTillDate: '2026-03-15',
      status: 'Closed',
      description: 'Looking for a PM to lead our AI initiatives.',
    }
  ];
};

const saveJDs = (jds: JD[]) => {
  localStorage.setItem('jds', JSON.stringify(jds));
};

const getStoredCandidates = (): Candidate[] => {
  const stored = localStorage.getItem('candidates');
  return stored ? JSON.parse(stored) : [
    {
      id: '1',
      companyName: 'Google',
      position: 'Senior Software Engineer',
      candidateName: 'John Doe',
      candidateExperience: '6 years',
      matchingScore: 85,
      dateExtracted: '2026-03-01',
      fileLink: '#',
    },
    {
      id: '2',
      companyName: 'Meta',
      position: 'Product Manager',
      candidateName: 'Jane Smith',
      candidateExperience: '4 years',
      matchingScore: 48,
      dateExtracted: '2026-03-01',
      fileLink: '#',
    }
  ];
};

const saveCandidates = (candidates: Candidate[]) => {
  localStorage.setItem('candidates', JSON.stringify(candidates));
};

export const jdService = {
  getAll: async (): Promise<JD[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return getStoredJDs();
  },
  create: async (jd: Omit<JD, 'id'>): Promise<JD> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newJD = { ...jd, id: Math.random().toString(36).substr(2, 9) };
    const jds = getStoredJDs();
    jds.push(newJD);
    saveJDs(jds);
    return newJD;
  }
};

export const compareService = {
  compare: async (cvFile: File, jdId?: string, jdText?: string): Promise<MatchResult> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock logic: random score for demo
    const score = Math.floor(Math.random() * 100);
    return { matchScore: score };
  },
  convertToTemplate: async (cvFile: File, jdId?: string, jdText?: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Converting to template...');
  }
};

export const candidateService = {
  getAll: async (): Promise<Candidate[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return getStoredCandidates();
  }
};

export default api;
