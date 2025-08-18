import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  points?: number;
  createdAt?: string;
}

export interface UserProfile extends User {
  createdAt: string;
  points: number;
  stats: {
    cafes: number;
    campgrounds?: number; // Backward compatibility
    reviews: number;
    totalPointsEarned: number;
    favoritesCafes: number;
  };
  favoritecafes?: string[];
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    preferences?: {
      coffeeType?: string[];
      dietaryRestrictions?: string[];
      notifications?: {
        email: boolean;
        push: boolean;
        promotions: boolean;
      };
    };
  };
}

export interface Cafe {
  _id: string;
  name: string;
  title?: string; // Backward compatibility with campground
  description: string;
  location: string;
  price?: number; // Backward compatibility with campground
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  images: Array<{
    url: string;
    filename: string;
  }>;
  author: {
    _id: string;
    username: string;
  };
  reviews: Review[];
  geometry?: {
    type: string;
    coordinates: [number, number];
  };
  amenities?: string[];
  specialties?: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  hours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
  };
  isPartner: boolean;
  status: 'active' | 'inactive' | 'pending';
  pointsMultiplier: number;
  averageRating: number;
  isOpen: boolean;
}

export interface Review {
  _id: string;
  rating: number;
  body: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'coffee' | 'tea' | 'pastry' | 'food' | 'merchandise' | 'gift_card';
  subcategory?: string;
  availableAt?: string[];
  pointsEarned: number;
  customization?: {
    sizes?: Array<{
      name: string;
      price: number;
      pointsEarned?: number;
    }>;
    milkOptions?: Array<{
      name: string;
      extraCharge: number;
    }>;
    extras?: Array<{
      name: string;
      price: number;
    }>;
  };
  nutritionalInfo?: {
    calories?: number;
    caffeine?: number;
    allergens?: string[];
  };
  inStock: boolean;
  stockQuantity: number;
  isPopular?: boolean;
  isRecommended?: boolean;
}

// Menu-related types
export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'drinks' | 'food';
  itemType: 'DrinkItem' | 'FoodItem';
  pointsEarned: number;
  inStock: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  preparationTime: number;
  customization?: {
    sizes?: Array<{ name: string; price: number; pointsEarned: number }>;
    extras?: Array<{ name: string; price: number }>;
  };
  nutritionalInfo?: {
    calories?: number;
    allergens?: string[];
  };
  // Drink-specific fields
  drinkType?: string;
  temperature?: 'hot' | 'cold' | 'both';
  caffeineContent?: number;
  milkOptions?: Array<{ name: string; extraCharge: number }>;
  sweetenerOptions?: Array<{ name: string; extraCharge: number }>;
  flavorSyrups?: Array<{ name: string; extraCharge: number }>;
  teaVariety?: string;
  isDecafAvailable?: boolean;
  brewMethod?: string;
  // Food-specific fields
  foodType?: string;
  mealType?: string;
  dietaryInfo?: {
    isVegan?: boolean;
    isVegetarian?: boolean;
    isGlutenFree?: boolean;
    isDairyFree?: boolean;
    isKeto?: boolean;
    isLowCarb?: boolean;
  };
  ingredients?: Array<{ name: string; isAllergen: boolean }>;
  servingInfo?: {
    servingSize?: string;
    weight?: number;
    temperature?: 'hot' | 'cold' | 'room_temperature';
  };
  customizationOptions?: {
    breadOptions?: Array<{ name: string; extraCharge: number }>;
    proteinOptions?: Array<{ name: string; extraCharge: number }>;
    cheeseOptions?: Array<{ name: string; extraCharge: number }>;
    toppings?: Array<{ name: string; extraCharge: number }>;
    sauces?: Array<{ name: string; extraCharge: number }>;
  };
  heatingInstructions?: {
    canBeHeated?: boolean;
    heatingTime?: number;
    heatingMethod?: 'microwave' | 'oven' | 'toaster' | 'none';
  };
}

export interface MenuSection {
  name: string;
  description?: string;
  displayOrder: number;
  items: MenuItem[];
  isActive: boolean;
}

export interface Menu {
  _id: string;
  cafe: {
    _id: string;
    name: string;
    location: string;
  };
  name: string;
  description: string;
  menuSections: MenuSection[];
  isActive: boolean;
  availability?: {
    schedule?: {
      [key: string]: {
        isAvailable: boolean;
        startTime: string;
        endTime: string;
      };
    };
    specialHours?: Array<{
      date: string;
      isAvailable: boolean;
      startTime?: string;
      endTime?: string;
      reason?: string;
    }>;
  };
  pricing?: {
    currency: string;
    taxIncluded: boolean;
    serviceCharge: number;
  };
  lastUpdated: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  cafe?: {
    _id: string;
    name: string;
    location: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    contact?: {
      phone?: string;
      email?: string;
    };
  };
  items: Array<{
    product: Product;
    quantity: number;
    price: number;
    customizations?: {
      size?: string;
      milk?: string;
      extras?: string[];
      specialInstructions?: string;
    };
    pointsEarned: number;
  }>;
  subtotal: number;
  discount: {
    amount: number;
    coupon?: string;
    couponCode?: string;
  };
  totalAmount: number;
  totalPointsEarned: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'processing' | 'shipped' | 'delivered';
  orderType: 'pickup' | 'delivery' | 'dine_in';
  pickupTime?: string;
  estimatedReadyTime?: string;
  deliveryAddress?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    instructions?: string;
  };
  shippingAddress?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    instructions?: string;
  };
  payment: {
    method: string;
    transactionId?: string;
    paymentIntentId?: string;
    clientSecret?: string;
    paid: boolean;
    paidAt?: string;
    failureReason?: string;
  };
  refund?: {
    amount: number;
    status: 'pending' | 'processed' | 'failed';
    processedAt?: string;
    failureReason?: string;
  };
  customerNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Reward {
  _id: string;
  name: string;
  description: string;
  category: 'drink' | 'food' | 'pastry' | 'merchandise' | 'experience';
  pointsCost: number;
  monetaryValue: number;
  image?: {
    url: string;
    filename: string;
  };
  isActive: boolean;
  stockLimit?: number;
  redeemedCount: number;
  applicableCafes: string[];
  restrictions?: {
    maxPerUser?: number;
    validDays?: string[];
    validTimes?: {
      start: string;
      end: string;
    };
  };
  expiryDays: number;
  isInStock: boolean;
  stockPercentage: number;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_item' | 'points_bonus';
  value: number;
  freeItem?: {
    category: string;
    maxValue: number;
  };
  pointsBonus?: {
    multiplier: number;
    basePoints?: number;
  };
  minimumPurchase: number;
  maxUses?: number;
  usedCount: number;
  maxUsesPerUser: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableCafes: string[];
  createdAt: string;
}

export interface Poll {
  _id: string;
  question: string;
  description?: string;
  options: Array<{
    text: string;
    votes: number;
  }>;
  isActive: boolean;
  allowMultipleVotes: boolean;
  startsAt: string;
  endsAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
  category: 'general' | 'menu' | 'cafe_features' | 'events' | 'feedback';
  targetAudience: 'all' | 'frequent_customers' | 'new_customers';
  pointsReward: number;
  image?: {
    url: string;
    filename: string;
  };
  totalVotes: number;
  isCurrentlyActive: boolean;
  userHasVoted: boolean;
  results?: Array<{
    text: string;
    votes: number;
    percentage: number;
  }>;
  createdAt: string;
}

export interface Booking {
  _id: string;
  cafe: string;
  campground?: Cafe; // Populated campground data for backward compatibility
  user: string;
  checkInDate: string;
  checkOutDate: string;
  days: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentIntentId?: string;
  payment?: {
    method: string;
    transactionId?: string;
    paymentIntentId?: string;
    clientSecret?: string;
    paid: boolean;
    paidAt?: string;
    failureReason?: string;
  };
  refund?: {
    amount: number;
    status: 'pending' | 'processed' | 'failed';
    processedAt?: string;
    failureReason?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth API
export const authAPI = {
  register: async (userData: { username: string; email: string; password: string }): Promise<APIResponse<{ user: User }>> => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { username: string; password: string }): Promise<APIResponse<{ user: User }>> => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<APIResponse> => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<APIResponse<{ user: User }>> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  getUserProfile: async (): Promise<APIResponse<{ user: UserProfile }>> => {
    const response = await api.get('/api/users/profile');
    return response.data;
  }
};

// Cafes API
export const cafesAPI = {
  getAll: async (params?: any): Promise<APIResponse<{ cafes: Cafe[]; campgrounds?: Cafe[] }>> => {
    const response = await api.get('/api/cafes', { params });
    // Add backward compatibility for campgrounds
    if (response.data && response.data.data) {
      response.data.data.campgrounds = response.data.data.cafes;
    }
    return response.data;
  },

  getById: async (id: string): Promise<APIResponse<{ cafe: Cafe; campground?: Cafe; stats: any }>> => {
    const response = await api.get(`/api/cafes/${id}`);
    // Add backward compatibility for campground
    if (response.data && response.data.data) {
      response.data.data.campground = response.data.data.cafe;
    }
    return response.data;
  },

  create: async (cafeData: Partial<Cafe>): Promise<APIResponse<{ cafe: Cafe; campground?: Cafe }>> => {
    const response = await api.post('/api/cafes', cafeData);
    // Add backward compatibility for campground
    if (response.data && response.data.data) {
      response.data.data.campground = response.data.data.cafe;
    }
    return response.data;
  },

  update: async (id: string, cafeData: Partial<Cafe>): Promise<APIResponse<{ cafe: Cafe; campground?: Cafe }>> => {
    const response = await api.put(`/api/cafes/${id}`, cafeData);
    // Add backward compatibility for campground
    if (response.data && response.data.data) {
      response.data.data.campground = response.data.data.cafe;
    }
    return response.data;
  },

  delete: async (id: string): Promise<APIResponse> => {
    const response = await api.delete(`/api/cafes/${id}`);
    return response.data;
  }
};

// Products API (existing, updated categories)
export const productsAPI = {
  getAll: async (params?: any): Promise<APIResponse<{ products: Product[] }>> => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  getById: async (id: string): Promise<APIResponse<{ product: Product }>> => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  }
};

// Orders API (updated)
export const ordersAPI = {
  getAll: async (): Promise<APIResponse<{ orders: Order[] }>> => {
    const response = await api.get('/api/orders');
    return response.data;
  },

  // Backend exposes GET /api/orders to fetch current user's orders via session
  getUserOrders: async (): Promise<APIResponse<{ orders: Order[] }>> => {
    const response = await api.get('/api/orders');
    return response.data;
  },

  getById: async (id: string): Promise<APIResponse<{ order: Order }>> => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  create: async (orderData: any): Promise<APIResponse<{ order: Order }>> => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  cancel: async (id: string): Promise<APIResponse<{ order: Order; refund?: any }>> => {
    const response = await api.patch(`/api/orders/${id}/cancel`);
    return response.data;
  }
};

// Rewards API
export const rewardsAPI = {
  getAll: async (params?: any): Promise<APIResponse<{ rewards: Reward[] }>> => {
    const response = await api.get('/api/rewards', { params });
    return response.data;
  },

  getById: async (id: string): Promise<APIResponse<{ reward: Reward }>> => {
    const response = await api.get(`/api/rewards/${id}`);
    return response.data;
  },

  redeem: async (id: string, data: { cafeId?: string | null }): Promise<APIResponse<{ redemption: any; remainingPoints: number }>> => {
    const response = await api.post(`/api/rewards/${id}/redeem`, data);
    return response.data;
  }
};

// Coupons API
export const couponsAPI = {
  getAll: async (params?: any): Promise<APIResponse<{ coupons: Coupon[] }>> => {
    const response = await api.get('/api/coupons', { params });
    return response.data;
  },

  validate: async (code: string, orderTotal?: number, items?: any[]): Promise<APIResponse<{ coupon: Coupon; discountAmount: number; isValid: boolean }>> => {
    const response = await api.post('/api/coupons/validate', { code, orderTotal, items });
    return response.data;
  },

  apply: async (couponId: string, orderId: string, cafeId?: string, discountAmount?: number): Promise<APIResponse> => {
    const response = await api.post('/api/coupons/apply', { couponId, orderId, cafeId, discountAmount });
    return response.data;
  },

  getMyUsage: async (): Promise<APIResponse<{ userUsage: any[] }>> => {
    const response = await api.get('/api/coupons/my-usage');
    return response.data;
  }
};

// Polls API
export const pollsAPI = {
  getAll: async (params?: any): Promise<APIResponse<{ polls: Poll[] }>> => {
    const response = await api.get('/api/polls', { params });
    return response.data;
  },

  getById: async (id: string): Promise<APIResponse<{ poll: Poll }>> => {
    const response = await api.get(`/api/polls/${id}`);
    return response.data;
  },

  vote: async (id: string, optionIndex: number): Promise<APIResponse<{ poll: Poll; pointsEarned: number }>> => {
    const response = await api.post(`/api/polls/${id}/vote`, { optionIndex });
    return response.data;
  },

  getMyVotes: async (): Promise<APIResponse<{ votingHistory: any[] }>> => {
    const response = await api.get('/api/polls/my-votes');
    return response.data;
  }
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: async (orderData: any): Promise<APIResponse<{ order: any; clientSecret: string; paymentIntentId: string }>> => {
    const response = await api.post('/api/payments/create-payment-intent', orderData);
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string, orderId: string): Promise<APIResponse<{ order: Order; newPointsBalance: number }>> => {
    const response = await api.post('/api/payments/confirm-payment', { paymentIntentId, orderId });
    return response.data;
  },

  getPaymentMethods: async (): Promise<APIResponse<{ paymentMethods: any[] }>> => {
    const response = await api.get('/api/payments/payment-methods');
    return response.data;
  },

  // Stripe Checkout session (redirect-based)
  createCheckoutSession: async (payload: { items: { name: string; price: number; quantity: number; productId?: string }[]; successUrl?: string; cancelUrl?: string; orderType?: 'pickup'; cafeId: string; pickupTime?: string; usePoints?: boolean; }): Promise<APIResponse<{ sessionId: string; url: string; orderId?: string }>> => {
    const response = await api.post('/api/payments/checkout-session', payload);
    return response.data;
  }
};

// Menu API
export const menuAPI = {
  // Get menu for a specific cafe
  getByCafe: async (cafeId: string): Promise<APIResponse<{ menu: Menu }>> => {
    const response = await api.get(`/api/menus/cafe/${cafeId}`);
    return response.data;
  },

  // Get all menu items for a cafe (alternative endpoint)
  getMenuItems: async (cafeId: string, params?: { 
    category?: 'drinks' | 'food';
    drinkType?: string;
    foodType?: string;
    mealType?: string;
    temperature?: 'hot' | 'cold';
    dietaryRestrictions?: string[];
    inStock?: boolean;
  }): Promise<APIResponse<{ items: MenuItem[] }>> => {
    const response = await api.get(`/api/menus/cafe/${cafeId}/items`, { params });
    return response.data;
  },

  // Get specific menu item
  getMenuItem: async (itemId: string): Promise<APIResponse<{ item: MenuItem }>> => {
    // Backend mounts menu routes under /api/menus; item endpoint is /items/:itemId
    const response = await api.get(`/api/menus/items/${itemId}`);
    return response.data;
  },

  // Search menu items across all cafes
  searchItems: async (params: {
    query?: string;
    category?: 'drinks' | 'food';
    drinkType?: string;
    foodType?: string;
    priceRange?: { min?: number; max?: number };
    dietaryRestrictions?: string[];
    cafeId?: string;
    limit?: number;
    page?: number;
  }): Promise<APIResponse<{ items: MenuItem[]; totalCount: number; totalPages: number }>> => {
    const response = await api.get('/api/menu-items/search', { params });
    return response.data;
  },

  // Get popular items
  getPopularItems: async (cafeId?: string, category?: 'drinks' | 'food'): Promise<APIResponse<{ items: MenuItem[] }>> => {
    const params: any = {};
    if (cafeId) params.cafeId = cafeId;
    if (category) params.category = category;
    const response = await api.get('/api/menu-items/popular', { params });
    return response.data;
  },

  // Get recommended items
  getRecommendedItems: async (cafeId?: string, category?: 'drinks' | 'food'): Promise<APIResponse<{ items: MenuItem[] }>> => {
    const params: any = {};
    if (cafeId) params.cafeId = cafeId;
    if (category) params.category = category;
    const response = await api.get('/api/menu-items/recommended', { params });
    return response.data;
  }
};

// New flat menu groups endpoints
export const menuGroupsAPI = {
  getGroups: async (): Promise<APIResponse<{ groups: { slug: string; name: string; category: string }[] }>> => {
    const response = await api.get('/api/menus/groups');
    return response.data;
  },
  getGroupItems: async (groupSlug: string, params?: any): Promise<APIResponse<{ group: any; items: MenuItem[] }>> => {
    const response = await api.get(`/api/menus/group/${groupSlug}`, { params });
    return response.data;
  }
};

// Bookings API
export const bookingAPI = {
  getUserBookings: async (): Promise<APIResponse<{ bookings: Booking[] }>> => {
    const response = await api.get('/api/bookings');
    return response.data;
  },

  getById: async (id: string): Promise<APIResponse<{ booking: Booking }>> => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  },

  create: async (cafeId: string, bookingData: any): Promise<APIResponse<{ booking: Booking }>> => {
    const response = await api.post(`/api/cafes/${cafeId}/bookings`, bookingData);
    return response.data;
  },

  cancel: async (id: string): Promise<APIResponse<{ booking: Booking; refund?: any }>> => {
    const response = await api.patch(`/api/bookings/${id}/cancel`);
    return response.data;
  }
};

// Product API (alias for productsAPI for backward compatibility)
export const productAPI = productsAPI;

// Order API (alias for ordersAPI for backward compatibility)  
export const orderAPI = ordersAPI;

// Reviews API
export const reviewsAPI = {
  create: async (cafeId: string, reviewData: { rating: number; body: string }): Promise<APIResponse<{ review: Review }>> => {
    const response = await api.post(`/api/cafes/${cafeId}/reviews`, reviewData);
    return response.data;
  },

  delete: async (cafeId: string, reviewId: string): Promise<APIResponse> => {
    const response = await api.delete(`/api/cafes/${cafeId}/reviews/${reviewId}`);
    return response.data;
  }
};

// User API
export const userAPI = {
  getProfile: async (): Promise<APIResponse<{ user: UserProfile }>> => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  updateProfile: async (profileData: any): Promise<APIResponse<{ user: UserProfile }>> => {
    const response = await api.put('/api/users/profile', profileData);
    return response.data;
  }
};

// Legacy exports for backward compatibility
export const campgroundsAPI = cafesAPI;
export type Campground = Cafe;

// Stats API for backward compatibility
export const statsAPI = {
  get: async (): Promise<APIResponse<any>> => {
    // This would need to be implemented in the backend
    return { success: true, data: { totalCafes: 0, totalReviews: 0 } };
  }
};

export default api;