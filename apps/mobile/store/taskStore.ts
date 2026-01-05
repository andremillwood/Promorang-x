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
  applyForTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
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
        creator: {
          id: drop.creator_id,
          name: drop.creator_name,
          avatar: drop.creator_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=1760&q=80',
        },
        category: drop.drop_type || 'General',
        difficulty: drop.difficulty || 'medium',
        estimatedTime: drop.time_commitment || '30 mins',
        requirements: [drop.requirements],
        completions: drop.current_participants || 0,
        deadline: drop.deadline_at,
        status: drop.status,
        createdAt: drop.created_at,
      })) : [];

      set({ tasks: mappedTasks });
    } catch (error) {
      console.error('Fetch tasks error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchMyTasks: async () => {
    // For now, we will just filter from the tasks list if we can't fetch "my applications" directly
    // Ideally we would fetch /api/drops/my-applications if it existed
    // Or we rely on local optimistic updates from applyForTask
    set({ isLoading: true });
    try {
      // Placeholder until we have a dedicated endpoint
      const token = useAuthStore.getState().token;
      // Optionally fetch all drops and filter client side if needed, 
      // or just rely on global task fetch.
      // For parity, let's just fetch all tasks again or do nothing if we want to save bandwidth
      // set({ myTasks: [] }); 
    } finally {
      set({ isLoading: false });
    }
  },
  applyForTask: async (taskId: string) => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/drops/${taskId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ application_message: 'Applied from mobile app' })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Optimistically add to myTasks
      const task = get().tasks.find(t => t.id === taskId);
      if (task) {
        set({ myTasks: [...get().myTasks, task] });
      }
    } catch (error) {
      console.error('Apply for task error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  completeTask: async (taskId: string) => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      // Note: Endpoint expects submission_url and submission_notes
      const response = await fetch(`${API_URL}/api/drops/${taskId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          submission_url: 'https://placehold.co/mobile-submission', // Placeholder
          submission_notes: 'Completed via mobile app'
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