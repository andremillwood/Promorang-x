/**
 * Post Proof Entry Page
 * 
 * Entry surface for submitting content/proof for deals.
 * Simple, action-first interface for new users.
 * 
 * This is a NEW route at /post - does not replace existing /create page.
 */

import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useMaturity } from '@/react-app/context/MaturityContext';
import { EntryLayout } from '@/react-app/components/entry';
import {
  Upload, Link as LinkIcon, Instagram, Youtube,
  Twitter, ChevronRight, Sparkles, Shield, Tag, Check, X,
  Image as ImageIcon, Video, Trophy, ArrowRight
} from 'lucide-react';
import { markCompleted, STORAGE_KEYS } from '@/react-app/hooks/useWhatsNext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type PostType = 'link' | 'image' | 'video';
type Platform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'other';

interface PostFormData {
  type: PostType;
  platform: Platform;
  proofs: Array<{ url: string; type: 'image' | 'video' }>;
  caption: string;
  dealId?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
  { id: 'tiktok', name: 'TikTok', icon: Video, color: 'from-black to-gray-800' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
  { id: 'twitter', name: 'X / Twitter', icon: Twitter, color: 'from-blue-400 to-blue-500' },
  { id: 'other', name: 'Other', icon: LinkIcon, color: 'from-gray-500 to-gray-600' }
] as const;

export default function PostProofPage() {
  const { user } = useAuth();
  const { recordAction, visibility, maturityState } = useMaturity();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'type' | 'platform' | 'details' | 'success'>('type');
  const [formData, setFormData] = useState<PostFormData>({
    type: 'link',
    platform: 'instagram',
    proofs: [],
    caption: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pastedUrl, setPastedUrl] = useState('');

  const handleTypeSelect = (type: PostType) => {
    setFormData(prev => ({ ...prev, type }));
    setStep('platform');
  };

  const handlePlatformSelect = (platform: Platform) => {
    setFormData(prev => ({ ...prev, platform }));
    setStep('details');
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsCapturingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        }));
        setIsCapturingLocation(false);
      },
      (err) => {
        console.error('Error capturing location:', err);
        setError('Failed to get location. Please ensure location permissions are enabled.');
        setIsCapturingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const uploadFile = async (file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const token = localStorage.getItem('access_token');
          const response = await fetch(`${API_BASE}/api/content/upload-image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              fileData: base64Data
            })
          });

          if (!response.ok) throw new Error('Upload failed');
          const result = await response.json();
          resolve(result.imageUrl);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth', { state: { from: '/post', formData } });
      return;
    }

    // Validation
    if (formData.type === 'link' && !pastedUrl.trim()) {
      setError('Please enter a URL to your post');
      return;
    }

    if (formData.type !== 'link' && formData.proofs.length === 0) {
      setError('Please upload at least one proof image/video');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');

      // If we have a dealId, use the specialized proof endpoint
      const endpoint = formData.dealId
        ? `${API_BASE}/api/drops/${formData.dealId}/proof`
        : `${API_BASE}/api/content`;

      const payload = formData.dealId
        ? {
          proof_url: formData.proofs[0]?.url || pastedUrl,
          submission_text: formData.caption,
          metadata: {
            proofs: formData.proofs,
            location: formData.location,
            platform: formData.platform,
            type: formData.type
          }
        }
        : {
          content_type: formData.type,
          platform: formData.platform,
          url: formData.proofs[0]?.url || pastedUrl,
          caption: formData.caption,
          drop_id: formData.dealId,
          metadata: {
            proofs: formData.proofs,
            location: formData.location
          }
        };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await recordAction('post_submitted', {
          platform: formData.platform,
          type: formData.type,
          has_location: !!formData.location,
          proof_count: formData.proofs.length
        });

        markCompleted(STORAGE_KEYS.submittedProof);
        setStep('success');
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to submit proof');
      }
    } catch (err) {
      console.error('Error submitting proof:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const newProofs: Array<{ url: string; type: 'image' | 'video' }> = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await uploadFile(file);
        newProofs.push({
          url: imageUrl,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        });
      }

      setFormData(prev => ({
        ...prev,
        proofs: [...prev.proofs, ...newProofs]
      }));
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload one or more files.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeProof = (index: number) => {
    setFormData(prev => ({
      ...prev,
      proofs: prev.proofs.filter((_, i) => i !== index)
    }));
  };

  return (
    <EntryLayout>
      <div className="min-h-screen bg-pr-surface-2">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 text-white">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Build your Access Rank & enter the daily draw</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Share Content, Rank Up
            </h1>
            <p className="text-lg opacity-90 max-w-xl">
              When you share content on social media and submit proof here, you increase your Access Rank. Higher ranks unlock better rewards, priority access, and the ability to earn from sponsored content.
            </p>
          </div>
        </div>

        {/* Badges Row */}
        <div className="bg-pr-surface-1 border-b border-pr-surface-3">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-pr-text-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>{visibility.labels.verified}</span>
              </div>
              <div className="flex items-center gap-1.5 text-pr-text-2">
                <Tag className="w-4 h-4 text-amber-500" />
                <span>{visibility.labels.weeklyWins}</span>
              </div>
              {!user && (
                <Link to="/auth" className="ml-auto text-blue-500 hover:text-blue-600 font-medium">
                  Sign in to submit →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Rank Progress Banner - Only for State 0/1 */}
          {maturityState <= 1 && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-green-900">Your current rank: {maturityState === 0 ? 'Rank 0 (New)' : 'Rank 1 (Explorer)'}</h2>
                  <p className="text-sm text-green-700">Every proof you submit increases your Access Rank, enters you in the daily draw, and unlocks access to sponsored opportunities where you can earn Verified Credits.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold uppercase">Rank Up!</div>
                <ArrowRight className="w-4 h-4 text-green-600" />
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {['type', 'platform', 'details'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s ? 'bg-blue-500 text-white' :
                  ['type', 'platform', 'details'].indexOf(step) > i ? 'bg-green-500 text-white' :
                    'bg-pr-surface-3 text-pr-text-2'
                  }`}>
                  {['type', 'platform', 'details'].indexOf(step) > i ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && (
                  <div className={`w-12 h-1 rounded ${['type', 'platform', 'details'].indexOf(step) > i ? 'bg-green-500' : 'bg-pr-surface-3'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Select Type */}
          {step === 'type' && (
            <div className="bg-pr-surface-1 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-pr-text-1 mb-2">What are you posting?</h2>
              <p className="text-pr-text-2 mb-6">Select the type of content you want to submit.</p>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleTypeSelect('link')}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-pr-surface-3 hover:border-blue-500 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <LinkIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-pr-text-1">Link to Post</h3>
                    <p className="text-sm text-pr-text-2">Share a link to your social media post</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-pr-text-2 ml-auto" />
                </button>

                <button
                  onClick={() => handleTypeSelect('image')}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-pr-surface-3 hover:border-blue-500 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-pr-text-1">Upload Screenshot</h3>
                    <p className="text-sm text-pr-text-2">Upload a screenshot of your post or interaction</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-pr-text-2 ml-auto" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Platform */}
          {step === 'platform' && (
            <div className="bg-pr-surface-1 rounded-2xl p-6 shadow-sm">
              <button
                onClick={() => setStep('type')}
                className="text-sm text-blue-500 hover:text-blue-600 mb-4"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold text-pr-text-1 mb-2">Which platform?</h2>
              <p className="text-pr-text-2 mb-6">Select where you posted your content.</p>

              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(platform => {
                  const Icon = platform.icon;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformSelect(platform.id as Platform)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-pr-surface-3 hover:border-blue-500 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-medium text-pr-text-1">{platform.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Enter Details */}
          {step === 'details' && (
            <div className="bg-pr-surface-1 rounded-2xl p-6 shadow-sm">
              <button
                onClick={() => setStep('platform')}
                className="text-sm text-blue-500 hover:text-blue-600 mb-4"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold text-pr-text-1 mb-2">Add your content</h2>
              <p className="text-pr-text-2 mb-6">
                {formData.type === 'link'
                  ? 'Paste the link to your post'
                  : `Upload your ${formData.type}`
                }
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {formData.type === 'link' ? (
                  <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                      Post URL
                    </label>
                    <input
                      type="url"
                      value={pastedUrl}
                      onChange={(e) => setPastedUrl(e.target.value)}
                      placeholder="https://instagram.com/p/..."
                      className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-2 text-pr-text-1 placeholder-pr-text-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={formData.type === 'image' ? 'image/*' : 'video/*'}
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Multi-Proof Grid */}
                    {formData.proofs.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {formData.proofs.map((proof, idx) => (
                          <div key={idx} className="relative group aspect-video rounded-xl bg-pr-surface-3 overflow-hidden border border-pr-surface-2">
                            {proof.type === 'image' ? (
                              <img src={proof.url} alt="Proof" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-pr-text-2">
                                <Video className="w-8 h-8" />
                              </div>
                            )}
                            <button
                              onClick={() => removeProof(idx)}
                              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="w-full p-8 border-2 border-dashed border-pr-surface-3 rounded-xl hover:border-blue-500 transition-colors flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-full bg-pr-surface-2 flex items-center justify-center">
                        {isUploading ? (
                          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-pr-text-2" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-pr-text-1">
                          {isUploading ? 'Uploading...' : 'Click to upload proof'}
                        </p>
                        <p className="text-sm text-pr-text-2">
                          Add multiple images or videos
                        </p>
                      </div>
                    </button>
                  </div>
                )}

                {/* Location Capture Section */}
                <div className="p-4 bg-pr-surface-2 rounded-xl border border-pr-surface-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.location ? 'bg-green-100 text-green-600' : 'bg-pr-surface-3 text-pr-text-3'}`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-pr-text-1">GPS Verification</h4>
                        <p className="text-xs text-pr-text-2">
                          {formData.location
                            ? `Location verified: ${formData.location.latitude.toFixed(4)}, ${formData.location.longitude.toFixed(4)}`
                            : 'Recommended for physical activations'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCaptureLocation}
                      disabled={isCapturingLocation}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.location
                        ? 'bg-green-600 text-white'
                        : 'bg-pr-surface-3 text-pr-text-2 hover:bg-pr-surface-4'
                        }`}
                    >
                      {isCapturingLocation ? 'Capturing...' : formData.location ? 'Update Location' : 'Add Location'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-2">
                    Caption (optional)
                  </label>
                  <textarea
                    value={formData.caption}
                    onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Add a note about your post..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-2 text-pr-text-1 placeholder-pr-text-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploading || (formData.type === 'link' ? !pastedUrl.trim() : formData.proofs.length === 0)}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Proof <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="bg-pr-surface-1 rounded-2xl p-8 shadow-sm text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-pr-text-1 mb-2">Proof Submitted!</h2>
              <p className="text-pr-text-2 mb-6">
                Your content is being verified. You'll be notified when it's approved.
              </p>

              <div className="bg-pr-surface-2 rounded-xl p-4 mb-6">
                <p className="text-sm text-pr-text-2">
                  This action qualifies you for <span className="font-semibold text-pr-text-1">{visibility.labels.weeklyWins}</span>
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/deals"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  Find More Deals
                </Link>
                <button
                  onClick={() => {
                    setStep('type');
                    setFormData({ type: 'link', platform: 'instagram', proofs: [], caption: '' });
                  }}
                  className="w-full py-3 bg-pr-surface-2 text-pr-text-1 font-medium rounded-xl hover:bg-pr-surface-3 transition-colors"
                >
                  Submit Another
                </button>
              </div>
            </div>
          )}

          {/* Help Text */}
          {step !== 'success' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-pr-text-2">
                Need help? <Link to="/support" className="text-blue-500 hover:text-blue-600">Contact support</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </EntryLayout>
  );
}
