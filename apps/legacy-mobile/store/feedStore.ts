import { create } from 'zustand';
import { Post } from '@/types';
import { api } from '@/lib/api';

interface FeedState {
  posts: Post[];
  unifiedFeed: any[];
  isLoading: boolean;
  hasMore: boolean;
  fetchPosts: () => Promise<void>;
  fetchUnifiedFeed: () => Promise<void>;
  fetchMorePosts: () => Promise<void>;
  likePost: (postId: string) => void;
  sharePost: (postId: string) => void;
  backPost: (postId: string, amount: number) => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  unifiedFeed: [],
  isLoading: false,
  hasMore: true,
  fetchPosts: async () => {
    set({ isLoading: true });

    try {
      const data = await api.get<any[]>('/api/content?limit=20');

      const mappedPosts: Post[] = Array.isArray(data) ? data.map((item: any) => ({
        id: item.id,
        creator: {
          id: item.creator_id,
          name: item.creator_name,
          username: item.creator_username,
          avatar: item.creator_avatar,
        },
        content: {
          type: item.media_url?.includes('mp4') ? 'video' : 'image',
          media: item.media_url ? [item.media_url] : [],
          text: item.description || item.title
        },
        likes: item.likes_count || 0,
        comments: item.comments_count || 0,
        shares: item.reposts_count || 0,
        createdAt: item.created_at,
        isLiked: false,
        isShared: false,
        isBacked: false,
        backPrice: item.share_price || 0,
        currentValue: item.share_price || 0,
        sourcePlatform: item.platform,
        sourceUrl: item.platform_url
      })) : [];

      set({ posts: mappedPosts, hasMore: mappedPosts.length >= 20 });
    } catch (error) {
      console.error('[FeedStore] Fetch posts error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnifiedFeed: async () => {
    set({ isLoading: true });
    try {
      // Try authenticated feed first
      const data = await api.get<any>('/api/feed/for-you?limit=20&offset=0');
      const feed = data?.data?.feed || data?.feed || [];

      if (Array.isArray(feed)) {
        set({ unifiedFeed: feed });
      }
    } catch (error) {
      console.warn('[FeedStore] Auth feed failed, trying demo feed:', error);
      // Fallback to public demo feed for unauthenticated users
      try {
        const demoData = await api.get<any>('/api/feed/demo');
        const demoFeed = demoData?.data?.feed || demoData?.feed || [];
        if (Array.isArray(demoFeed)) {
          set({ unifiedFeed: demoFeed });
        }
      } catch (demoError) {
        console.error('[FeedStore] Demo feed also failed:', demoError);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMorePosts: async () => {
    const { posts, isLoading, hasMore } = get();

    if (isLoading || !hasMore) return;

    set({ isLoading: true });

    try {
      const offset = Math.ceil(posts.length / 20) + 1; // Crudely calculate page
      const data = await api.get<any[]>(`/api/content?limit=20&page=${offset}`);

      const newPosts: Post[] = Array.isArray(data) ? data.map((item: any) => ({
        id: item.id,
        creator: {
          id: item.creator_id,
          name: item.creator_name,
          username: item.creator_username,
          avatar: item.creator_avatar,
        },
        content: {
          type: item.media_url?.includes('mp4') ? 'video' : 'image',
          media: item.media_url ? [item.media_url] : [],
          text: item.description || item.title
        },
        likes: item.likes_count || 0,
        comments: item.comments_count || 0,
        shares: item.reposts_count || 0,
        createdAt: item.created_at,
        isLiked: false,
        isShared: false,
        isBacked: false,
        backPrice: item.share_price || 0,
        currentValue: item.share_price || 0,
        sourcePlatform: item.platform,
        sourceUrl: item.platform_url
      })) : [];

      // Filter out duplicates just in case
      const existingIds = new Set(posts.map(p => p.id));
      const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));

      set({
        posts: [...posts, ...uniqueNewPosts],
        hasMore: newPosts.length >= 20,
      });
    } catch (error) {
      console.error('Fetch more posts error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  likePost: async (postId: string) => {
    // Optimistic update
    set(state => ({
      posts: state.posts.map(post => {
        if (post.id === postId) {
          const isLiked = post.isLiked;
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !isLiked,
          };
        }
        return post;
      }),
    }));

    try {
      await api.post('/api/content/social-action', {
        action_type: 'like',
        reference_id: postId,
        reference_type: 'content'
      });
    } catch (e) {
      console.error('Like interaction failed', e);
      // Could revert state here
    }
  },
  sharePost: async (postId: string) => {
    // Optimistic update
    set(state => ({
      posts: state.posts.map(post => {
        if (post.id === postId) {
          const isShared = post.isShared;
          return {
            ...post,
            shares: isShared ? post.shares - 1 : post.shares + 1,
            isShared: !isShared,
          };
        }
        return post;
      }),
    }));

    try {
      await api.post('/api/content/social-action', {
        action_type: 'share',
        reference_id: postId,
        reference_type: 'content'
      });
    } catch (e) {
      console.error('Share interaction failed', e);
    }
  },
  backPost: async (postId: string, amount: number) => {
    // We treat 'amount' as shares count here for parity with backend
    set(state => ({
      posts: state.posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isBacked: true,
            backPrice: amount,
            currentValue: amount, // Placeholder logic
          };
        }
        return post;
      }),
    }));

    try {
      await api.post('/api/content/buy-shares', {
        content_id: postId,
        shares_count: 1 // Default to 1 share if amount is price? Or is amount the quantity? Assuming simple 1 for now or we need better UI
      });
    } catch (e) {
      console.error('Backing post failed', e);
    }
  },
}));