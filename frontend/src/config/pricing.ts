import { Zap, Crown, LucideIcon } from 'lucide-react'

export interface PricingPlan {
  id: 'free' | 'basic' | 'pro'
  name: string
  icon: LucideIcon
  color: string
  price: {
    monthly: number
    yearly: number
  }
  popular?: boolean
  features: string[]
  limitations: string[]
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    icon: Zap,
    color: 'text-gray-600',
    price: {
      monthly: 0,
      yearly: 0
    },
    features: [
      '25 AI queries per day',
      'Basic topic explanations',
      'Limited note generation',
      'Community support',
      'Access to learning resources'
    ],
    limitations: [
      'No mock tests',
      'No code debugging',
      'No career tools',
      'Ads supported'
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    icon: Zap,
    color: 'text-blue-600',
    price: {
      monthly: 249,
      yearly: 2490
    },
    popular: false,
    features: [
      '100 AI queries per day',
      'Advanced explanations',
      'Unlimited note generation',
      'Mock tests & quizzes',
      '5 code debugs per day',
      'Email support',
      'No ads'
    ],
    limitations: []
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Crown,
    color: 'text-purple-600',
    price: {
      monthly: 599,
      yearly: 5999
    },
    popular: true,
    features: [
      'Unlimited AI queries',
      'Priority AI responses',
      'Unlimited mock tests',
      'Unlimited code debugging',
      'DSA practice with hints',
      'Project guidance',
      'Resume builder & analysis',
      'Interview preparation',
      'Company-specific prep',
      '24/7 priority support',
      'Study plan generator',
      'Progress tracking',
      'Multi-language support',
      'No ads'
    ],
    limitations: []
  }
]

export const YEARLY_SAVINGS_PERCENT = 17 // ~17% savings on yearly billing
