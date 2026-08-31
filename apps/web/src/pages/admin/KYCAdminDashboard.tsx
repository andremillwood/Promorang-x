/**
 * KYC Admin Dashboard
 * Review and manage KYC submissions
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { GuidanceDisclosure } from '@/components/guidance/GuidanceDisclosure';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  Image as ImageIcon,
  AlertTriangle,
  Loader2,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';

interface KYCSubmission {
  id: string;
  user_id: string;
  user_email: string;
  status: 'pending_review' | 'in_review' | 'additional_info_needed' | 'approved' | 'rejected';
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  country_of_residence: string;
  id_document_type: string;
  id_document_front_url: string;
  id_document_back_url?: string;
  selfie_url?: string;
  proof_of_address_url?: string;
  occupation?: string;
  source_of_funds?: string;
  submitted_at: string;
  days_waiting: number;
  reviewer_id?: string;
  review_notes?: string;
  rejection_reason?: string;
  rejection_category?: string;
  assigned_level?: string;
}

interface Stats {
  pending_review: number;
  in_review: number;
  approved_today: number;
  rejected_today: number;
  total_verified: number;
}

export function KYCAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, formatDate } = useI18n();

  const statusLabel = (status: string) => {
    const keys: Record<string, TranslationKey> = {
      pending_review: 'kycAdmin.statusPending',
      in_review: 'kycAdmin.statusInReview',
      additional_info_needed: 'kycAdmin.statusMoreInfo',
      approved: 'kycAdmin.statusApproved',
      rejected: 'kycAdmin.statusRejected',
    };
    return keys[status] ? t(keys[status]) : status.replace('_', ' ');
  };
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionCategory, setRejectionCategory] = useState('other');
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user) {
      fetchSubmissions();
      fetchStats();
    }
  }, [user, activeTab]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const status = activeTab === 'pending' ? 'pending_review' : 
                     activeTab === 'in_review' ? 'in_review' : 
                     activeTab === 'approved' ? 'approved' : 'rejected';
      
      const response = await fetch(`/api/pieces/admin/kyc/pending?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } else {
        throw new Error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      toast({
        title: t('kycAdmin.errTitle'),
        description: t('kycAdmin.loadFail'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Stats endpoint would return counts
      setStats({
        pending_review: 0,
        in_review: 0,
        approved_today: 0,
        rejected_today: 0,
        total_verified: 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`/api/pieces/admin/kyc/${selectedSubmission.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          level: selectedLevel,
          notes: reviewNotes,
        }),
      });
      
      if (response.ok) {
        toast({
          title: t('kycAdmin.approvedTitle'),
          description: t('kycAdmin.approvedDesc', { name: `${selectedSubmission.first_name} ${selectedSubmission.last_name}` }),
        });
        setIsDetailModalOpen(false);
        fetchSubmissions();
        fetchStats();
      } else {
        throw new Error('Failed to approve');
      }
    } catch (error) {
      toast({
        title: t('kycAdmin.errTitle'),
        description: t('kycAdmin.approveFail'),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !rejectionReason) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`/api/pieces/admin/kyc/${selectedSubmission.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          reason: rejectionReason,
          category: rejectionCategory,
        }),
      });
      
      if (response.ok) {
        toast({
          title: t('kycAdmin.rejectedTitle'),
          description: t('kycAdmin.rejectedDesc', { name: `${selectedSubmission.first_name} ${selectedSubmission.last_name}` }),
        });
        setIsDetailModalOpen(false);
        fetchSubmissions();
        fetchStats();
      } else {
        throw new Error('Failed to reject');
      }
    } catch (error) {
      toast({
        title: t('kycAdmin.errTitle'),
        description: t('kycAdmin.rejectFail'),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const openDetailModal = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setReviewNotes(submission.review_notes || '');
    setRejectionReason(submission.rejection_reason || '');
    setRejectionCategory(submission.rejection_category || 'other');
    setSelectedLevel(submission.assigned_level || 'intermediate');
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending_review: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      additional_info_needed: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review': return <Clock className="h-4 w-4" />;
      case 'in_review': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 text-foreground sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold">{t('kycAdmin.title')}</h1>
            <GuidanceDisclosure
              id="kyc-admin:review-queue"
              eyebrow={t('kycAdmin.guideEyebrow')}
              title={t('kycAdmin.guideTitle')}
              summary={t('kycAdmin.guideSummary')}
              className="mt-3"
              tone="light"
            >
              <p className="text-sm text-muted-foreground">{t('kycAdmin.guideBody')}</p>
            </GuidanceDisclosure>
          </div>
          <Button onClick={() => { fetchSubmissions(); fetchStats(); }}>
            {t('kycAdmin.refresh')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('kycAdmin.statPending')}</div>
              <div className="text-2xl font-bold text-yellow-600">{stats?.pending_review || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('kycAdmin.statInReview')}</div>
              <div className="text-2xl font-bold text-blue-600">{stats?.in_review || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('kycAdmin.statApprovedToday')}</div>
              <div className="text-2xl font-bold text-green-600">{stats?.approved_today || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('kycAdmin.statRejectedToday')}</div>
              <div className="text-2xl font-bold text-red-600">{stats?.rejected_today || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('kycAdmin.statVerified')}</div>
              <div className="text-2xl font-bold">{stats?.total_verified || 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submissions List */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">{t('kycAdmin.tabPending')}</TabsTrigger>
            <TabsTrigger value="in_review">{t('kycAdmin.tabInReview')}</TabsTrigger>
            <TabsTrigger value="approved">{t('kycAdmin.tabApproved')}</TabsTrigger>
            <TabsTrigger value="rejected">{t('kycAdmin.tabRejected')}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : submissions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('kycAdmin.empty')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {submission.first_name} {submission.last_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{submission.user_email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusBadge(submission.status)}>
                                {getStatusIcon(submission.status)}
                                <span className="ml-1">{statusLabel(submission.status)}</span>
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {t('kycAdmin.submitted', { date: formatDate(submission.submitted_at) })}
                              </span>
                              {submission.days_waiting > 0 && (
                                <span className="text-xs text-yellow-600">
                                  {t('kycAdmin.waiting', { count: submission.days_waiting })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openDetailModal(submission)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t('kycAdmin.review')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('kycAdmin.reviewTitle', { name: `${selectedSubmission?.first_name ?? ''} ${selectedSubmission?.last_name ?? ''}`.trim() })}
            </DialogTitle>
            <GuidanceDisclosure
              id="kyc-admin:submission-decision"
              eyebrow={t('kycAdmin.decisionEyebrow')}
              title={t('kycAdmin.decisionTitle')}
              summary={t('kycAdmin.decisionSummary')}
              className="mt-3"
              tone="light"
            >
              <p className="text-sm text-muted-foreground">
                {t('kycAdmin.decisionBody')}
              </p>
            </GuidanceDisclosure>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6 py-4">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('kycAdmin.fullName')}</label>
                  <p>{selectedSubmission.first_name} {selectedSubmission.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('kycAdmin.email')}</label>
                  <p>{selectedSubmission.user_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('kycAdmin.dob')}</label>
                  <p>{selectedSubmission.date_of_birth}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('kycAdmin.nationality')}</label>
                  <p>{selectedSubmission.nationality}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('kycAdmin.residence')}</label>
                  <p>{selectedSubmission.country_of_residence}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('kycAdmin.occupation')}</label>
                  <p>{selectedSubmission.occupation || t('kycAdmin.notProvided')}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h4 className="font-semibold">{t('kycAdmin.documents')}</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {selectedSubmission.id_document_front_url && (
                    <div>
                      <label className="text-sm font-medium">{t('kycAdmin.idFront')}</label>
                      <div className="mt-1 border rounded-lg overflow-hidden">
                        <img 
                          src={selectedSubmission.id_document_front_url} 
                          alt={t('kycAdmin.idFront')}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.id_document_back_url && (
                    <div>
                      <label className="text-sm font-medium">{t('kycAdmin.idBack')}</label>
                      <div className="mt-1 border rounded-lg overflow-hidden">
                        <img 
                          src={selectedSubmission.id_document_back_url} 
                          alt={t('kycAdmin.idBack')}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.selfie_url && (
                    <div>
                      <label className="text-sm font-medium">{t('kycAdmin.selfie')}</label>
                      <div className="mt-1 border rounded-lg overflow-hidden">
                        <img 
                          src={selectedSubmission.selfie_url} 
                          alt={t('kycAdmin.selfie')}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.proof_of_address_url && (
                    <div>
                      <label className="text-sm font-medium">{t('kycAdmin.address')}</label>
                      <div className="mt-1 border rounded-lg overflow-hidden">
                        <img 
                          src={selectedSubmission.proof_of_address_url} 
                          alt={t('kycAdmin.address')}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Level */}
              {selectedSubmission.status !== 'approved' && selectedSubmission.status !== 'rejected' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('kycAdmin.level')}</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    <option value="basic">{t('kycAdmin.levelBasic')}</option>
                    <option value="intermediate">{t('kycAdmin.levelMid')}</option>
                    <option value="advanced">{t('kycAdmin.levelAdv')}</option>
                  </select>
                </div>
              )}

              {/* Review Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('kycAdmin.notes')}</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={t('kycAdmin.notesPh')}
                  rows={3}
                />
              </div>

              {/* Rejection Reason (if rejecting) */}
              {selectedSubmission.status !== 'approved' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('kycAdmin.rejectReason')}</label>
                  <select 
                    className="w-full p-2 border rounded mb-2"
                    value={rejectionCategory}
                    onChange={(e) => setRejectionCategory(e.target.value)}
                  >
                    <option value="document_unclear">{t('kycAdmin.reasonUnclear')}</option>
                    <option value="document_expired">{t('kycAdmin.reasonExpired')}</option>
                    <option value="identity_mismatch">{t('kycAdmin.reasonMismatch')}</option>
                    <option value="underage">{t('kycAdmin.reasonUnderage')}</option>
                    <option value="sanctions">{t('kycAdmin.reasonSanctions')}</option>
                    <option value="fraud_suspected">{t('kycAdmin.reasonFraud')}</option>
                    <option value="incomplete_info">{t('kycAdmin.reasonIncomplete')}</option>
                    <option value="other">{t('kycAdmin.reasonOther')}</option>
                  </select>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={t('kycAdmin.rejectPh')}
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              {t('kycAdmin.cancel')}
            </Button>
            
            {selectedSubmission?.status !== 'approved' && selectedSubmission?.status !== 'rejected' && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={processing || !rejectionReason}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                  {t('kycAdmin.reject')}
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  {t('kycAdmin.approve')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default KYCAdminDashboard;
