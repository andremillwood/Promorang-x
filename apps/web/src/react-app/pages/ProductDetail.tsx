import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Store, Heart, Share2, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '../utils/api';

interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price_usd: number | null;
  price_gems: number | null;
  price_gold: number | null;
  images: string[];
  rating: number;
  review_count: number;
  sales_count: number;
  inventory_count: number;
  is_digital: boolean;
  is_unlimited: boolean;
  tags: string[];
  merchant_stores: {
    id: string;
    store_name: string;
    store_slug: string;
    logo_url: string;
    rating: number;
  };
}

interface Review {
  id: string;
  rating: number;
  title: string;
  review_text: string;
  is_verified_purchase: boolean;
  created_at: string;
  users: {
    username: string;
    display_name: string;
    profile_image: string;
  };
}

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviews();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await apiFetch(`/api/marketplace/products/${productId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setProduct(data.data.product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiFetch(`/api/marketplace/products/${productId}/reviews`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setReviews(data.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const addToCart = async () => {
    try {
      const response = await apiFetch('/api/marketplace/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast({
          title: 'Added to cart',
          description: `${quantity} item(s) added to your cart`,
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add to cart',
        type: 'destructive',
      });
    }
  };

  const formattedPrice = useMemo(() => {
    if (!product) return '';
    const prices: string[] = [];

    if (product.price_usd != null) {
      const usd = Number(product.price_usd);
      prices.push(`$${usd.toFixed(2)}`);
    }

    if (product.price_gems != null) {
      const gems = Number(product.price_gems);
      prices.push(`${gems} 💎`);
    }

    if (product.price_gold != null) {
      const gold = Number(product.price_gold);
      prices.push(`${gold} 🪙`);
    }

    return prices.join(' or ');
  }, [product?.price_usd, product?.price_gems, product?.price_gold]);

  const averageRating = useMemo(() => {
    if (!product || product.rating == null) return 0;
    const ratingNumber = Number(product.rating);
    if (Number.isNaN(ratingNumber)) return 0;
    return Number(ratingNumber.toFixed(1));
  }, [product?.rating]);

  const merchantRating = useMemo(() => {
    const rating = product?.merchant_stores?.rating;
    if (rating == null) return null;
    const ratingNumber = Number(rating);
    if (Number.isNaN(ratingNumber)) return null;
    return Number(ratingNumber.toFixed(1));
  }, [product?.merchant_stores?.rating]);

  const totalReviews = useMemo(() => product?.review_count ?? 0, [product?.review_count]);

  if (loading) {
    return (
      <div className="min-h-screen-dynamic bg-pr-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="h-10 w-32 bg-pr-surface-3 rounded-lg animate-pulse" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative pb-[100%] bg-pr-surface-card rounded-xl border border-pr-surface-3 animate-pulse" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`thumb-skeleton-${index}`} className="relative pb-[100%] bg-pr-surface-3 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-8 bg-pr-surface-3 rounded-lg w-3/4 animate-pulse" />
              <div className="h-4 bg-pr-surface-3 rounded-lg w-full animate-pulse" />
              <div className="h-4 bg-pr-surface-3 rounded-lg w-2/3 animate-pulse" />
              <div className="h-20 bg-pr-surface-card rounded-xl border border-pr-surface-3 animate-pulse" />
              <div className="h-10 bg-pr-surface-3 rounded-lg w-40 animate-pulse" />
              <div className="h-12 bg-pr-surface-3 rounded-lg w-48 animate-pulse" />
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`action-skeleton-${index}`} className="h-11 bg-pr-surface-3 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-10 w-60 bg-pr-surface-3 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`tab-skeleton-${index}`} className="h-40 bg-pr-surface-card rounded-xl border border-pr-surface-3 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-pr-text-1">Product not found</h2>
          <Button onClick={() => navigate('/marketplace')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const inStock = product.is_unlimited || product.inventory_count > 0;

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-8">
        {/* Back Button */}
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <div>
            <div className="relative pb-[100%] bg-pr-surface-card rounded-lg overflow-hidden mb-4 shadow-sm">
              <img
                src={product.images[selectedImage] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="hidden md:grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative pb-[100%] rounded-lg overflow-hidden border transition-shadow ${
                      selectedImage === index ? 'border-blue-600 shadow-sm' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {product.images.length > 1 && (
              <div className="md:hidden flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {product.images.map((image, index) => (
                  <button
                    key={`mobile-thumb-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border transition-transform ${
                      selectedImage === index ? 'border-blue-600 scale-105' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-pr-text-1 mb-2">{product.name}</h1>
            <p className="text-pr-text-2 mb-4">{product.short_description}</p>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-pr-text-2">
                {averageRating.toFixed(1)} ({product.review_count ?? 0} reviews)
              </span>
              <span className="text-sm text-pr-text-2">•</span>
              <span className="text-sm text-pr-text-2">{product.sales_count} sold</span>
            </div>

            {/* Store */}
            <div
              className="flex items-center gap-3 p-4 bg-pr-surface-card rounded-lg mb-6 cursor-pointer hover:bg-pr-surface-2"
              onClick={() => navigate(`/marketplace/store/${product.merchant_stores.store_slug}`)}
            >
              <img
                src={product.merchant_stores.logo_url || 'https://via.placeholder.com/48'}
                alt={product.merchant_stores.store_name}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-semibold text-pr-text-1">{product.merchant_stores.store_name}</p>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                  <span className="text-sm text-pr-text-2">
                    {merchantRating != null ? merchantRating.toFixed(1) : 'New'}
                  </span>
                </div>
              </div>
              <Store className="ml-auto h-5 w-5 text-gray-400" />
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-pr-text-1 mb-2">
                {formattedPrice}
              </div>
              {!inStock && (
                <p className="text-red-600 font-medium">Out of Stock</p>
              )}
              {inStock && !product.is_unlimited && (
                <p className="text-sm text-pr-text-2">
                  {product.inventory_count} available
                </p>
              )}
            </div>

            {/* Quantity */}
            {inStock && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border border-pr-surface-3 rounded-lg hover:bg-pr-surface-2"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 border border-pr-surface-3 rounded-lg hover:bg-pr-surface-2"
                    disabled={!product.is_unlimited && quantity >= product.inventory_count}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={addToCart}
                disabled={!inStock}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pr-surface-2 text-pr-text-1 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-8">
          <TabsList className="flex-wrap">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.review_count})</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card className="p-6">
              <div className="prose max-w-none">
                <p className="text-pr-text-1 whitespace-pre-wrap">{product.description}</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              <Card className="p-6 bg-blue-50/40 border-blue-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Customer satisfaction</p>
                    <div className="flex items-end gap-3 mt-2">
                      <span className="text-4xl font-bold text-blue-900">{averageRating.toFixed(1)}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={`avg-star-${star}`}
                            className={`h-5 w-5 ${
                              star <= Math.round(averageRating)
                                ? 'text-blue-500 fill-current'
                                : 'text-blue-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">Based on {totalReviews} review{totalReviews === 1 ? '' : 's'}</p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: '5 stars', percentage: Math.round((reviews.filter(r => r.rating === 5).length / Math.max(totalReviews, 1)) * 100) },
                      { label: '4 stars', percentage: Math.round((reviews.filter(r => r.rating === 4).length / Math.max(totalReviews, 1)) * 100) },
                      { label: '3 stars', percentage: Math.round((reviews.filter(r => r.rating === 3).length / Math.max(totalReviews, 1)) * 100) },
                      { label: '2 stars & below', percentage: Math.round((reviews.filter(r => r.rating <= 2).length / Math.max(totalReviews, 1)) * 100) }
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm text-blue-900">
                          <span>{item.label}</span>
                          <span>{Number.isNaN(item.percentage) ? 0 : item.percentage}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-blue-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${Number.isNaN(item.percentage) ? 0 : item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {reviews.length === 0 ? (
                <Card className="p-6 text-center">
                  <Sparkles className="mx-auto h-10 w-10 text-blue-400" />
                  <h3 className="mt-4 text-lg font-semibold text-pr-text-1">No reviews yet</h3>
                  <p className="mt-2 text-sm text-pr-text-2">
                    Be the first to share your experience with this product and help the community.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.users.profile_image || 'https://via.placeholder.com/48'}
                          alt={review.users.display_name}
                          className="h-12 w-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <div>
                              <p className="font-semibold text-pr-text-1">
                                {review.users.display_name || review.users.username}
                              </p>
                              <div className="flex items-center flex-wrap gap-2 text-sm">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={`${review.id}-star-${star}`}
                                      className={`h-4 w-4 ${
                                        star <= review.rating
                                          ? 'text-yellow-500 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.is_verified_purchase && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    <Check className="h-3 w-3 mr-1" />
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-pr-text-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.title && (
                            <h4 className="font-semibold text-pr-text-1 mb-2">{review.title}</h4>
                          )}
                          <p className="text-pr-text-1 whitespace-pre-line">{review.review_text}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky CTA for mobile */}
      {inStock && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-pr-surface-card/95 backdrop-blur border-t border-pr-surface-3 p-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-pr-text-2">Total</p>
              <p className="text-lg font-semibold text-pr-text-1">{formattedPrice}</p>
            </div>
            <Button
              onClick={addToCart}
              disabled={!inStock}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
