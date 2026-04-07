import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Basic validation
    if (!formData.full_name.trim()) {
      setError('Please enter your name')
      setLoading(false)
      return
    }
    if (!formData.email.trim()) {
      setError('Please enter your email')
      setLoading(false)
      return
    }
    if (!formData.subject.trim()) {
      setError('Please enter a subject')
      setLoading(false)
      return
    }
    if (!formData.message.trim()) {
      setError('Please enter your message')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(`${API_URL}/api/contact/submit`, formData)
      
      if (response.data.success) {
        setSuccess(true)
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
        
        // Hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about CodeCampus AI? We're here to help. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-gray-600 mb-8">
                  Reach out to us through any of these channels. We're always happy to hear from you!
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:support@codecampus.ai" className="text-blue-600 hover:underline">
                      support@codecampus.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <a href="tel:+911234567890" className="text-green-600 hover:underline">
                      +91 123 456 7890
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600">
                      Bangalore, Karnataka<br />
                      India
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl text-white">
                <h3 className="font-bold text-lg mb-2">Quick Response</h3>
                <p className="text-blue-100 text-sm">
                  We typically respond within 24 hours during business days. For urgent matters, please call us directly.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Message Sent Successfully!</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Thank you for contacting us. We'll get back to you soon.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900">Error</h4>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Quick answers to common questions. Can't find what you're looking for? Contact us!
            </p>
          </div>

          <div className="space-y-4">
            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                How quickly will I receive a response?
              </summary>
              <p className="mt-3 text-gray-600">
                We typically respond within 24 hours during business days (Monday-Friday). For urgent matters, please call us directly.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What information should I include in my message?
              </summary>
              <p className="mt-3 text-gray-600">
                Please provide as much detail as possible about your inquiry, including your account email if you're an existing user, and any relevant screenshots or error messages.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Do you offer phone support?
              </summary>
              <p className="mt-3 text-gray-600">
                Yes! You can reach us at +91 123 456 7890 during business hours (10 AM - 6 PM IST, Monday-Friday).
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Can I schedule a demo or consultation?
              </summary>
              <p className="mt-3 text-gray-600">
                Absolutely! Mention "Demo Request" in your subject line, and we'll arrange a convenient time to walk you through the platform.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students preparing for their dream placements with CodeCampus AI.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
