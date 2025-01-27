export interface Review {
  id: string;
  content: string;
  rating: number;
  company: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  user_id: string;
  // Add other fields as needed
}

export type ToastPosition = 
  | "top-right" 
  | "bottom-right" 
  | "top-left" 
  | "bottom-left"; 