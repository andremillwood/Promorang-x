import type { TaskType, WalletType, TransactionType } from '../../shared/types';

export const mockTasks: TaskType[] = [
  {
    id: 1,
    creator_id: 1,
    title: 'Complete Social Media Survey',
    description: 'Take a quick 5-minute survey about social media usage',
    task_type: 'survey',
    reward_amount: 5.00,
    reward_currency: 'USD',
    status: 'active',
    is_public: true,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    max_participants: 100,
    current_participants: 42,
    requirements: { min_age: 18 },
    metadata: { platform: 'all' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: 'Surveys',
    difficulty: 'easy'
  },
  {
    id: 2,
    creator_id: 2,
    title: 'Beta Test New App Feature',
    description: 'Test our new feature and provide feedback',
    task_type: 'testing',
    reward_amount: 15.00,
    reward_currency: 'USD',
    status: 'active',
    is_public: true,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    max_participants: 50,
    current_participants: 12,
    requirements: { device: 'mobile' },
    metadata: { os: ['ios', 'android'] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: 'Testing',
    difficulty: 'medium'
  },
  {
    id: 3,
    creator_id: 3,
    title: 'Content Moderation',
    description: 'Help moderate community content',
    task_type: 'moderation',
    reward_amount: 25.00,
    reward_currency: 'USD',
    status: 'active',
    is_public: false,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    max_participants: 20,
    current_participants: 8,
    requirements: { experience: 'moderation' },
    metadata: { commitment: '5 hours/week' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: 'Community',
    difficulty: 'hard'
  }
];

export const mockWallets: WalletType[] = [
  {
    id: 1,
    user_id: 1,
    currency_type: 'USD',
    balance: 125.50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 1,
    currency_type: 'POINTS',
    balance: 2500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockTransactions: TransactionType[] = [
  {
    id: 1,
    user_id: 1,
    transaction_type: 'credit',
    amount: 10.00,
    currency: 'USD',
    status: 'completed',
    reference_id: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    description: 'Task completion reward',
    metadata: { task_id: 1 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 1,
    transaction_type: 'debit',
    amount: 5.00,
    currency: 'USD',
    status: 'completed',
    reference_id: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    description: 'Withdrawal to bank account',
    metadata: { method: 'bank_transfer' },
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    user_id: 1,
    transaction_type: 'credit',
    amount: 500,
    currency: 'POINTS',
    status: 'completed',
    reference_id: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    description: 'Daily login bonus',
    metadata: { type: 'bonus' },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];
