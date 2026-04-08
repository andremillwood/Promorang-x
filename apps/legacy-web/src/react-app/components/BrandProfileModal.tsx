import { useState, useRef } from 'react';
import { X, Upload, Building2, Globe, Mail, Phone, FileText, Camera, Check } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';

interface BrandProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brandData: any) => void;
  currentBrandData?: {
    brand_name?: string;
    brand_logo_url?: string;
    brand_description?: string;
    brand_website?: string;
    brand_email?: string;
    brand_phone?: string;
  };
  loading?: boolean;
}

export default function BrandProfileModal({
  isOpen,
  onClose,
  onSave,
  currentBrandData = {},
  loading = false
}: BrandProfileModalProps) {
  const [formData, setFormData] = useState({
    brand_name: currentBrandData.brand_name || '',
    brand_description: currentBrandData.brand_description || '',
    brand_website: currentBrandData.brand_website || '',
    brand_email: currentBrandData.brand_email || '',
    brand_phone: currentBrandData.brand_phone || ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(currentBrandData.brand_logo_url || '');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string> => {
    if (!logoFile) return logoPreview || '';

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('image', logoFile);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.url || '';
      } else {
        console.error('Failed to upload logo');
        return '';
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      return '';
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.brand_name.trim()) {
      alert('Brand name is required');
      return;
    }

    let logoUrl = logoPreview;
    
    // Upload logo if a new file was selected
    if (logoFile) {
      logoUrl = await uploadLogo();
      if (!logoUrl.trim()) {
        alert('Failed to upload logo. Please try again.');
        return;
      }
    }

    const brandData = {
      ...formData,
      brand_logo_url: logoUrl || ''
    };

    onSave(brandData);
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={false}
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-pr-surface-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pr-surface-3 px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-pr-text-1">Brand Profile</h2>
              <p className="text-sm text-pr-text-2">Set up your brand representation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            aria-label="Close brand profile modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-3">
              Brand Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-pr-surface-2 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-pr-surface-3">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Brand logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="bg-pr-surface-2 hover:bg-pr-surface-3 disabled:opacity-50 text-pr-text-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                </button>
                <p className="text-xs text-pr-text-2 mt-1">
                  PNG, JPG up to 5MB. Square format recommended.
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              className="hidden"
            />
          </div>

          {/* Brand Name */}
          <div>
            <label htmlFor="brand_name" className="block text-sm font-medium text-pr-text-1 mb-2">
              Brand Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="brand_name"
                type="text"
                value={formData.brand_name}
                onChange={(e) => handleInputChange('brand_name', e.target.value)}
                placeholder="Enter your brand name"
                className="w-full pl-10 pr-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Brand Description */}
          <div>
            <label htmlFor="brand_description" className="block text-sm font-medium text-pr-text-1 mb-2">
              Brand Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="brand_description"
                value={formData.brand_description}
                onChange={(e) => handleInputChange('brand_description', e.target.value)}
                placeholder="Describe your brand, mission, and values"
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="brand_website" className="block text-sm font-medium text-pr-text-1 mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="brand_website"
                type="url"
                value={formData.brand_website}
                onChange={(e) => handleInputChange('brand_website', e.target.value)}
                placeholder="https://yourbrand.com"
                className="w-full pl-10 pr-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="brand_email" className="block text-sm font-medium text-pr-text-1 mb-2">
                Brand Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="brand_email"
                  type="email"
                  value={formData.brand_email}
                  onChange={(e) => handleInputChange('brand_email', e.target.value)}
                  placeholder="contact@yourbrand.com"
                  className="w-full pl-10 pr-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="brand_phone" className="block text-sm font-medium text-pr-text-1 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="brand_phone"
                  type="tel"
                  value={formData.brand_phone}
                  onChange={(e) => handleInputChange('brand_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full pl-10 pr-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.brand_name && (
            <div className="bg-pr-surface-2 rounded-xl p-4">
              <h4 className="text-sm font-medium text-pr-text-1 mb-3">Preview</h4>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-pr-surface-card rounded-lg flex items-center justify-center overflow-hidden border border-pr-surface-3">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Brand logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-pr-text-1">{formData.brand_name}</div>
                  {formData.brand_description && (
                    <div className="text-sm text-pr-text-2 line-clamp-1">{formData.brand_description}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 border-t border-pr-surface-3 px-6 py-6">
          <button
            onClick={onClose}
            className="px-6 py-2 text-pr-text-1 hover:text-pr-text-1 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || uploadingLogo || !formData.brand_name.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Brand Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
