import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";

const categories = [
  { value: "social", label: "Social Gathering" },
  { value: "workshop", label: "Workshop" },
  { value: "fitness", label: "Fitness & Wellness" },
  { value: "food", label: "Food & Drink" },
  { value: "music", label: "Music & Entertainment" },
  { value: "networking", label: "Networking" },
  { value: "outdoor", label: "Outdoor Adventure" },
  { value: "arts", label: "Arts & Culture" },
];

const EditMoment = () => {
  const { id } = useParams<{ id: string }>();
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadImage, uploading } = useImageUpload();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    venueName: "",
    startsAt: "",
    endsAt: "",
    maxParticipants: "",
    reward: "",
    imageUrl: "",
    isActive: true,
  });

  const primaryRole = roles[0] || "host";

  // Fetch moment data
  const { isLoading } = useQuery({
    queryKey: ["moment-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Check ownership
      if (data.host_id !== user?.id) {
        toast({
          title: "Unauthorized",
          description: "You can only edit your own moments.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return null;
      }

      setFormData({
        title: data.title,
        description: data.description || "",
        category: data.category,
        location: data.location,
        venueName: data.venue_name || "",
        startsAt: data.starts_at ? new Date(data.starts_at).toISOString().slice(0, 16) : "",
        endsAt: data.ends_at ? new Date(data.ends_at).toISOString().slice(0, 16) : "",
        maxParticipants: data.max_participants?.toString() || "",
        reward: data.reward || "",
        imageUrl: data.image_url || "",
        isActive: data.is_active,
      });

      return data;
    },
    enabled: !!id && !!user,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = formData.imageUrl;

      if (imageFile && user) {
        const uploadedUrl = await uploadImage(imageFile, "moment-images", user.id);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from("moments")
        .update({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          location: formData.location,
          venue_name: formData.venueName || null,
          starts_at: new Date(formData.startsAt).toISOString(),
          ends_at: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
          max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          reward: formData.reward || null,
          image_url: imageUrl || null,
          is_active: formData.isActive,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Moment updated! ✨",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["moment", id] });
      queryClient.invalidateQueries({ queryKey: ["hosted-moments"] });
      navigate(`/moments/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("moments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Moment deleted",
        description: "Your moment has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["hosted-moments"] });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Edit Moment
        </h1>
        <p className="text-muted-foreground mt-2">
          Update your moment details
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <Label className="mb-3 block">Cover Image</Label>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url || "" })}
              onFileSelect={setImageFile}
              uploading={uploading}
              aspectRatio="video"
            />
          </div>

          {/* Basic Info */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Basic Information</h2>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Location</h2>

            <div>
              <Label htmlFor="venueName">Venue Name</Label>
              <Input
                id="venueName"
                value={formData.venueName}
                onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="location">Address *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Date & Time</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startsAt">Start *</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endsAt">End</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Additional Details</h2>

            <div>
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <Label htmlFor="reward">Reward</Label>
              <Input
                id="reward"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                placeholder="e.g., Free coffee, 10% discount"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this moment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the moment and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete Moment"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={updateMutation.isPending || uploading}
            >
              {updateMutation.isPending || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditMoment;
