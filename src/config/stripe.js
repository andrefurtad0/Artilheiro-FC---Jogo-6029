import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe('pk_test_your_publishable_key')

export default stripePromise