export type ProjectStatus = "DRAFT" | "IN_PROGRESS" | "REVIEW" | "COMPLETE"
export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
export type StoryType = "FEATURE" | "TASK" | "SPIKE"

export type InputType =
  | "digital_maturity"
  | "sow_pdf"
  | "discovery_notes"
  | "tech_stack"
  | "hubbl_scan"

export interface Project {
  id: string
  name: string
  clientName: string
  clientSubVertical: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  id: string
  projectId: string
  type: InputType
  structuredData?: Record<string, unknown> | null
  textContent?: string | null
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  extractedText?: string | null
  driveFileId?: string | null
  driveFileName?: string | null
  createdAt: string
  updatedAt: string
}

export interface Outcome {
  id: string
  projectId: string
  title: string
  description: string
  category: string
  priority: Priority
  sortOrder: number
  createdAt: string
  updatedAt: string
  epics?: Epic[]
}

export interface Epic {
  id: string
  projectId: string
  outcomeId?: string | null
  jiraKey?: string | null
  title: string
  description: string
  sfClouds: string[]
  priority: Priority
  sortOrder: number
  createdAt: string
  updatedAt: string
  stories?: Story[]
}

export interface AcceptanceCriterion {
  id: string
  criterion: string
}

export interface Story {
  id: string
  projectId: string
  epicId: string
  jiraKey?: string | null
  title: string
  userRole: string
  action: string
  benefit: string
  acceptanceCriteria: AcceptanceCriterion[]
  type: StoryType
  priority: Priority
  storyPoints?: number | null
  sfObjects: string[]
  sfFeatures: string[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CloudRecommendation {
  cloud: string
  tier: string
  rationale: string
}

export interface Integration {
  system: string
  pattern: string
  direction: string
  notes: string
}

export interface CustomObject {
  object: string
  purpose: string
  keyFields: string[]
}

export interface SolutionDesign {
  id: string
  projectId: string
  recommendedClouds?: CloudRecommendation[] | null
  integrations?: Integration[] | null
  customObjects?: CustomObject[] | null
  dataArchitecture?: Record<string, unknown> | null
  securityModel?: Record<string, unknown> | null
  narrativeContent?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface BuildInstruction {
  id: string
  projectId: string
  epicId?: string | null
  title: string
  content: string
  phase: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ShareToken {
  id: string
  projectId: string
  token: string
  isActive: boolean
  sectionsVisible: {
    outcomes: boolean
    epics: boolean
    stories: boolean
    design: boolean
    build: boolean
  }
  expiresAt?: string | null
  createdAt: string
}

export interface GenerationJob {
  id: string
  projectId: string
  type: string
  status: "pending" | "running" | "complete" | "failed"
  error?: string | null
  startedAt?: string | null
  completedAt?: string | null
  createdAt: string
}

export interface StandardsDocument {
  id: string
  title: string
  category: string
  extractedText: string
  fileUrl?: string | null
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
}

// Digital Maturity Assessment
export interface MaturityCategory {
  id: string
  name: string
  score: number // 1-5
  notes: string
}

export interface DigitalMaturityData {
  overallScore: number
  categories: MaturityCategory[]
  strengths: string
  gaps: string
  notes: string
}

// Tech Stack
export interface TechStackData {
  salesforceClouds: string[]
  salesforceEditions: string
  otherSalesforcePlatforms: string[]
  integrations: string[]
  coreSystemsOfRecord: string
  dataWarehouse: string
  identityProvider: string
  otherSystems: string
  orgCount: number
  sandboxTypes: string[]
  notes: string
}
