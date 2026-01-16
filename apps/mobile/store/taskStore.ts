import { create } from 'zustand';
import { Task } from '@/types';
import { useAuthStore } from './authStore';

const API_URL = 'https://promorang-api.vercel.app';

interface TaskState {
  tasks: Task[];
  myTasks: Task[];
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  fetchMyTasks: () => Promise<void>;
  applyForTask: (taskId: string, applicationMessage?: string) => Promise<void>;
  completeTask: (taskId: string, submissionUrl?: string, submissionNotes?: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  myTasks: [],
  isLoading: false,
  fetchTasks: async () => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/drops`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      const mappedTasks: Task[] = Array.isArray(data) ? data.map((drop: any) => ({
        id: drop.id,
        title: drop.title,
        description: drop.description,
        reward: drop.gem_reward_base || drop.current_gem_reward || 0,
        gem_reward_base: drop.gem_reward_base,
        key_cost: drop.key_cost,
        gem_pool_remaining: drop.gem_pool_remaining,
        preview_image: drop.preview_image,
        content_url: drop.content_url,
        creator: {
          id: drop.creator_id,
          name: drop.creator_name,
          avatar: drop.creator_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=1760&q=80',
        },
        category: drop.drop_type || 'General',
        difficulty: drop.difficulty || 'medium',
        estimatedTime: drop.time_commitment || '30 mins',
        requirements: drop.requirements,
        deliverables: drop.deliverables,
        completions: drop.current_participants || 0,
        current_participants: drop.current_participants,
        max_participants: drop.max_participants,
        deadline: drop.deadline_at,
        status: drop.status,
        createdAt: drop.created_at,
        is_proof_drop: drop.is_proof_drop,
        is_paid_drop: drop.is_paid_drop,
      })) : [];

      set({ tasks: mappedTasks });
    } catch (error) {
      console.error('Fetch tasks error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchMyTasks: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/drops/my-applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success && Array.isArray(data.applications)) {
        const myTasks = data.applications.map((app: any) => ({
          ...app.drop,
          status: app.status === 'approved' ? 'completed' : app.status,
          id: app.drop_id,
        }));
        set({ myTasks });
      }
    } catch (error) {
      console.error('Fetch my tasks error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  applyForTask: async (taskId: string, applicationMessage: string = 'Applied from mobile app') => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/drops/${taskId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ application_message: applicationMessage })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Optimistically add to myTasks
      const task = get().tasks.find(t => t.id === taskId);
      if (task) {
        set({ myTasks: [...get().myTasks, { ...task, status: 'pending' }] });
      }
    } catch (error) {
      console.error('Apply for task error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  completeTask: async (taskId: string, submissionUrl?: string, submissionNotes?: string) => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/drops/${taskId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          submission_url: submissionUrl || 'https://placehold.co/mobile-submission',
          submission_notes: submissionNotes || 'Completed via mobile app'
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      set({
        myTasks: get().myTasks.map(task => {
          if (task.id === taskId) {
            return { ...task, status: 'completed' };
          }
          return task;
        }),
      });
    } catch (error) {
      console.error('Complete task error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));