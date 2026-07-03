export type LimitationType =
  | 'usage'          // max posts, max api calls
  | 'seat'           // max users/members
  | 'time'           // trial days, expiry
  | 'feature_access' // on/off toggle only
  | 'rate'           // requests per hour/day
  | 'storage'        // GB/MB limit
  | 'project'        // max projects/workspaces

export type UserRole = 'admin' | 'guest'

export type PaymentGateway = 'stripe' | 'razorpay' | 'paypal' | 'other'

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending'
