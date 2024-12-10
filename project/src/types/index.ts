// Previous types remain the same...

export interface Reminder {
  id: string;
  family_id: string;
  user_id: string;
  description: string;
  date: string;
  time: string | null;
  target_audience: 'ELDER' | 'FAMILY';
  recurrence_type: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrence_day: number | null;
  is_acknowledged: boolean;
  created_at: string;
  assigned_to?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}