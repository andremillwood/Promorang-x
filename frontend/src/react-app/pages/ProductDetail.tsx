import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Store, Heart, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

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
      const response = await fetch(`/api/marketplace/products/${productId}`, {
        credentials: 'include',
      });
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
      const response = await fetch(`/api/marketplace/products/${productId}/reviews`, {
        credentials: 'include',
      });
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
      const response = await fetch('/api/marketplace/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  const formatPrice = () => {
    if (!product) return '';
    const prices = [];
    if (product.price_usd) prices.push(`$${product.price_usd.toFixed(2)}`);
    if (product.price_gems) prices.push(`${product.price_gems} 💎`);
    if (product.price_gold) prices.push(`${product.price_gold} 🪙`);
    return prices.join(' or ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <div>
            <div className="relative pb-[100%] bg-white rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative pb-[100%] rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-blue-600' : ''
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
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.short_description}</p>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= product.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating.toFixed(1)} ({product.review_count} reviews)
              </span>
              <span className="text-sm text-gray-600">•</span>
              <span className="text-sm text-gray-600">{product.sales_count} sold</span>
            </div>

            {/* Store */}
            <div
              className="flex items-center gap-3 p-4 bg-white rounded-lg mb-6 cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/marketplace/store/${product.merchant_stores.store_slug}`)}
            >
              <img
                src={product.merchant_stores.logo_url || 'https://via.placeholder.com/48'}
                alt={product.merchant_stores.store_name}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-900">{product.merchant_stores.store_name}</p>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                  <span className="text-sm text-gray-600">{product.merchant_stores.rating.toFixed(1)}</span>
                </div>
              </div>
              <Store className="ml-auto h-5 w-5 text-gray-400" />
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatPrice()}
              </div>
              {!inStock && (
                <p className="text-red-600 font-medium">Out of Stock</p>
              )}
              {inStock && !product.is_unlimited && (
                <p className="text-sm text-gray-600">
                  {product.inventory_count} available
                </p>
              )}
            </div>

            {/* Quantity */}
            {inStock && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
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
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
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
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.review_count})</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={review.users.profile_image || 'https://via.placeholder.com/48'}
                        alt={review.users.display_name}
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.users.display_name || review.users.username}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
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
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                        )}
                        <p className="text-gray-700">{review.review_text}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
