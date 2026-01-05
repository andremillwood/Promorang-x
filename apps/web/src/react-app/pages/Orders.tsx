import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_usd: number;
  total_gems: number;
  total_gold: number;
  created_at: string;
  merchant_stores: {
    store_name: string;
    store_slug: string;
  };
  order_items: Array<{
    product_name: string;
    product_image: string;
    quantity: number;
  }>;
}

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
  paid: { label: 'Paid', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-600 bg-blue-100' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600 bg-purple-100' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-100' },
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/marketplace/orders', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (order: Order) => {
    const prices = [];
    if (order.total_usd > 0) prices.push(`$${order.total_usd.toFixed(2)}`);
    if (order.total_gems > 0) prices.push(`${order.total_gems} 💎`);
    if (order.total_gold > 0) prices.push(`${order.total_gold} 🪙`);
    return prices.join(' + ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-dynamic">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pr-text-1">Order History</h1>
          <p className="text-pr-text-2 mt-1">View and track your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-pr-text-1 mb-2">No orders yet</h3>
            <p className="text-pr-text-2 mb-6">Start shopping to see your orders here</p>
            <Button onClick={() => navigate('/marketplace')} className="bg-blue-600 hover:bg-blue-700">
              Browse Marketplace
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Package;
              const statusStyle = statusConfig[order.status as keyof typeof statusConfig]?.color || 'text-pr-text-2 bg-pr-surface-2';
              const statusLabel = statusConfig[order.status as keyof typeof statusConfig]?.label || order.status;

              return (
                <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-pr-text-1">
                        Order #{order.order_number}
                      </h3>
                      <p className="text-sm text-pr-text-2">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-pr-text-2 mt-1">
                        From: {order.merchant_stores.store_name}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle}`}>
                      <StatusIcon className="h-4 w-4 mr-1" />
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex gap-4 mb-4">
                    {order.order_items.slice(0, 3).map((item, index) => (
                      <img
                        key={index}
                        src={item.product_image || 'https://via.placeholder.com/80'}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                    {order.order_items.length > 3 && (
                      <div className="w-20 h-20 bg-pr-surface-2 rounded-lg flex items-center justify-center">
                        <span className="text-pr-text-2 font-medium">
                          +{order.order_items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-pr-text-2">Total</p>
                      <p className="font-semibold text-lg text-pr-text-1">
                        {formatPrice(order)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
