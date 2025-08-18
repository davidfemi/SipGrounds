import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { Product, MenuItem } from '../services/api';

// Union type for cart items - can be either Product or MenuItem
type CartProduct = Product | MenuItem;

interface CartItem {
  product: CartProduct;
  quantity: number;
  customizations?: {
    size?: string;
    milk?: string;
    extras?: string[];
    specialInstructions?: string;
  };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartProduct, quantity?: number, customizations?: CartItem['customizations']) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('campgrounds-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('campgrounds-cart');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('campgrounds-cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (product: CartProduct, quantity: number = 1, customizations?: CartItem['customizations']) => {
    setCart(prevCart => {
      // Create a unique key for items with customizations
      const itemKey = customizations 
        ? `${product._id}-${JSON.stringify(customizations)}`
        : product._id;
      
      const existingItem = prevCart.find(item => {
        const existingKey = item.customizations 
          ? `${item.product._id}-${JSON.stringify(item.customizations)}`
          : item.product._id;
        return existingKey === itemKey;
      });
      
      if (existingItem) {
        return prevCart.map(item => {
          const existingKey = item.customizations 
            ? `${item.product._id}-${JSON.stringify(item.customizations)}`
            : item.product._id;
          return existingKey === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      } else {
        return [...prevCart, { product, quantity, customizations }];
      }
    });
    
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
    toast.info('Item removed from cart');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('campgrounds-cart');
    toast.info('Cart cleared');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 