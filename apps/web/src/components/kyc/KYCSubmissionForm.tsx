/**
 * KYC Submission Form
 * Users submit identity documents for verification
 */

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Camera,
  FileText,
  Loader2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useI18n } from '@/i18n/I18nContext';

interface KYCSubmissionFormProps {
  onSubmitted: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.promorang.co/api';

export function KYCSubmissionForm({ onSubmitted }: KYCSubmissionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const idTypeLabels: Record<string, string> = {
    passport: t("kyc.idPassport"),
    drivers_license: t("kyc.idLicense"),
    national_id: t("kyc.idNational"),
  };
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    countryOfResidence: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
    occupation: '',
    sourceOfFunds: '',
    idDocumentType: 'passport',
    idDocumentFront: null as File | null,
    idDocumentBack: null as File | null,
    selfie: null as File | null,
    proofOfAddress: null as File | null,
  });

  const [uploadedUrls, setUploadedUrls] = useState({
    idDocumentFrontUrl: '',
    idDocumentBackUrl: '',
    selfieUrl: '',
    proofOfAddressUrl: '',
  });

  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData({ ...formData, [field]: file });
    
    if (file) {
      // Create local preview URL
      const url = URL.createObjectURL(file);
      setUploadedUrls(prev => ({ ...prev, [`${field}Url`]: url }));
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    // In production, upload to your storage (Supabase Storage, S3, etc.)
    // For now, return a mock URL
    return URL.createObjectURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Upload files first
      const uploads: any = {};
      
      if (formData.idDocumentFront) {
        uploads.idDocumentFrontUrl = await uploadFile(formData.idDocumentFront);
      }
      if (formData.idDocumentBack) {
        uploads.idDocumentBackUrl = await uploadFile(formData.idDocumentBack);
      }
      if (formData.selfie) {
        uploads.selfieUrl = await uploadFile(formData.selfie);
      }
      if (formData.proofOfAddress) {
        uploads.proofOfAddressUrl = await uploadFile(formData.proofOfAddress);
      }

      // Submit KYC
      const response = await fetch(`${API_BASE}/pieces/kyc/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          countryOfResidence: formData.countryOfResidence,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          phoneNumber: formData.phoneNumber,
          occupation: formData.occupation,
          sourceOfFunds: formData.sourceOfFunds,
          idDocumentType: formData.idDocumentType,
          ...uploads,
        }),
      });

      if (response.ok) {
        toast({
          title: t("kyc.submitted"),
          description: t("kyc.submittedDays"),
        });
        onSubmitted();
      } else {
        throw new Error(t("kyc.submitError"));
      }
    } catch (error) {
      toast({
        title: t("kyc.submitError"),
        description: t("kyc.submitError"),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("kyc.firstName")}</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("kyc.lastName")}</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">{t("kyc.dob")}</Label>
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nationality">{t("kyc.nationality")}</Label>
          <Input
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="countryOfResidence">{t("kyc.residence")}</Label>
          <Input
            id="countryOfResidence"
            name="countryOfResidence"
            value={formData.countryOfResidence}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">{t("kyc.phone")}</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="addressLine1">{t("kyc.address1")}</Label>
        <Input
          id="addressLine1"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">{t("kyc.address2")}</Label>
        <Input
          id="addressLine2"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">{t("kyc.city")}</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">{t("kyc.state")}</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">{t("kyc.postal")}</Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="occupation">{t("kyc.occupation")}</Label>
        <Input
          id="occupation"
          name="occupation"
          value={formData.occupation}
          onChange={handleInputChange}
          placeholder={t("kyc.occupationPh")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceOfFunds">{t("kyc.source")}</Label>
        <select
          id="sourceOfFunds"
          name="sourceOfFunds"
          value={formData.sourceOfFunds}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">{t("kyc.select")}</option>
          <option value="salary">{t("kyc.fundSalary")}</option>
          <option value="business">{t("kyc.fundBusiness")}</option>
          <option value="investment">{t("kyc.fundInvestment")}</option>
          <option value="savings">{t("kyc.fundSavings")}</option>
          <option value="inheritance">{t("kyc.fundInheritance")}</option>
          <option value="gift">{t("kyc.fundGift")}</option>
          <option value="other">{t("kyc.fundOther")}</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t("kyc.idType")}</Label>
        <div className="flex gap-2">
          {['passport', 'drivers_license', 'national_id'].map((type) => (
            <Button
              key={type}
              type="button"
              variant={formData.idDocumentType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFormData({ ...formData, idDocumentType: type })}
            >
              {idTypeLabels[type] || type}
            </Button>
          ))}
        </div>
      </div>

      {/* ID Front */}
      <div className="space-y-2">
        <Label>{t("kyc.idFront")}</Label>
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-violet-500 transition-colors"
          onClick={() => frontFileRef.current?.click()}
        >
          {uploadedUrls.idDocumentFrontUrl ? (
            <div className="relative">
              <img 
                src={uploadedUrls.idDocumentFrontUrl} 
                alt={t("kyc.idFrontAlt")}
                className="max-h-32 mx-auto rounded"
              />
              <Badge className="absolute top-2 right-2 bg-green-500">{t("kyc.uploaded")}</Badge>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t("kyc.uploadFront")}</p>
            </>
          )}
          <input
            ref={frontFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange('idDocumentFront', e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {/* ID Back */}
      <div className="space-y-2">
        <Label>{t("kyc.idBack")}</Label>
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-violet-500 transition-colors"
          onClick={() => backFileRef.current?.click()}
        >
          {uploadedUrls.idDocumentBackUrl ? (
            <div className="relative">
              <img 
                src={uploadedUrls.idDocumentBackUrl} 
                alt={t("kyc.idBackAlt")}
                className="max-h-32 mx-auto rounded"
              />
              <Badge className="absolute top-2 right-2 bg-green-500">{t("kyc.uploaded")}</Badge>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t("kyc.uploadBack")}</p>
            </>
          )}
          <input
            ref={backFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange('idDocumentBack', e.target.files?.[0] || null)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Selfie */}
      <div className="space-y-2">
        <Label>{t("kyc.selfie")}</Label>
        <div className="text-sm text-muted-foreground mb-2">
          {t("kyc.selfieHint")}
        </div>
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-violet-500 transition-colors"
          onClick={() => selfieRef.current?.click()}
        >
          {uploadedUrls.selfieUrl ? (
            <div className="relative">
              <img 
                src={uploadedUrls.selfieUrl} 
                alt={t("kyc.selfieAlt")}
                className="max-h-32 mx-auto rounded"
              />
              <Badge className="absolute top-2 right-2 bg-green-500">{t("kyc.uploaded")}</Badge>
            </div>
          ) : (
            <>
              <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t("kyc.uploadSelfie")}</p>
            </>
          )}
          <input
            ref={selfieRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {/* Proof of Address */}
      <div className="space-y-2">
        <Label>{t("kyc.proof")}</Label>
        <div className="text-sm text-muted-foreground mb-2">
          {t("kyc.proofHint")}
        </div>
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-violet-500 transition-colors"
          onClick={() => addressRef.current?.click()}
        >
          {uploadedUrls.proofOfAddressUrl ? (
            <div className="relative">
              <img 
                src={uploadedUrls.proofOfAddressUrl} 
                alt={t("kyc.proofAlt")}
                className="max-h-32 mx-auto rounded"
              />
              <Badge className="absolute top-2 right-2 bg-green-500">{t("kyc.uploaded")}</Badge>
            </div>
          ) : (
            <>
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t("kyc.uploadProof")}</p>
            </>
          )}
          <input
            ref={addressRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => handleFileChange('proofOfAddress', e.target.files?.[0] || null)}
          />
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.dateOfBirth && 
               formData.nationality && formData.countryOfResidence;
      case 2:
        return formData.addressLine1 && formData.city && formData.postalCode;
      case 3:
        return formData.idDocumentFront;
      case 4:
        return formData.selfie;
      default:
        return true;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t("kyc.formTitle")}
        </CardTitle>
        <CardDescription>
          {t("kyc.formCopy")}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s === step ? 'bg-violet-600 text-white' :
                s < step ? 'bg-green-500 text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {s < step ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 4 && <div className={`h-1 w-8 ${s < step ? 'bg-green-500' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-xs text-muted-foreground mb-6">
          <span>{t("kyc.stepPersonal")}</span>
          <span>{t("kyc.stepAddress")}</span>
          <span>{t("kyc.stepId")}</span>
          <span>{t("kyc.stepVerify")}</span>
        </div>

        {/* Form Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("kyc.back")}
          </Button>
          
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              {t("kyc.next")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              {t("kyc.submitReview")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default KYCSubmissionForm;
