import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '../utils/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductForm() {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    category_id: '',
    price_usd: '',
    price_gems: '',
    price_gold: '',
    inventory_count: '',
    is_digital: false,
    tags: [] as string[],
    images: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    fetchCategories();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const response = await apiFetch('/api/marketplace/categories');
      const data = await response.json();
      if (data.status === 'success') {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await apiFetch(`/api/marketplace/products/${productId}`);
      const data = await response.json();
      if (data.status === 'success') {
        const product = data.data.product;
        setFormData({
          name: product.name,
          short_description: product.short_description || '',
          description: product.description || '',
          category_id: product.category_id || '',
          price_usd: product.price_usd?.toString() || '',
          price_gems: product.price_gems?.toString() || '',
          price_gold: product.price_gold?.toString() || '',
          inventory_count: product.inventory_count?.toString() || '',
          is_digital: product.is_digital,
          tags: product.tags || [],
          images: product.images || [],
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price_usd: formData.price_usd ? parseFloat(formData.price_usd) : null,
        price_gems: formData.price_gems ? parseInt(formData.price_gems) : null,
        price_gold: formData.price_gold ? parseInt(formData.price_gold) : null,
        inventory_count: formData.inventory_count ? parseInt(formData.inventory_count) : 0,
      };

      const url = productId
        ? `/api/marketplace/products/${productId}`
        : '/api/marketplace/products';

      const method = productId ? 'PATCH' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast({
          title: 'Success!',
          description: productId ? 'Product updated' : 'Product created',
          type: 'success',
        });
        navigate('/merchant/dashboard');
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        type: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const addImage = () => {
    if (newImage && !formData.images.includes(newImage)) {
      setFormData({ ...formData, images: [...formData.images, newImage] });
      setNewImage('');
    }
  };

  const removeImage = (image: string) => {
    setFormData({ ...formData, images: formData.images.filter(i => i !== image) });
  };

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold text-pr-text-1 mb-8">
          {productId ? 'Edit Product' : 'Add New Product'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-pr-text-1 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description for product cards"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Full Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Detailed product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-pr-text-1 mb-4">Pricing</h2>
            <p className="text-sm text-pr-text-2 mb-4">Set at least one price option</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price_usd}
                  onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                  className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="29.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Price (Gems) 💎
                </label>
                <input
                  type="number"
                  value={formData.price_gems}
                  onChange={(e) => setFormData({ ...formData, price_gems: e.target.value })}
                  className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="2999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Price (Gold) 🪙
                </label>
                <input
                  type="number"
                  value={formData.price_gold}
                  onChange={(e) => setFormData({ ...formData, price_gold: e.target.value })}
                  className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="299"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-pr-text-1 mb-4">Inventory</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_digital}
                  onChange={(e) => setFormData({ ...formData, is_digital: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-pr-text-1">
                  Digital Product (unlimited stock)
                </label>
              </div>

              {!formData.is_digital && (
                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-2">
                    Inventory Count
                  </label>
                  <input
                    type="number"
                    value={formData.inventory_count}
                    onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value })}
                    className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-pr-text-1 mb-4">Images</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                <Button type="button" onClick={addImage}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-pr-text-1 mb-4">Tags</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag"
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {loading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
