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
        title: 'Error',
        description: 'Failed to load KYC submissions',
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
          title: 'Approved',
          description: `KYC approved for ${selectedSubmission.first_name} ${selectedSubmission.last_name}`,
        });
        setIsDetailModalOpen(false);
        fetchSubmissions();
        fetchStats();
      } else {
        throw new Error('Failed to approve');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve KYC',
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
          title: 'Rejected',
          description: `KYC rejected for ${selectedSubmission.first_name} ${selectedSubmission.last_name}`,
        });
        setIsDetailModalOpen(false);
        fetchSubmissions();
        fetchStats();
      } else {
        throw new Error('Failed to reject');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject KYC',
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
            <h1 className="text-3xl font-bold">KYC Review Dashboard</h1>
            <GuidanceDisclosure
              id="kyc-admin:review-queue"
              eyebrow="Review guide"
              title="How to work the identity queue"
              summary="Review submitted documents, assign the appropriate level, and record clear notes for approval or rejection."
              className="mt-3"
              tone="light"
            >
              <p className="text-sm text-muted-foreground">Review user identity verifications.</p>
            </GuidanceDisclosure>
          </div>
          <Button onClick={() => { fetchSubmissions(); fetchStats(); }}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Pending Review</div>
              <div className="text-2xl font-bold text-yellow-600">{stats?.pending_review || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">In Review</div>
              <div className="text-2xl font-bold text-blue-600">{stats?.in_review || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Approved Today</div>
              <div className="text-2xl font-bold text-green-600">{stats?.approved_today || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Rejected Today</div>
              <div className="text-2xl font-bold text-red-600">{stats?.rejected_today || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Verified</div>
              <div className="text-2xl font-bold">{stats?.total_verified || 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submissions List */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_review">In Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
                  <p className="text-muted-foreground">No submissions in this category</p>
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
                                <span className="ml-1">{submission.status.replace('_', ' ')}</span>
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                              </span>
                              {submission.days_waiting > 0 && (
                                <span className="text-xs text-yellow-600">
                                  ({submission.days_waiting} days waiting)
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
                            Review
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
              Review KYC: {selectedSubmission?.first_name} {selectedSubmission?.last_name}
            </DialogTitle>
            <GuidanceDisclosure
              id="kyc-admin:submission-decision"
              eyebrow="Decision guide"
              title="What to check before deciding"
              summary="Compare identity fields, documents, selfie, address proof, level, and notes before approving or rejecting."
              className="mt-3"
              tone="light"
            >
              <p className="text-sm text-muted-foreground">
                Confirm the user details match the uploaded documents before assigning a level or rejection reason.
              </p>
            </GuidanceDisclosure>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6 py-4">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p>{selectedSubmission.first_name} {selectedSubmission.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p>{selectedSubmission.user_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date of Birth</label>
                  <p>{selectedSubmission.date_of_birth}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nationality</label>
                  <p>{selectedSubmission.nationality}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Country of Residence</label>
                  <p>{selectedSubmission.country_of_residence}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Occupation</label>
                  <p>{selectedSubmission.occupation || 'Not provided'}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h4 className="font-semibold">Documents</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {selectedSubmission.id_document_front_url && (
                    <div>
                      <label className="text-sm font-medium">ID Front</label>
                      <div className="mt-1 border rounded-lg overflow-hidden">
                        <img 
                          src={selectedSubmission.id_document_front_url} 
                          alt="ID Front"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.id_document_back_url && (
                    <div>
                      <label className="text-sm font-medium">ID Back</label>
                      <div className="mt-1 border rounded-lg overflow-hidden">
                        <img 
                          src={selectedSubmission.id_document_back_url} 
                          alt="ID Back"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.selfie_url && (
                    <div>
                      <label className="text-sm font-medium">Selfie</label>
                      <div className="mt-1 border rounded-lg overflow-hidden">
                        <img 
                          src={selectedSubmission.selfie_url} 
                          alt="Selfie"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.proof_of_address_url && (
                    <div>
                      <label className="text-sm font-medium">Proof of Address</label>
                      <div className="mt-1 border rounded-lg overflow-hidden">
                        <img 
                          src={selectedSubmission.proof_of_address_url} 
                          alt="Proof of Address"
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
                  <label className="text-sm font-medium">Approval Level</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    <option value="basic">Basic ($500/day limit)</option>
                    <option value="intermediate">Intermediate ($10K/day limit)</option>
                    <option value="advanced">Advanced ($100K/day limit)</option>
                  </select>
                </div>
              )}

              {/* Review Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this verification..."
                  rows={3}
                />
              </div>

              {/* Rejection Reason (if rejecting) */}
              {selectedSubmission.status !== 'approved' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                  <select 
                    className="w-full p-2 border rounded mb-2"
                    value={rejectionCategory}
                    onChange={(e) => setRejectionCategory(e.target.value)}
                  >
                    <option value="document_unclear">Document unclear/blurry</option>
                    <option value="document_expired">Document expired</option>
                    <option value="identity_mismatch">Identity mismatch</option>
                    <option value="underage">User under 18</option>
                    <option value="sanctions">Sanctions list match</option>
                    <option value="fraud_suspected">Fraud suspected</option>
                    <option value="incomplete_info">Incomplete information</option>
                    <option value="other">Other</option>
                  </select>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this is being rejected..."
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Cancel
            </Button>
            
            {selectedSubmission?.status !== 'approved' && selectedSubmission?.status !== 'rejected' && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={processing || !rejectionReason}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                  Reject
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  Approve
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
