import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Check, Zap, Crown } from 'lucide-react'
import { paymentAPI } from '../api/client'
import { useAppStore } from '../store/useAppStore'
import Header from '../components/Header'

export default function PricingPage() {
  const { isAuthenticated, user } = useAppStore()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Zap,
      color: 'text-gray-600',
      price: { monthly: 0, yearly: 0 },
      features: [
        '10 AI queries per day',
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
      price: { monthly: 299, yearly: 2999 },
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
      price: { monthly: 599, yearly: 5999 },
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

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    
    try {
      // Demo payment - using demo API keys
      const response = await paymentAPI.createCheckout({
        plan: planId,
        paymentMethod: 'demo'
      })
      
      // Simulate payment success
      alert(`Demo payment initiated for ${planId} plan!\n\nIn production, you would be redirected to a payment gateway.\n\nDemo API Response: ${JSON.stringify(response.data)}`)
      
    } catch (error) {
      console.error('Payment error:', error)
      alert('Demo payment flow. In production, this would redirect to Stripe/Razorpay.')
    } finally {
      setLoading(null)
    }
  }

  const savingsPercent = 17 // ~17% savings on yearly

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header title="Pricing Plans" subtitle="Choose the perfect plan for you" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Message for Authenticated Users */}
        {isAuthenticated && user && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Welcome, {user.name}!</h3>
                <p className="text-blue-100">
                  You're currently on the <span className="font-semibold uppercase">{user.plan}</span> plan
                  {user.plan === 'free' && ' - Upgrade to unlock all features'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Billing Toggle */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 mb-6">Start free, upgrade when you need more</p>
          
          <div className="inline-flex items-center gap-3 bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save {savingsPercent}%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            const price = plan.price[billingCycle]
            const monthlyPrice = billingCycle === 'yearly' ? Math.round(price / 12) : price
            const isCurrentPlan = isAuthenticated && user?.plan === plan.id

            return (
              <div
                key={plan.id}
                className={`card relative ${
                  plan.popular ? 'ring-2 ring-purple-600 shadow-2xl scale-105' : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      CURRENT PLAN
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <Icon className={`w-12 h-12 ${plan.color} mx-auto mb-4`} />
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">₹{monthlyPrice}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {billingCycle === 'yearly' && price > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{price} billed annually
                    </p>
                  )}
                </div>

                {!isAuthenticated ? (
                  <Link
                    to="/auth"
                    className={`w-full py-3 rounded-lg font-bold mb-6 transition-colors text-center block ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {plan.id === 'free' ? 'Get Started' : 'Sign Up to Subscribe'}
                  </Link>
                ) : isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg font-bold mb-6 bg-green-100 text-green-700 cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full py-3 rounded-lg font-bold mb-6 transition-colors ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50`}
                  >
                    {loading === plan.id ? 'Processing...' : plan.id === 'free' ? 'Downgrade' : 'Upgrade Now'}
                  </button>
                )}

                <div className="space-y-3 mb-4">
                  <p className="font-semibold text-sm text-gray-700">FEATURES:</p>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.limitations.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-sm text-gray-500">✗ {limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Demo Notice */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold text-yellow-900 mb-2">🔑 Demo Mode Active</h3>
            <p className="text-yellow-800 text-sm">
              This is a demo application. Payment buttons use demo API keys and won't charge real money. 
              In production, integrate with Stripe, Razorpay, or another payment provider.
            </p>
            <div className="mt-3 text-xs text-yellow-700 bg-yellow-100 p-3 rounded font-mono">
              Demo API Keys in use (backend .env):<br />
              STRIPE_API_KEY=sk_test_demo123456<br />
              RAZORPAY_KEY_ID=rzp_test_demo123456
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <details className="card">
              <summary className="font-semibold cursor-pointer">Can I cancel anytime?</summary>
              <p className="mt-2 text-gray-600">Yes! Cancel anytime with no questions asked.</p>
            </details>
            <details className="card">
              <summary className="font-semibold cursor-pointer">Do you offer student discounts?</summary>
              <p className="mt-2 text-gray-600">Yes! Contact us with your student ID for special pricing.</p>
            </details>
            <details className="card">
              <summary className="font-semibold cursor-pointer">What payment methods do you accept?</summary>
              <p className="mt-2 text-gray-600">We accept all major credit/debit cards, UPI, and net banking.</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
