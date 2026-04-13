import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string

if (!stripePublishableKey) {
  console.warn('Missing VITE_STRIPE_PUBLISHABLE_KEY — payments will not work.')
}

// Singleton — loadStripe is safe to call multiple times but only loads once
export const stripePromise = loadStripe(stripePublishableKey ?? '')
