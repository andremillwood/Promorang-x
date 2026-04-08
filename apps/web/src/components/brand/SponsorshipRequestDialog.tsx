import { useState } from "react";
import { format } from "date-fns";
import { Calendar, MapPin, Users, DollarSign, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSponsorshipRequest } from "@/hooks/useSponsorships";
import { useBrandCampaigns } from "@/hooks/useCampaigns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DiscoverableMoment } from "@/hooks/useDiscoverMoments";

interface SponsorshipRequestDialogProps {
  moment: DiscoverableMoment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SponsorshipRequestDialog({
  moment,
  open,
  onOpenChange,
}: SponsorshipRequestDialogProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [requirements, setRequirements] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  const { data: campaigns } = useBrandCampaigns();
  const createSponsorship = useCreateSponsorshipRequest();

  const activeCampaigns = campaigns?.filter((c) => c.is_active) || [];

  const handleSubmit = async () => {
    if (!moment || !bidAmount) return;

    await createSponsorship.mutateAsync({
      moment_id: moment.id,
      host_id: moment.host_id,
      campaign_id: selectedCampaignId || undefined,
      bid_amount: parseFloat(bidAmount),
      message: message || undefined,
      requirements: requirements || undefined,
    });

    // Reset form
    setBidAmount("");
    setMessage("");
    setRequirements("");
    setSelectedCampaignId("");
    onOpenChange(false);
  };

  if (!moment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Sponsor This Moment</DialogTitle>
          <DialogDescription>
            Submit a sponsorship offer for "{moment.title}"
          </DialogDescription>
        </DialogHeader>

        {/* Moment Preview */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-foreground">{moment.title}</h4>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(moment.starts_at), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {moment.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {moment.participant_count || 0} joined
            </span>
          </div>
          {moment.host_profile?.full_name && (
            <p className="text-sm text-muted-foreground">
              Hosted by {moment.host_profile.full_name}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Link to Campaign (Optional) */}
          {activeCampaigns.length > 0 && (
            <div className="space-y-2">
              <Label>Link to Campaign (Optional)</Label>
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No campaign</SelectItem>
                  {activeCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Bid Amount */}
          <div className="space-y-2">
            <Label htmlFor="bid-amount">
              Sponsorship Offer <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="bid-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="100.00"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Platform fee: 15% • Host receives: ${bidAmount ? (parseFloat(bidAmount) * 0.85).toFixed(2) : "0.00"}
            </p>
          </div>

          {/* Message to Host */}
          <div className="space-y-2">
            <Label htmlFor="message">Message to Host</Label>
            <Textarea
              id="message"
              placeholder="Introduce your brand and explain why you'd like to sponsor this moment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Sponsorship Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="Any specific requirements for the sponsorship (branding, mentions, etc.)..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleSubmit}
            disabled={!bidAmount || createSponsorship.isPending}
          >
            {createSponsorship.isPending ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Offer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
