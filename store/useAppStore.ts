import { create } from 'zustand'

export interface GeneratedContent {
  rewrittenCV: string
  coverLetter: string
  skillsMatch: string[]
  skillsGap: string[]
  interviewQuestions: string[]
  summary: string
}

interface AppState {
  cv: string
  jobDescription: string
  generatedContent: GeneratedContent | null
  isLoading: boolean
  
  setCV: (cv: string) => void
  setJobDescription: (jobDescription: string) => void
  setGeneratedContent: (content: GeneratedContent | null) => void
  setIsLoading: (loading: boolean) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  cv: '',
  jobDescription: '',
  generatedContent: null,
  isLoading: false,
  
  setCV: (cv) => set({ cv }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setGeneratedContent: (generatedContent) => set({ generatedContent }),
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ 
    cv: '', 
    jobDescription: '', 
    generatedContent: null, 
    isLoading: false 
  }),
}))
