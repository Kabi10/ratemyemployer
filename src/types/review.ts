

export type EmploymentStatus = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: number;
  title: string | null;
  content: string | null;
  rating: number | null;
  pros: string | null;
  cons: string | null;
  position: string | null;
  employment_status: string | null;
  company_id: number;
  company_name: string | null;
  created_at: string;
  updated_at: string;
  status: string | null;
  is_current_employee: boolean | null;
  reviewer_email: string | null;
  reviewer_name: string | null;
  user_id: string | null;
  likes: number | null;
}