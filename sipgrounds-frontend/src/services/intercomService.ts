// Get Intercom app ID from environment variables
const INTERCOM_APP_ID = process.env.REACT_APP_INTERCOM_APP_ID || 'hqd6b4qh';

// Enable Intercom launcher and activity
const DISABLE_INTERCOM = false;

// Track if Intercom has been booted and current user state
let isBooted = false;
let currentUser: any = null;

// Check if Intercom should be enabled
const isIntercomEnabled = () => {
  // Return false to disable Intercom entirely
  if (DISABLE_INTERCOM) return false;
  
  // Enable Intercom if we have an app ID and window.Intercom exists
  return !!(INTERCOM_APP_ID && typeof window !== 'undefined' && window.Intercom);
};

// Booking-related types for better type safety
interface BookingStats {
  total_bookings: number;
  total_booking_value: number;
  confirmed_bookings: number;
  expired_bookings: number;
  cancelled_bookings: number;
  average_booking_value: number;
  average_stay_duration: number;
  last_booking_date?: number;
  favorite_campground_location?: string;
  total_nights_booked: number;
  booking_frequency?: 'frequent' | 'occasional' | 'new';
}

// Calculate booking statistics from user's booking data
const calculateBookingStats = (bookings: any[]): BookingStats => {
  if (!bookings || bookings.length === 0) {
    return {
      total_bookings: 0,
      total_booking_value: 0,
      confirmed_bookings: 0,
      expired_bookings: 0,
      cancelled_bookings: 0,
      average_booking_value: 0,
      average_stay_duration: 0,
      total_nights_booked: 0,
      booking_frequency: 'new'
    };
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const expiredBookings = bookings.filter(b => b.status === 'expired');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const totalValue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  const totalNights = bookings.reduce((sum, booking) => sum + (booking.days || 0), 0);
  
  // Find most frequent location
  const locationCounts = bookings.reduce((acc, booking) => {
    const location = booking.campground?.location;
    if (location) {
      acc[location] = (acc[location] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const favoriteLocation = Object.keys(locationCounts).length > 0 
    ? Object.entries(locationCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0] 
    : undefined;

  // Determine booking frequency
  let frequency: 'frequent' | 'occasional' | 'new' = 'new';
  if (bookings.length >= 10) frequency = 'frequent';
  else if (bookings.length >= 3) frequency = 'occasional';

  // Get last booking date
  const lastBooking = bookings
    .filter(b => b.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  return {
    total_bookings: bookings.length,
    total_booking_value: Math.round(totalValue * 100) / 100,
    confirmed_bookings: confirmedBookings.length,
    expired_bookings: expiredBookings.length,
    cancelled_bookings: cancelledBookings.length,
    average_booking_value: bookings.length > 0 ? Math.round((totalValue / bookings.length) * 100) / 100 : 0,
    average_stay_duration: bookings.length > 0 ? Math.round((totalNights / bookings.length) * 10) / 10 : 0,
    total_nights_booked: totalNights,
    last_booking_date: lastBooking ? Math.floor(new Date(lastBooking.createdAt).getTime() / 1000) : undefined,
    favorite_campground_location: favoriteLocation,
    booking_frequency: frequency
  };
};

// Initialize Intercom for anonymous visitors (following SPA integration guide)
export const initIntercomForVisitors = () => {
  if (!isIntercomEnabled()) {
    return;
  }

  try {
    // Boot Intercom for logged-out visitors as per the SPA guide
    window.Intercom('boot', {
      app_id: INTERCOM_APP_ID
      // No user data for anonymous visitors - they can still chat
    });
    isBooted = true;
    currentUser = null;
    console.log('🔧 Intercom booted for anonymous visitors');
  } catch (error) {
    console.warn('Intercom visitor init failed:', error);
  }
};

// Update Intercom with user data following SPA integration guide
export const updateIntercomUser = (user: any, bookings?: any[]) => {
  // Skip if Intercom is not enabled
  if (!isIntercomEnabled()) {
    return;
  }

  // If no user provided, convert to visitor mode
  if (!user) {
    try {
      // Shutdown current session and start fresh for visitors
      window.Intercom('shutdown');
      isBooted = false;
      currentUser = null;
      // Boot for anonymous visitors
      initIntercomForVisitors();
    } catch (error) {
      console.warn('Intercom visitor fallback failed:', error);
    }
    return;
  }

  // Validate required fields
  const userId = user.id || user._id;
  const userEmail = user.email;
  const userName = user.username || user.name;

  // Skip if missing critical data
  if (!userId || !userEmail) {
    console.warn('Intercom: Missing required user data (id or email)', { userId, userEmail });
    return;
  }

  // Calculate booking statistics if bookings are provided
  const bookingStats = bookings ? calculateBookingStats(bookings) : {};

  const userData = {
    app_id: INTERCOM_APP_ID,
    name: userName || 'User',
    email: userEmail,
    user_id: String(userId), // Ensure it's a string
    created_at: user.createdAt ? Math.floor(new Date(user.createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000),
    role: user.role || 'user',
    website: user.website || 'sipgrounds.vercel.app',
    
    // User stats from profile
    ...(user.stats && {
      campgrounds_created: user.stats.campgrounds,
      reviews_written: user.stats.reviews,
      profile_bookings_count: user.stats.bookings
    }),

    // Booking statistics
    ...bookingStats,

    // Activity tracking
    ...(user.last_viewed_campground && {
      last_viewed_campground: user.last_viewed_campground,
      last_viewed_campground_id: user.last_viewed_campground_id,
      last_viewed_campground_at: user.last_viewed_campground_at
    }),

    // Include additional user properties if they exist
    ...(user.campground_views && { campground_views: user.campground_views }),
    ...(user.last_login_at && { last_login_at: user.last_login_at }),
    ...(user.signup_source && { signup_source: user.signup_source })
  };

  try {
    // Check if this is a different user or first time
    const isDifferentUser = currentUser && currentUser.id !== userId;
    
    if (!isBooted || isDifferentUser) {
      // First time or different user - use boot method as per SPA guide
      if (isDifferentUser) {
        // Shutdown previous session for different user
        window.Intercom('shutdown');
        isBooted = false;
      }
      
      window.Intercom('boot', userData);
      isBooted = true;
      currentUser = { id: userId, email: userEmail };
      console.log('🔧 Intercom booted for user:', userName);
    } else {
      // Same user, subsequent updates - use update method
      // Always include user_id and email as per SPA guide
      const updateData = {
        ...userData,
        user_id: String(userId),
        email: userEmail
      };
      window.Intercom('update', updateData);
      console.log('🔄 Intercom updated for user:', userName);
    }
  } catch (error) {
    console.warn('Intercom update failed:', error);
  }
};

// Track booking events
export const trackBookingEvent = (eventName: string, bookingData: any, userData?: any) => {
  if (!isIntercomEnabled()) return;

  const eventData = {
    event_name: eventName,
    created_at: Math.floor(Date.now() / 1000),
    metadata: {
      booking_id: bookingData._id || bookingData.id,
      campground_id: bookingData.campground?._id || bookingData.campground?.id,
      campground_name: bookingData.campground?.title,
      campground_location: bookingData.campground?.location,
      booking_value: bookingData.totalPrice,
      stay_duration: bookingData.days,
      check_in_date: bookingData.checkInDate,
      check_out_date: bookingData.checkOutDate,
      booking_status: bookingData.status,
      price_per_night: bookingData.campground?.price,
      ...(userData && { user_id: userData.id })
    }
  };

  // Track the event
  try {
    window.Intercom('trackEvent', eventName, eventData.metadata);
  } catch (error) {
    console.warn('Intercom trackEvent failed:', error);
  }
  
  console.log(`📊 Tracked Intercom event: ${eventName}`, eventData);
};

// Predefined booking events
export const bookingEvents = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_VIEWED: 'booking_viewed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_EXPIRED: 'booking_expired',
  CAMPGROUND_VIEWED: 'campground_viewed',
  CAMPGROUND_FAVORITED: 'campground_favorited',
  BOOKING_SEARCH: 'booking_search',
  PAYMENT_COMPLETED: 'payment_completed'
};

// Helper functions for common booking events
export const trackBookingCreated = (booking: any, user?: any) => {
  trackBookingEvent(bookingEvents.BOOKING_CREATED, booking, user);
};

export const trackBookingCancelled = (booking: any, user?: any) => {
  trackBookingEvent(bookingEvents.BOOKING_CANCELLED, booking, user);
};

export const trackCampgroundViewed = (campground: any, user?: any) => {
  if (!isIntercomEnabled()) return;
  
  const metadata = {
    campground_id: campground._id || campground.id,
    campground_name: campground.title,
    campground_location: campground.location,
    campground_price: campground.price,
    campground_capacity: campground.capacity,
    available_spots: campground.availableSpots || (campground.capacity - campground.peopleBooked),
    booking_percentage: campground.bookingPercentage,
    average_rating: campground.averageRating,
    total_reviews: campground.totalReviews,
    ...(user && { user_id: user.id })
  };

  try {
    window.Intercom('trackEvent', bookingEvents.CAMPGROUND_VIEWED, metadata);
  } catch (error) {
    console.warn('Intercom trackEvent failed:', error);
  }
};

// Enhanced user update with booking data
export const updateIntercomWithBookings = async (user: any) => {
  try {
    // Import bookingAPI dynamically to avoid circular imports
    const { bookingAPI } = await import('./api');
    
    // Fetch user's bookings
    const bookingsResponse = await bookingAPI.getUserBookings();
    
    if (bookingsResponse.success && bookingsResponse.data) {
      const bookings = bookingsResponse.data.bookings;
      updateIntercomUser(user, bookings);
    } else {
      updateIntercomUser(user);
    }
  } catch (error) {
    console.warn('Failed to fetch bookings for Intercom update:', error);
    updateIntercomUser(user);
  }
};

// Update Intercom when URL changes (following SPA integration guide)
export const updateIntercomPage = () => {
  if (!isIntercomEnabled() || !isBooted) return;
  
  try {
    // Send update with current timestamp as per SPA guide
    // This triggers a "ping" to check for new messages/tours
    const updateData: any = {
      last_request_at: Math.floor(Date.now() / 1000)
    };
    
    // Always include user identification if we have a current user
    if (currentUser) {
      updateData.user_id = currentUser.id;
      updateData.email = currentUser.email;
    }
    
    window.Intercom('update', updateData);
  } catch (error) {
    console.warn('Intercom page update failed:', error);
  }
};

// Manual show function
export const showIntercom = () => {
  if (!isIntercomEnabled()) return;
  
  try {
    window.Intercom('show');
  } catch (error) {
    console.warn('Intercom show failed:', error);
  }
};

// Manual hide function
export const hideIntercom = () => {
  if (!isIntercomEnabled()) return;
  
  try {
    window.Intercom('hide');
  } catch (error) {
    console.warn('Intercom hide failed:', error);
  }
};

// Shutdown Intercom (following SPA guide for logout)
export const shutdownIntercom = () => {
  if (!isIntercomEnabled()) return;
  
  try {
    // Shutdown current session to clear cookies and reset state
    window.Intercom('shutdown');
    isBooted = false;
    currentUser = null;
    
    // Immediately boot for anonymous visitors as per SPA guide
    window.Intercom('boot', {
      app_id: INTERCOM_APP_ID
    });
    isBooted = true;
    
    console.log('🔧 Intercom session ended, switched to visitor mode');
  } catch (error) {
    console.warn('Intercom shutdown failed:', error);
  }
};

// Show new message composer
export const showNewMessage = (message?: string) => {
  if (!isIntercomEnabled()) return;
  
  try {
    if (message) {
      window.Intercom('showNewMessage', message);
    } else {
      window.Intercom('showNewMessage');
    }
  } catch (error) {
    console.warn('Intercom showNewMessage failed:', error);
  }
};

// Track custom events for Sip Grounds specific actions
export const trackCafeEvent = (eventName: string, cafeData: any, userData?: any) => {
  if (!isIntercomEnabled()) return;

  const eventData = {
    cafe_id: cafeData._id || cafeData.id,
    cafe_name: cafeData.name || cafeData.title,
    cafe_location: cafeData.location,
    cafe_price_range: cafeData.priceRange,
    cafe_rating: cafeData.averageRating,
    points_multiplier: cafeData.pointsMultiplier,
    ...(userData && { user_id: userData.id })
  };

  try {
    window.Intercom('trackEvent', eventName, eventData);
  } catch (error) {
    console.warn('Intercom trackEvent failed:', error);
  }
};

// Track shop/order events
export const trackShopEvent = (eventName: string, orderData: any, userData?: any) => {
  if (!isIntercomEnabled()) return;

  const eventData = {
    order_id: orderData._id || orderData.id,
    order_total: orderData.totalAmount || orderData.total,
    item_count: orderData.items?.length || 0,
    points_earned: orderData.totalPointsEarned || 0,
    order_status: orderData.status,
    ...(userData && { user_id: userData.id })
  };

  try {
    window.Intercom('trackEvent', eventName, eventData);
  } catch (error) {
    console.warn('Intercom trackEvent failed:', error);
  }
};

// Predefined Sip Grounds events
export const sipGroundsEvents = {
  CAFE_VIEWED: 'cafe_viewed',
  CAFE_FAVORITED: 'cafe_favorited',
  ORDER_PLACED: 'order_placed',
  ORDER_COMPLETED: 'order_completed',
  POINTS_REDEEMED: 'points_redeemed',
  REVIEW_WRITTEN: 'review_written',
  MENU_VIEWED: 'menu_viewed',
  POLL_PARTICIPATED: 'poll_participated'
}; 