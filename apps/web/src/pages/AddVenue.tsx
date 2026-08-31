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
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const venueCategories: { value: string; label: TranslationKey }[] = [
  { value: "general", label: "addVenue.catGeneral" },
  { value: "restaurant", label: "addVenue.catRestaurant" },
  { value: "cafe", label: "addVenue.catCafe" },
  { value: "bar", label: "addVenue.catBar" },
  { value: "gallery", label: "addVenue.catGallery" },
  { value: "studio", label: "addVenue.catStudio" },
  { value: "outdoor", label: "addVenue.catOutdoor" },
  { value: "coworking", label: "addVenue.catCoworking" },
  { value: "gym", label: "addVenue.catGym" },
  { value: "theater", label: "addVenue.catTheater" },
];

const AddVenue = () => {
  const { t } = useI18n();
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const createVenue = useCreateVenue();
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();

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

    toast({
      title: t("addVenue.toastTitle"),
      description: t("addVenue.toastDesc"),
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
          {t("addVenue.back")}
        </Button>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {t("addVenue.title")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("addVenue.lede")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Venue Image */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <Label className="mb-3 block">{t("addVenue.photo")}</Label>
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
            <h2 className="font-serif text-xl font-semibold">{t("addVenue.details")}</h2>
          </div>

          <div>
            <Label htmlFor="name">{t("addVenue.name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("addVenue.namePlaceholder")}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">{t("addVenue.address")}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t("addVenue.addressPlaceholder")}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">{t("addVenue.category")}</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("addVenue.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {venueCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {t(cat.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">{t("addVenue.description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t("addVenue.descPlaceholder")}
              rows={3}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <h2 className="font-serif text-xl font-semibold">{t("addVenue.contact")}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">{t("addVenue.phone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="website">{t("addVenue.website")}</Label>
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
            {t("addVenue.cancel")}
          </Button>
          <Button
            type="submit"
            variant="hero"
            className="flex-1"
            disabled={createVenue.isPending || uploading || !formData.name || !formData.address}
          >
            {createVenue.isPending || uploading ? t("addVenue.saving") : t("addVenue.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddVenue;
