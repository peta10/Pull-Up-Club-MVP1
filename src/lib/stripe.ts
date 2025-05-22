import { products } from '../services/stripe-config';

export const createCheckoutSession = async (
  subscriptionType: 'monthly' | 'annual',
  email: string,
  formData: any
) => {
  // Store the email in localStorage to use it later for account creation
  localStorage.setItem('checkoutEmail', email);
  
  // Determine the product based on subscription type
  const product = subscriptionType === 'monthly' ? products.pullUpClub : products.pullUpClubAnnual;
  
  try {
    // Make API request to our serverless function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: product.priceId,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/submit`,
        customerEmail: email,
        metadata: {
          formData: JSON.stringify(formData)
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const getActiveSubscription = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscription-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get subscription status');
    }
    
    const data = await response.json();
    return data.subscription;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
};