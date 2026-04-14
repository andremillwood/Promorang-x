import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateVenue } from "@/hooks/useVenues";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MapPin } from "lucide-react";

const venueCategories = [
  { value: "general", label: "General" },
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "bar", label: "Bar" },
  { value: "gallery", label: "Gallery" },
  { value: "studio", label: "Studio" },
  { value: "outdoor", label: "Outdoor Space" },
  { value: "coworking", label: "Coworking Space" },
  { value: "gym", label: "Gym / Fitness" },
  { value: "theater", label: "Theater / Venue" },
];

const AddVenue = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const createVenue = useCreateVenue();
  const { uploadImage, uploading } = useImageUpload();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    category: "general",
    phone: "",
    website: "",
    imageUrl: "",
  });

  const primaryRole = roles[0] || "merchant";

  const handleImageSelect = (file: File) => {
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let imageUrl = formData.imageUrl;

    // Upload image if selected
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile, "moment-images", user.id);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    await createVenue.mutateAsync({
      name: formData.name,
      address: formData.address,
      description: formData.description || null,
      category: formData.category,
      phone: formData.phone || null,
      website: formData.website || null,
      image_url: imageUrl || null,
    });

    navigate("/dashboard");
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
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Add New Venue
        </h1>
        <p className="text-muted-foreground mt-2">
          Register your venue to host moments
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Venue Image */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <Label className="mb-3 block">Venue Photo</Label>
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url || "" })}
            onFileSelect={handleImageSelect}
            uploading={uploading}
            aspectRatio="video"
          />
        </div>

        {/* Venue Details */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Venue Details</h2>
          </div>

          <div>
            <Label htmlFor="name">Venue Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., The Brew House"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g., 123 Main Street, City, State"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {venueCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell people about your venue..."
              rows={3}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <h2 className="font-serif text-xl font-semibold">Contact Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="hero"
            className="flex-1"
            disabled={createVenue.isPending || uploading || !formData.name || !formData.address}
          >
            {createVenue.isPending || uploading ? "Saving..." : "Add Venue"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddVenue;
