import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { 
  X, 
  User, 
  Camera, 
  Globe, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook,
  Youtube,
  Check,
  AlertCircle
} from 'lucide-react';
import type { UserType, UpdateProfileRequestType } from '../../shared/types';
import ModalBase from '@/react-app/components/ModalBase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onSuccess: (updatedUser: UserType) => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
  const [formData, setFormData] = useState<UpdateProfileRequestType>({});
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    linkedin: '',
    facebook: '',
    youtube: '',
    tiktok: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        username: user.username || '',
        display_name: user.display_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        banner_url: user.banner_url || '',
        website_url: user.website_url || '',
        social_links: user.social_links || '',
      });

      // Parse existing social links
      if (user.social_links) {
        try {
          const parsed = JSON.parse(user.social_links);
          setSocialLinks({
            instagram: parsed.instagram || '',
            twitter: parsed.twitter || '',
            linkedin: parsed.linkedin || '',
            facebook: parsed.facebook || '',
            youtube: parsed.youtube || '',
            tiktok: parsed.tiktok || ''
          });
        } catch (error) {
          console.error('Failed to parse social links:', error);
        }
      }
    }
  }, [isOpen, user]);

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (type === 'avatar') setUploadingAvatar(true);
    else setUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (type === 'avatar') {
        setFormData(prev => ({ ...prev, avatar_url: data.url }));
      } else {
        setFormData(prev => ({ ...prev, banner_url: data.url }));
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      setErrors(prev => ({ 
        ...prev, 
        [type]: 'Failed to upload image. Please try again.' 
      }));
    } finally {
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingBanner(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ 
        ...prev, 
        [type]: 'Please select an image file.' 
      }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        [type]: 'Image size must be less than 5MB.' 
      }));
      return;
    }

    // Clear any previous errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[type];
      return newErrors;
    });

    handleImageUpload(file, type);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    if (formData.website_url && formData.website_url) {
      try {
        new URL(formData.website_url);
      } catch {
        newErrors.website_url = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Build social links object
      const filteredSocialLinks = Object.entries(socialLinks)
        .filter(([_, value]) => value.trim() !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const updateData = {
        ...formData,
        social_links: Object.keys(filteredSocialLinks).length > 0 
          ? JSON.stringify(filteredSocialLinks) 
          : ''
      };

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      onSuccess(updatedUser);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'tiktok': return <div className="w-4 h-4 bg-black rounded text-white text-xs flex items-center justify-center font-bold">T</div>;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getSocialPlaceholder = (platform: string) => {
    switch (platform) {
      case 'instagram': return '@username';
      case 'twitter': return '@username';
      case 'linkedin': return 'username or profile URL';
      case 'facebook': return 'username or profile URL';
      case 'youtube': return 'channel name or URL';
      case 'tiktok': return '@username';
      default: return 'username';
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-6">
        <div className="-mx-6 -mt-6 flex items-center justify-between border-b border-pr-border px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-pr-text-1">Edit Profile</h2>
              <p className="text-sm text-pr-text-2">Update your profile information and appearance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 transition-colors hover:bg-pr-surface-2"
          >
            <X className="h-5 w-5 text-pr-text-2" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Profile Images Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-pr-text-1">Profile Images</h3>
            
            {/* Banner Upload */}
            <div>
              <label className="mb-3 block text-sm font-medium text-pr-text-1">Banner Image</label>
              <div className="relative">
                <div className="h-48 w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
                  {formData.banner_url ? (
                    <img 
                      src={formData.banner_url} 
                      alt="Banner preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <label className="flex cursor-pointer items-center space-x-2 rounded-xl bg-pr-surface-card px-4 py-2 text-pr-text-1 transition-colors hover:bg-pr-surface-2">
                      {uploadingBanner ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {uploadingBanner ? 'Uploading...' : 'Change Banner'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'banner')}
                        className="hidden"
                        disabled={uploadingBanner}
                      />
                    </label>
                  </div>
                </div>
                {errors.banner && (
                  <p className="mt-2 flex items-center space-x-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.banner}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="mb-3 block text-sm font-medium text-pr-text-1">Profile Picture</label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={formData.avatar_url || '/default-avatar.png'}
                    alt="Profile picture"
                    className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg"
                  />
                  <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-orange-500 text-white transition-colors hover:bg-orange-600">
                    {uploadingAvatar ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'avatar')}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="mb-2 text-sm text-pr-text-2">
                    Upload a new profile picture. Use a square image for best results.
                  </p>
                  <p className="text-xs text-pr-text-2">
                    Supported formats: JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
              </div>
              {errors.avatar && (
                <p className="mt-2 flex items-center space-x-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.avatar}</span>
                </p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-pr-text-1">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-pr-text-1">Username</label>
                <input
                  type="text"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full rounded-xl border px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-orange-500 ${
                    errors.username ? 'border-red-300 bg-red-50' : 'border-pr-surface-3'
                  }`}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.username}</span>
                  </p>
                )}
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-pr-text-1">Display Name</label>
                <input
                  type="text"
                  value={formData.display_name || ''}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full rounded-xl border border-pr-surface-3 px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter display name"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-pr-text-1">Bio</label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                className={`w-full resize-none rounded-xl border px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-orange-500 ${
                  errors.bio ? 'border-red-300 bg-red-50' : 'border-pr-surface-3'
                }`}
              />
              <div className="mt-2 flex items-center justify-between">
                {errors.bio && (
                  <p className="flex items-center space-x-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.bio}</span>
                  </p>
                )}
                <p className="ml-auto text-xs text-pr-text-2">
                  {(formData.bio || '').length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {/* Website */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-pr-text-1">Website</h3>
            <div>
              <label className="mb-2 block text-sm font-medium text-pr-text-1">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={formData.website_url || ''}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className={`w-full rounded-xl border pl-12 pr-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-orange-500 ${
                    errors.website_url ? 'border-red-300 bg-red-50' : 'border-pr-surface-3'
                  }`}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              {errors.website_url && (
                <p className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.website_url}</span>
                </p>
              )}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-pr-text-1">Social Media</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Object.entries(socialLinks).map(([platform, value]) => (
                <div key={platform}>
                  <label className="mb-2 block text-sm font-medium capitalize text-pr-text-1">
                    {platform}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      {getSocialIcon(platform)}
                    </div>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
                      className="w-full rounded-xl border border-pr-surface-3 pl-12 pr-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-orange-500"
                      placeholder={getSocialPlaceholder(platform)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{errors.general}</p>
              </div>
            </div>
          )}
        </div>

        <div className="-mx-6 -mb-6 flex items-center justify-end gap-4 border-t border-pr-border bg-pr-surface-2 px-6 py-6">
          <button
            onClick={onClose}
            className="px-6 py-3 text-pr-text-1 transition-colors hover:text-pr-text-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || uploadingAvatar || uploadingBanner}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3 font-medium text-white transition-all duration-200 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
