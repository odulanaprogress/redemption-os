export interface Vendor {
  id: string;
  name: string;
  description: string;
  logo: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  status: 'active' | 'pending' | 'suspended';
  category: string;
  location: string;
  deliveryRadius: number;
  averageDeliveryTime: number;
  totalSales: number;
  joinedDate: string;
  contactEmail: string;
  contactPhone: string;
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  inStock: boolean;
  deliveryETA: string;
  featured: boolean;
  trending: boolean;
  rating: number;
  reviews: number;
  tags: string[];
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  vendorId: string;
  vendorName: string;
  userId: string;
  userName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  deliveryETA: string;
  orderDate: string;
  deliveryCoordinates?: { lat: number; lng: number };
  driverName?: string;
  driverPhone?: string;
  trackingUpdates: TrackingUpdate[];
}

export interface TrackingUpdate {
  timestamp: string;
  status: string;
  message: string;
  location?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  trending: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

// Mock data
export const mockVendors: Vendor[] = [
  {
    id: 'v1',
    name: 'Grace Bookstore',
    description: 'Premium religious books and materials',
    logo: '📚',
    verified: true,
    rating: 4.8,
    totalReviews: 245,
    status: 'active',
    category: 'Books',
    location: 'Main Campus',
    deliveryRadius: 5,
    averageDeliveryTime: 15,
    totalSales: 1250,
    joinedDate: '2024-01-15',
    contactEmail: 'grace@redemptionos.com',
    contactPhone: '+1-555-0101'
  },
  {
    id: 'v2',
    name: 'Heavenly Bites Café',
    description: 'Fresh meals and beverages',
    logo: '☕',
    verified: true,
    rating: 4.9,
    totalReviews: 892,
    status: 'active',
    category: 'Food & Drinks',
    location: 'West Wing',
    deliveryRadius: 3,
    averageDeliveryTime: 10,
    totalSales: 3450,
    joinedDate: '2023-11-20',
    contactEmail: 'cafe@redemptionos.com',
    contactPhone: '+1-555-0102'
  },
  {
    id: 'v3',
    name: 'Blessed Apparel',
    description: 'Quality clothing and accessories',
    logo: '👔',
    verified: true,
    rating: 4.7,
    totalReviews: 156,
    status: 'active',
    category: 'Clothing',
    location: 'East Wing',
    deliveryRadius: 10,
    averageDeliveryTime: 20,
    totalSales: 890,
    joinedDate: '2024-03-01',
    contactEmail: 'apparel@redemptionos.com',
    contactPhone: '+1-555-0103'
  },
  {
    id: 'v4',
    name: 'Tech Essentials Hub',
    description: 'Electronics and tech accessories',
    logo: '💻',
    verified: true,
    rating: 4.6,
    totalReviews: 423,
    status: 'active',
    category: 'Electronics',
    location: 'North Campus',
    deliveryRadius: 8,
    averageDeliveryTime: 25,
    totalSales: 2100,
    joinedDate: '2023-12-10',
    contactEmail: 'tech@redemptionos.com',
    contactPhone: '+1-555-0104'
  },
  {
    id: 'v5',
    name: 'Faith Supplies Co',
    description: 'Event and religious materials',
    logo: '🕯️',
    verified: true,
    rating: 4.8,
    totalReviews: 201,
    status: 'active',
    category: 'Religious Materials',
    location: 'South Wing',
    deliveryRadius: 7,
    averageDeliveryTime: 18,
    totalSales: 1560,
    joinedDate: '2024-02-05',
    contactEmail: 'supplies@redemptionos.com',
    contactPhone: '+1-555-0105'
  },
  {
    id: 'v6',
    name: 'Campus Essentials',
    description: 'Daily needs and supplies',
    logo: '🛒',
    verified: true,
    rating: 4.5,
    totalReviews: 678,
    status: 'active',
    category: 'Essentials',
    location: 'Central Plaza',
    deliveryRadius: 6,
    averageDeliveryTime: 12,
    totalSales: 2890,
    joinedDate: '2023-10-15',
    contactEmail: 'essentials@redemptionos.com',
    contactPhone: '+1-555-0106'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    vendorId: 'v1',
    vendorName: 'Grace Bookstore',
    name: 'Study Bible - Premium Edition',
    description: 'Complete study Bible with commentary and cross-references',
    price: 49.99,
    image: '📖',
    category: 'Books',
    stock: 25,
    inStock: true,
    deliveryETA: '15 min',
    featured: true,
    trending: true,
    rating: 4.9,
    reviews: 89,
    tags: ['bestseller', 'study', 'reference']
  },
  {
    id: 'p2',
    vendorId: 'v2',
    vendorName: 'Heavenly Bites Café',
    name: 'Fresh Coffee & Pastry Combo',
    description: 'Premium coffee with freshly baked pastry',
    price: 8.99,
    image: '☕',
    category: 'Food & Drinks',
    stock: 50,
    inStock: true,
    deliveryETA: '8 min',
    featured: true,
    trending: true,
    rating: 4.8,
    reviews: 234,
    tags: ['fast delivery', 'breakfast', 'combo']
  },
  {
    id: 'p3',
    vendorId: 'v3',
    vendorName: 'Blessed Apparel',
    name: 'Faith Collection T-Shirt',
    description: 'Comfortable cotton t-shirt with inspirational design',
    price: 24.99,
    image: '👕',
    category: 'Clothing',
    stock: 15,
    inStock: true,
    deliveryETA: '20 min',
    featured: false,
    trending: true,
    rating: 4.7,
    reviews: 67,
    tags: ['new arrival', 'cotton', 'casual']
  },
  {
    id: 'p4',
    vendorId: 'v4',
    vendorName: 'Tech Essentials Hub',
    name: 'Wireless Earbuds Pro',
    description: 'Premium wireless earbuds with noise cancellation',
    price: 89.99,
    image: '🎧',
    category: 'Electronics',
    stock: 8,
    inStock: true,
    deliveryETA: '25 min',
    featured: true,
    trending: false,
    rating: 4.6,
    reviews: 145,
    tags: ['premium', 'audio', 'wireless']
  },
  {
    id: 'p5',
    vendorId: 'v5',
    vendorName: 'Faith Supplies Co',
    name: 'Worship Candle Set',
    description: 'Set of 12 premium worship candles',
    price: 19.99,
    image: '🕯️',
    category: 'Religious Materials',
    stock: 30,
    inStock: true,
    deliveryETA: '18 min',
    featured: false,
    trending: false,
    rating: 4.8,
    reviews: 92,
    tags: ['worship', 'set', 'essential']
  },
  {
    id: 'p6',
    vendorId: 'v1',
    vendorName: 'Grace Bookstore',
    name: 'Prayer Journal - Deluxe',
    description: 'Beautiful leather-bound prayer journal',
    price: 29.99,
    image: '📔',
    category: 'Books',
    stock: 18,
    inStock: true,
    deliveryETA: '15 min',
    featured: true,
    trending: false,
    rating: 4.9,
    reviews: 156,
    tags: ['journal', 'premium', 'leather']
  },
  {
    id: 'p7',
    vendorId: 'v2',
    vendorName: 'Heavenly Bites Café',
    name: 'Healthy Lunch Box',
    description: 'Nutritious meal with fresh ingredients',
    price: 12.99,
    image: '🥗',
    category: 'Food & Drinks',
    stock: 35,
    inStock: true,
    deliveryETA: '10 min',
    featured: false,
    trending: true,
    rating: 4.7,
    reviews: 178,
    tags: ['healthy', 'lunch', 'fresh']
  },
  {
    id: 'p8',
    vendorId: 'v6',
    vendorName: 'Campus Essentials',
    name: 'Water Bottle - Insulated',
    description: 'Premium insulated water bottle, 32oz',
    price: 19.99,
    image: '💧',
    category: 'Essentials',
    stock: 42,
    inStock: true,
    deliveryETA: '12 min',
    featured: false,
    trending: true,
    rating: 4.6,
    reviews: 201,
    tags: ['hydration', 'insulated', 'eco-friendly']
  },
  {
    id: 'p9',
    vendorId: 'v5',
    vendorName: 'Faith Supplies Co',
    name: 'Communion Wafer Set',
    description: 'Premium communion wafers, pack of 100',
    price: 15.99,
    image: '🍞',
    category: 'Religious Materials',
    stock: 20,
    inStock: true,
    deliveryETA: '18 min',
    featured: false,
    trending: false,
    rating: 4.8,
    reviews: 78,
    tags: ['communion', 'worship', 'supplies']
  },
  {
    id: 'p10',
    vendorId: 'v4',
    vendorName: 'Tech Essentials Hub',
    name: 'Portable Charger 20000mAh',
    description: 'High-capacity portable power bank',
    price: 39.99,
    image: '🔋',
    category: 'Electronics',
    stock: 12,
    inStock: true,
    deliveryETA: '25 min',
    featured: false,
    trending: true,
    rating: 4.7,
    reviews: 267,
    tags: ['portable', 'charging', 'essential']
  },
  {
    id: 'p11',
    vendorId: 'v3',
    vendorName: 'Blessed Apparel',
    name: 'Prayer Shawl - Traditional',
    description: 'Handwoven traditional prayer shawl',
    price: 59.99,
    image: '🧣',
    category: 'Clothing',
    stock: 7,
    inStock: true,
    deliveryETA: '20 min',
    featured: true,
    trending: false,
    rating: 4.9,
    reviews: 45,
    tags: ['traditional', 'handmade', 'prayer']
  },
  {
    id: 'p12',
    vendorId: 'v1',
    vendorName: 'Grace Bookstore',
    name: 'Children\'s Bible Stories',
    description: 'Illustrated Bible stories for children',
    price: 16.99,
    image: '📚',
    category: 'Books',
    stock: 28,
    inStock: true,
    deliveryETA: '15 min',
    featured: false,
    trending: true,
    rating: 4.8,
    reviews: 312,
    tags: ['children', 'illustrated', 'educational']
  }
];

export const mockOrders: Order[] = [
  {
    id: 'o1',
    productId: 'p2',
    productName: 'Fresh Coffee & Pastry Combo',
    vendorId: 'v2',
    vendorName: 'Heavenly Bites Café',
    userId: 'u1',
    userName: 'John Smith',
    quantity: 1,
    totalPrice: 8.99,
    status: 'in_transit',
    deliveryAddress: 'Building A, Room 205',
    deliveryETA: '5 min',
    orderDate: new Date(Date.now() - 600000).toISOString(),
    deliveryCoordinates: { lat: 34.0522, lng: -118.2437 },
    driverName: 'Michael Johnson',
    driverPhone: '+1-555-0201',
    trackingUpdates: [
      {
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'confirmed',
        message: 'Order confirmed by vendor'
      },
      {
        timestamp: new Date(Date.now() - 400000).toISOString(),
        status: 'preparing',
        message: 'Your order is being prepared'
      },
      {
        timestamp: new Date(Date.now() - 180000).toISOString(),
        status: 'in_transit',
        message: 'Driver has picked up your order',
        location: 'West Wing'
      }
    ]
  },
  {
    id: 'o2',
    productId: 'p1',
    productName: 'Study Bible - Premium Edition',
    vendorId: 'v1',
    vendorName: 'Grace Bookstore',
    userId: 'u1',
    userName: 'John Smith',
    quantity: 1,
    totalPrice: 49.99,
    status: 'delivered',
    deliveryAddress: 'Building A, Room 205',
    deliveryETA: 'Delivered',
    orderDate: new Date(Date.now() - 86400000).toISOString(),
    trackingUpdates: [
      {
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'confirmed',
        message: 'Order confirmed'
      },
      {
        timestamp: new Date(Date.now() - 85000000).toISOString(),
        status: 'preparing',
        message: 'Order being prepared'
      },
      {
        timestamp: new Date(Date.now() - 84000000).toISOString(),
        status: 'in_transit',
        message: 'Out for delivery'
      },
      {
        timestamp: new Date(Date.now() - 83000000).toISOString(),
        status: 'delivered',
        message: 'Order delivered successfully'
      }
    ]
  },
  {
    id: 'o3',
    productId: 'p4',
    productName: 'Wireless Earbuds Pro',
    vendorId: 'v4',
    vendorName: 'Tech Essentials Hub',
    userId: 'u2',
    userName: 'Sarah Williams',
    quantity: 1,
    totalPrice: 89.99,
    status: 'preparing',
    deliveryAddress: 'Building C, Room 101',
    deliveryETA: '20 min',
    orderDate: new Date(Date.now() - 300000).toISOString(),
    trackingUpdates: [
      {
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'confirmed',
        message: 'Order confirmed by vendor'
      },
      {
        timestamp: new Date(Date.now() - 180000).toISOString(),
        status: 'preparing',
        message: 'Order is being prepared for delivery'
      }
    ]
  }
];

export const mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Food & Drinks',
    icon: '🍽️',
    productCount: 145,
    trending: true
  },
  {
    id: 'cat2',
    name: 'Books',
    icon: '📚',
    productCount: 89,
    trending: true
  },
  {
    id: 'cat3',
    name: 'Religious Materials',
    icon: '✝️',
    productCount: 67,
    trending: false
  },
  {
    id: 'cat4',
    name: 'Clothing',
    icon: '👕',
    productCount: 52,
    trending: true
  },
  {
    id: 'cat5',
    name: 'Electronics',
    icon: '💻',
    productCount: 78,
    trending: false
  },
  {
    id: 'cat6',
    name: 'Essentials',
    icon: '🛒',
    productCount: 124,
    trending: true
  },
  {
    id: 'cat7',
    name: 'Event Supplies',
    icon: '🎪',
    productCount: 43,
    trending: false
  }
];

// Helper functions
export const getVendorById = (id: string): Vendor | undefined => {
  return mockVendors.find(v => v.id === id);
};

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const getProductsByVendor = (vendorId: string): Product[] => {
  return mockProducts.filter(p => p.vendorId === vendorId);
};

export const getProductsByCategory = (category: string): Product[] => {
  return mockProducts.filter(p => p.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return mockProducts.filter(p => p.featured);
};

export const getTrendingProducts = (): Product[] => {
  return mockProducts.filter(p => p.trending);
};

export const getOrdersByUser = (userId: string): Order[] => {
  return mockOrders.filter(o => o.userId === userId);
};

export const getOrdersByVendor = (vendorId: string): Order[] => {
  return mockOrders.filter(o => o.vendorId === vendorId);
};
