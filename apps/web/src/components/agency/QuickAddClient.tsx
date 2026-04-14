import { useState } from "react";
import { Building2, Plus, ArrowRight, Loader2, Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface QuickAddClientProps {
  onSuccess?: (clientId: string) => void;
  trigger?: React.ReactNode;
}

export function QuickAddClient({ onSuccess, trigger }: QuickAddClientProps) {
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setLoading(true);
    
    // Simulate API delay for creating a client workspace
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      setClientName("");
      toast({
        title: "Client Workspace Ready! 🚀",
        description: `${clientName} has been initialized. You can now toggle to this workspace.`,
      });
      if (onSuccess) onSuccess("new-client-id");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/50 bg-primary/5">
            <Plus className="w-4 h-4" />
            Add Agency Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border overflow-hidden p-0">
        <div className="bg-charcoal text-cream p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -mr-16 -mt-16" />
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-xl backdrop-blur-sm">
                <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold italic">Initialize Client</h2>
            <p className="text-white/50 text-xs mt-1">Spin up a dedicated workspace for a new brand.</p>
        </div>
        
        <form onSubmit={handleCreate} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Brand Name</Label>
            <Input 
              id="clientName"
              placeholder="e.g. Acme Corp"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="h-12 text-lg font-medium"
              autoFocus
            />
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
             <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Link2 className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[10px] font-bold uppercase tracking-tighter text-primary">Workspace Domain</p>
                <p className="text-sm font-medium text-foreground">
                    {clientName ? clientName.toLowerCase().replace(/\s+/g, '-') : 'brand'}.promorang.co
                </p>
             </div>
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            className="w-full h-14 font-black tracking-tight text-lg shadow-xl"
            disabled={loading || !clientName.trim()}
          >
            {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
                <span className="flex items-center gap-2">
                    Create Workspace
                    <ArrowRight className="w-5 h-5" />
                </span>
            )}
          </Button>

          <div className="text-center">
             <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase py-1 px-3 border border-border rounded-full bg-muted/30">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                Agency Pro Feature
             </span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
