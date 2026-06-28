import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface ResumeData {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  storageProvider: string;
  extractedText: string;
  parsedData: {
    skills: string[];
    technologies: string[];
    education: Array<{ name: string; degree: string; year: string }>;
    projects: Array<{ title: string; description: string }>;
    experience: Array<{ company: string; role: string; duration: string; description: string }>;
    certifications: string[];
  };
  insights: {
    strengthScore: number;
    skillInventory: string[];
    strongestAreas: string[];
    weakestAreas: string[];
    missingSkills: string[];
    learningRoadmap: Array<{ title: string; description: string; skills: string[] }>;
  };
  lastAnalyzedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GapAnalysisData {
  domain: string;
  resumeSkills: string[];
  missingSkills: string[];
}

/**
 * Fetch all resumes of the current user
 */
export const useResumes = () => {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await apiClient.get('/resumes');
      return response.data.data.resumes as ResumeData[];
    },
  });
};

/**
 * Fetch detailed view of a single resume
 */
export const useResume = (id: string | undefined) => {
  return useQuery({
    queryKey: ['resumes', id],
    queryFn: async () => {
      if (!id) throw new Error('Resume ID is required');
      const response = await apiClient.get(`/resumes/${id}`);
      return response.data.data.resume as ResumeData;
    },
    enabled: !!id,
  });
};

/**
 * Fetch domain gap analysis details for a resume
 */
export const useResumeGapAnalysis = (id: string | undefined, domain: string) => {
  return useQuery({
    queryKey: ['resumes', id, 'gap-analysis', domain],
    queryFn: async () => {
      if (!id) throw new Error('Resume ID is required');
      const response = await apiClient.get(`/resumes/${id}/gap-analysis`, {
        params: { domain },
      });
      return response.data.data as GapAnalysisData;
    },
    enabled: !!id && !!domain,
  });
};

/**
 * Mutation to upload a new resume PDF/DOCX file
 */
export const useUploadResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data.resume as ResumeData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

/**
 * Mutation to delete an existing resume
 */
export const useDeleteResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/resumes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
