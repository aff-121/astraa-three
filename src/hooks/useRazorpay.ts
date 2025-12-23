import { useState, useCallback, useEffect } from 'react';
import { loadRazorpayScript, RazorpayPaymentResponse, RazorpayOptions } from '@/lib/razorpay';
import { supabase } from '@/lib/supabase';

interface OrderDetails {
  eventId: string;
  categoryId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: 'upi' | 'card';
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

interface CreateOrderResult {
  id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  status: string;
}

interface VerifyPaymentResult {
  success: boolean;
  order: {
    id: string;
    status: string;
  };
  ticket?: {
    id: string;
    ticket_number: string;
  };
}

interface UseRazorpayOptions {
  onSuccess?: (result: VerifyPaymentResult) => void;
  onError?: (error: Error) => void;
  onDismiss?: () => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export function useRazorpay(options: UseRazorpayOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setIsScriptLoaded(loaded);
      if (!loaded) {
        setError(new Error('Failed to load Razorpay SDK'));
      }
    });
  }, []);

  const createOrder = async (orderDetails: OrderDetails): Promise<CreateOrderResult> => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderDetails),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create order');
    }

    return data.order;
  };

  const verifyPayment = async (paymentResponse: RazorpayPaymentResponse): Promise<VerifyPaymentResult> => {
    const response = await fetch('/api/orders/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentResponse),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Payment verification failed');
    }

    return data;
  };

  const initiatePayment = useCallback(async (orderDetails: OrderDetails) => {
    if (!isScriptLoaded) {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK');
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create order
      const order = await createOrder(orderDetails);

      // Step 2: Open Razorpay checkout
      const razorpayOptions: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: 'Astra Productions',
        description: 'Movie Tickets',
        order_id: order.razorpay_order_id,
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            // Step 3: Verify payment
            const result = await verifyPayment(response);
            options.onSuccess?.(result);
          } catch (err) {
            const error = err instanceof Error ? err : new Error('Payment verification failed');
            setError(error);
            options.onError?.(error);
          } finally {
            setIsLoading(false);
          }
        },
        prefill: orderDetails.prefill || options.prefill,
        theme: {
          color: '#FF6B35', // Coral/orange theme
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            options.onDismiss?.();
          },
          escape: true,
          animation: true,
        },
      };

      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();

      // Handle payment failure
      rzp.on('payment.failed', () => {
        const error = new Error('Payment failed');
        setError(error);
        setIsLoading(false);
        options.onError?.(error);
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initiate payment');
      setError(error);
      setIsLoading(false);
      options.onError?.(error);
      throw error;
    }
  }, [isScriptLoaded, options]);

  return {
    initiatePayment,
    isLoading,
    isScriptLoaded,
    error,
  };
}

export function useRequestRefund() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const requestRefund = useCallback(async (
    orderId: string,
    reason: 'customer_request' | 'event_cancelled' | 'duplicate_payment' | 'other',
    notes?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/refunds/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, reason, notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Refund request failed');
      }

      return data.refund;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Refund request failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    requestRefund,
    isLoading,
    error,
  };
}
