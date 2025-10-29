import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../App';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Users,
  Star,
  Calendar,
  Key,
  Diamond
} from 'lucide-react';
import UserLink from '@/react-app/components/UserLink';
import { DropType, DropTypeSchema, DropDifficultySchema, UserType } from '@/shared/types';
import { buildAuthHeaders } from '@/react-app/utils/api';

interface CreateDropRequestType {
  title: string;
  description: string;
  drop_type: string;
  difficulty: string;
  key_cost: number;
  gem_reward_base: number;
  gem_pool_total: number;
  follower_threshold: number;
  time_commitment: string;
  requirements: string;
  deliverables: string;
  deadline_at: string;
  max_participants?: number;
  platform: string;
  content_url: string;
  is_proof_drop: boolean;
  is_paid_drop: boolean;
  move_cost_points: number;
  key_reward_amount: number;
  move_actions: any[];
}

export default function Earn() {
  const { user } = useAuth();
  const location = useLocation();
  const [drops, setDrops] = useState<DropType[]>([]);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDropType, setSelectedDropType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    fetchDrops();
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Check URL parameters to auto-open create modal
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const createParam = urlParams.get('create');
    if ((createParam === 'proof' || createParam === 'paid') && userData && userData.user_type === 'advertiser') {
      setShowCreateForm(true);
    }
  }, [location, userData]);

  const fetchUserData = async () => {
    try {
      const headers = buildAuthHeaders();
      const response = await fetch('/api/users/me', {
        credentials: 'include',
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchDrops = async () => {
    try {
      const response = await fetch('/api/drops');
      const data = await response.json();
      setDrops(data);
    } catch (error) {
      console.error('Failed to fetch drops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrops = drops.filter(drop => {
    const matchesSearch = drop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drop.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDropType = !selectedDropType || drop.drop_type === selectedDropType;
    const matchesDifficulty = !selectedDifficulty || drop.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDropType && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earn</h1>
          <p className="text-gray-600 mt-2">Discover earning drops that match your skills</p>
        </div>
        {userData && userData.user_type === 'advertiser' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Drop</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search drops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedDropType}
            onChange={(e) => setSelectedDropType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Drop Types</option>
            {DropTypeSchema.options.map(dropType => (
              <option key={dropType} value={dropType}>
                {dropType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            {DropDifficultySchema.options.map(difficulty => (
              <option key={difficulty} value={difficulty} className="capitalize">{difficulty}</option>
            ))}
          </select>

          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-gray-500" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Drops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </div>

      {filteredDrops.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No drops found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or create a new drop.</p>
        </div>
      )}

      {/* Create Drop Modal */}
      {showCreateForm && userData && userData.user_type === 'advertiser' && (
        <CreateDropModal 
          onClose={() => setShowCreateForm(false)} 
          onSuccess={() => {
            setShowCreateForm(false);
            fetchDrops();
          }}
        />
      )}
    </div>
  );
}

function DropCard({ drop }: { drop: DropType }) {
  const navigate = useNavigate();
  
  const getDropTypeImage = (dropType: string) => {
    // Use the drop's content_url if available, otherwise fallback to default images
    if (drop?.content_url) {
      return drop.content_url;
    }
    
    switch (dropType) {
      case 'content_clipping': return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop';
      case 'reviews': return 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=400&h=250&fit=crop';
      case 'ugc_creation': return 'https://images.unsplash.com/photo-1558403194-611308249627?w=400&h=250&fit=crop';
      case 'affiliate_referral': return 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=400&h=250&fit=crop';
      case 'surveys': return 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=250&fit=crop';
      case 'challenges_events': return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';
      default: return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';
    }
  };

  const handleDropClick = () => {
    // Use React Router navigation instead of window.location
    navigate(`/drops/${drop.id}`);
  };

  // Check if this is demo content
  const isDemo = drop.title?.toLowerCase().includes('[demo]') || 
                 drop.title?.toLowerCase().includes('demo') ||
                 drop.description?.toLowerCase().includes('demo');

  const getDropTypeIcon = (dropType: string) => {
    switch (dropType) {
      case 'content_clipping': return '✂️';
      case 'reviews': return '⭐';
      case 'ugc_creation': return '🎨';
      case 'affiliate_referral': return '🔗';
      case 'surveys': return '📊';
      case 'challenges_events': return '🏆';
      default: return '📝';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <span>🧪</span>
            <span>DEMO DROP - No real gems awarded</span>
            <span>🧪</span>
          </div>
        </div>
      )}

      <div className="relative cursor-pointer" onClick={handleDropClick}>
        <img 
          src={getDropTypeImage(drop.drop_type)} 
          alt={drop.title}
          className="w-full h-48 object-cover hover:opacity-95 transition-opacity"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="absolute top-4 right-4 flex space-x-2">
          {isDemo && (
            <span className="bg-orange-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
              DEMO
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(drop.difficulty)}`}>
            {drop.difficulty}
          </span>
        </div>
        <div className="absolute top-4 left-4">
          {drop.is_proof_drop ? (
            <div className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Proof Drop</span>
            </div>
          ) : drop.is_paid_drop ? (
            <div className="bg-purple-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Paid Drop</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-orange-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <Key className="w-3 h-3 text-white" />
              <span className="text-white text-sm font-medium">{drop.key_cost}</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-2">
            <Diamond className="w-6 h-6 text-purple-300 drop-shadow" />
            <p className="text-3xl font-bold text-white drop-shadow-lg">
              {drop.gem_reward_base}{isDemo && <span className="text-lg opacity-80"> (Demo)</span>}
            </p>
          </div>
          <p className="text-sm text-white/80 drop-shadow">
            {isDemo ? 'Demo gems (no real value)' : 'Gems reward'}
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getDropTypeIcon(drop.drop_type)}</span>
            {drop.is_proof_drop ? (
              <div className="flex items-center space-x-1 text-sm bg-green-100 px-2 py-1 rounded">
                <span className="font-medium text-green-700">Proof Drop - Free</span>
              </div>
            ) : drop.is_paid_drop ? (
              <div className="flex items-center space-x-1 text-sm bg-purple-100 px-2 py-1 rounded">
                <span className="font-medium text-purple-700">Paid Drop</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-sm">
                <Key className="w-3 h-3 text-orange-600" />
                <span className="font-medium text-orange-700">{drop.key_cost} keys</span>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-orange-600 transition-colors" onClick={handleDropClick}>
          {drop.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{drop.description}</p>

        <div className="mb-4">
          <UserLink 
            username={drop.creator_name}
            displayName={drop.creator_name}
            avatarUrl={drop.creator_avatar}
            className="flex items-center space-x-2"
            size="sm"
          />
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{drop.current_participants}/{drop.max_participants || '∞'} participants</span>
          </div>
          
          {drop.follower_threshold > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Star className="w-4 h-4" />
              <span>{drop.follower_threshold}+ followers required</span>
            </div>
          )}

          {drop.deadline_at && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Due {new Date(drop.deadline_at).toLocaleDateString()}</span>
            </div>
          )}

          {drop.time_commitment && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{drop.time_commitment}</span>
            </div>
          )}

          {drop.gem_pool_total > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Diamond className="w-4 h-4" />
              <span>{drop.gem_pool_remaining} gems remaining in pool</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {drop.drop_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleDropClick}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CreateDropModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// CreateDropRequestType is imported from shared/types

const CreateDropModal: React.FC<CreateDropModalProps> = ({ onClose, onSuccess }) => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const createParam = urlParams.get('create');
  
  // Determine initial drop type based on URL parameter
  const getInitialDropType = (): 'proof' | 'paid' | 'move' => {
    if (createParam === 'paid') return 'paid';
    if (createParam === 'move') return 'move';
    return 'proof'; // Default to proof drop
  };
  
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'link'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // These states are used in the component
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dropType, setDropType] = useState<'proof' | 'paid' | 'move'>(getInitialDropType());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize form data based on drop type
  const getInitialFormData = (type: 'proof' | 'paid' | 'move'): CreateDropRequestType => {
    return {
      title: '',
      description: '',
      drop_type: 'content_clipping',
      difficulty: 'easy',
      key_cost: type === 'paid' ? 1 : 0,
      gem_reward_base: type === 'paid' ? 50 : 0,
      gem_pool_total: 0,
      follower_threshold: 0,
      time_commitment: '',
      requirements: '',
      deliverables: '',
      deadline_at: '',
      max_participants: undefined,
      platform: '',
      content_url: '',
      is_proof_drop: type === 'proof',
      is_paid_drop: type === 'paid',
      move_cost_points: 0,
      key_reward_amount: 0,
      move_actions: []
    };
  };
  
  const [formData, setFormData] = useState<CreateDropRequestType>(() => getInitialFormData(getInitialDropType()));

  // Update form data when drop type changes
  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      is_proof_drop: dropType === 'proof',
      is_paid_drop: dropType === 'paid',
      key_cost: dropType === 'paid' ? 1 : 0,
      gem_reward_base: dropType === 'paid' ? 50 : 0,
    }));
  }, [dropType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    try {
      setUploadingFile(true);
      
      // Convert file to base64 for transmission
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to backend
      const response = await fetch('/api/content/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          image: base64,
          filename: file.name,
          contentType: file.type,
          description: formData.title || 'Marketing drop',
          platform: formData.platform || 'general'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      // Fallback to a placeholder image if upload fails
      return 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&h=600&fit=crop&crop=center';
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Handle file upload if in upload mode and file is selected
      let imageUrl = formData.content_url;
      
      if (uploadMode === 'upload' && uploadedFile) {
        try {
          imageUrl = await uploadImageToStorage(uploadedFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
          return;
        }
      } else if (uploadMode === 'link' && formData.content_url) {
        // Validate URL if in link mode
        try {
          const response = await fetch(formData.content_url, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error('Invalid image URL');
          }
        } catch (error) {
          alert('Please provide a valid image URL');
          return;
        }
      }
      
      // Submit the form data
      const response = await fetch('/api/drops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          content_url: imageUrl,
          drop_type: dropType === 'proof' ? 'content_clipping' : 
                    dropType === 'paid' ? 'paid_content' : 'action_required',
          difficulty: formData.difficulty || 'easy',
          deadline_at: formData.deadline_at || null,
          max_participants: formData.max_participants || null,
          key_cost: dropType === 'paid' ? formData.key_cost || 1 : 0,
          gem_reward_base: dropType === 'paid' ? formData.gem_reward_base || 50 : 0,
          is_proof_drop: dropType === 'proof',
          is_paid_drop: dropType === 'paid',
          move_cost_points: dropType === 'move' ? formData.move_cost_points || 0 : 0,
          key_reward_amount: dropType === 'move' ? formData.key_reward_amount || 0 : 0,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create drop');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating drop:', error);
      alert(error instanceof Error ? error.message : 'Failed to create drop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Drop</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drop Type
            </label>
            <div className="flex space-x-4">
              {(['proof', 'paid', 'move'] as const).map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-orange-500"
                    checked={dropType === type}
                    onChange={() => setDropType(type)}
                  />
                  <span className="ml-2 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full p-2 border rounded"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                className="w-full p-2 border rounded"
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {dropType === 'paid' && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Cost
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded"
                  value={formData.key_cost}
                  onChange={(e) => setFormData({...formData, key_cost: Number(e.target.value)})}
                  required={dropType === 'paid'}
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-4 mb-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-orange-500"
                  checked={uploadMode === 'upload'}
                  onChange={() => setUploadMode('upload')}
                />
                <span className="ml-2">Upload Image</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-orange-500"
                  checked={uploadMode === 'link'}
                  onChange={() => setUploadMode('link')}
                />
                <span className="ml-2">Image URL</span>
              </label>
            </div>

            {uploadMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors"
                >
                  {uploadingFile ? 'Uploading...' : 'Choose an image'}
                </button>
                {previewUrl && (
                  <div className="mt-2 relative">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-40 rounded"
                    />
                    <button
                      type="button"
                      onClick={removeUploadedFile}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="url"
                className="w-full p-2 border rounded"
                placeholder="https://example.com/image.jpg"
                value={formData.content_url}
                onChange={(e) => setFormData({...formData, content_url: e.target.value})}
                required
              />
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
              disabled={loading || uploadingFile}
            >
              {loading ? 'Creating...' : 'Create Drop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
