// Repository implementations
export { leadRepo, SupabaseLeadRepo } from './SupabaseLeadRepo';
export { projectRepo, SupabaseProjectRepo } from './SupabaseProjectRepo';
export { blogRepo, SupabaseBlogRepo } from './SupabaseBlogRepo';

// Repository interfaces & types
export type { LeadPayload, Lead, LeadRepository } from './interfaces/LeadRepository';
export type {
    Project,
    Category,
    ProjectWithCategory,
    ProjectPayload,
    ProjectUpdate,
    ProjectRepository,
} from './interfaces/ProjectRepository';
export type { BlogPost, BlogPayload, BlogUpdate, BlogRepository } from './interfaces/BlogRepository';
