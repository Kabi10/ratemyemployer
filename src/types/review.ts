export type EmploymentStatus = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: string;
  title: string | null;
  content: string | null;
  rating: number | null;
  pros: string | null;
  cons: string | null;
  position: string | null;
  employment_status: EmploymentStatus | null;
  company_id: string;
  created_at: string;
  status: ReviewStatus | null;
  is_current_employee: boolean | null;
  reviewer_email?: string | null;
  reviewer_name?: string | null;
} 