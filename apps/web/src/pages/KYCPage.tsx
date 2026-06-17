/**
 * KYC Page
 * User-facing KYC submission and status page
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { KYCSubmissionForm } from '@/components/kyc/KYCSubmissionForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Loader2,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface KYCStatus {
  user_id: string;
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
  kyc_level: string;
  can_trade: boolean;
  submission_status?: string;
  submission_id?: string;
  submitted_at?: string;
  limits?: {
    daily_deposit: { limit: number; used: number; remaining: number };
    daily_withdrawal: { limit: number; used: number; remaining: number };
    daily_trade: { limit: number; used: number; remaining: number };
    max_single_trade: number;
  };
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.promorang.co/api';

export function KYCPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStatus();
    }
  }, [user]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/pieces/kyc/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        
        // Show form if no KYC submitted
        if (data.kyc_status === 'none') {
          setShowForm(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load KYC status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitted = () => {
    setShowForm(false);
    fetchStatus();
    toast({
      title: 'KYC Submitted',
      description: 'Your documents have been submitted and are pending review.',
    });
  };

  const getStatusBadge = (kycStatus: string) => {
    switch (kycStatus) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground"><AlertTriangle className="h-3 w-3 mr-1" /> Not Submitted</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 text-foreground">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-violet-500" />
            Identity Verification
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete KYC verification to unlock trading and withdrawals
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" size="sm">
              <Link to="/marketplace">Open Marketplace</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/liquidity">Liquidity Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>
                  Your current KYC status and trading limits
                </CardDescription>
              </div>
              {status && getStatusBadge(status.kyc_status)}
            </div>
          </CardHeader>
          <CardContent>
            {status?.kyc_status === 'verified' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">You're verified and can trade!</span>
                </div>
                
                {status.limits && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Daily Deposit</div>
                      <div className="font-semibold">${status.limits.daily_deposit.limit}</div>
                      <div className="text-xs text-muted-foreground">
                        Used: ${status.limits.daily_deposit.used}
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Daily Withdrawal</div>
                      <div className="font-semibold">${status.limits.daily_withdrawal.limit}</div>
                      <div className="text-xs text-muted-foreground">
                        Used: ${status.limits.daily_withdrawal.used}
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Daily Trade</div>
                      <div className="font-semibold">${status.limits.daily_trade.limit}</div>
                      <div className="text-xs text-muted-foreground">
                        Used: ${status.limits.daily_trade.used}
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Max Single Trade</div>
                      <div className="font-semibold">${status.limits.max_single_trade}</div>
                    </div>
                  </div>
                )}

                <Button 
                  className="mt-4" 
                  onClick={() => window.location.href = '/marketplace'}
                >
                  Go to Marketplace
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ) : status?.kyc_status === 'pending' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-yellow-600">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Under Review</span>
                </div>
                <p className="text-muted-foreground">
                  Your documents have been submitted and are being reviewed. This usually takes 1-2 business days.
                </p>
                <p className="text-sm text-muted-foreground">
                  Submitted: {status.submitted_at ? new Date(status.submitted_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            ) : status?.kyc_status === 'rejected' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Verification Rejected</span>
                </div>
                <p className="text-muted-foreground">
                  Your KYC submission was rejected. Please review the feedback and submit again.
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  variant="outline"
                >
                  Resubmit KYC
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Verification Required</span>
                </div>
                <p className="text-muted-foreground">
                  Complete identity verification to unlock:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Piece trading</li>
                  <li>Gem withdrawals</li>
                  <li>Higher transaction limits</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KYC Form */}
        {showForm && status?.kyc_status !== 'verified' && (
          <KYCSubmissionForm onSubmitted={handleSubmitted} />
        )}

        {/* Submission History */}
        {status?.kyc_status !== 'none' && status?.submission_id && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submission History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Submission ID</span>
                  <span className="font-mono text-sm">{status.submission_id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{status.submitted_at ? new Date(status.submitted_at).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(status.kyc_status)}
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Verification Level</span>
                  <Badge variant="outline">{status.kyc_level || 'N/A'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default KYCPage;
