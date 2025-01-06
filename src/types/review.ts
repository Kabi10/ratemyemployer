export type EmploymentStatus = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  pros: string;
  cons: string;
  position: string;
  employment_status: EmploymentStatus;
  user_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  likes: number;
  author: string;
  status: ReviewStatus;
  is_current_employee: boolean;
  reviewer_email?: string;
  reviewer_name?: string;
} 