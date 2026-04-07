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
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
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
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Contact Information</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Reach out to us through any of these channels. We're always happy to hear from you!
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">Email</h3>
                    <a href="mailto:support@codecampus.ai" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                      support@codecampus.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">Phone</h3>
                    <a href="tel:+911234567890" className="text-sm text-green-600 hover:text-green-700 transition-colors">
                      +91 123 456 7890
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">Location</h3>
                    <p className="text-sm text-slate-600">
                      Bangalore, Karnataka<br />
                      India
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-5 bg-slate-100 rounded-xl border-l-4 border-blue-600">
                <h3 className="font-bold text-slate-900 text-sm mb-2">Quick Response</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We typically respond within 24 hours during business days. For urgent matters, please call us directly.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 text-sm">Message Sent Successfully!</h4>
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
                      <h4 className="font-semibold text-red-900 text-sm">Error</h4>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number <span className="text-slate-400 text-xs">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-600">
              Quick answers to common questions. Can't find what you're looking for? Contact us!
            </p>
          </div>

          <div className="space-y-3">
            <details className="bg-white rounded-lg p-5 border border-slate-200 hover:border-slate-300 transition-colors group">
              <summary className="font-semibold text-slate-900 cursor-pointer text-sm">
                How quickly will I receive a response?
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                We typically respond within 24 hours during business days (Monday-Friday). For urgent matters, please call us directly.
              </p>
            </details>

            <details className="bg-white rounded-lg p-5 border border-slate-200 hover:border-slate-300 transition-colors group">
              <summary className="font-semibold text-slate-900 cursor-pointer text-sm">
                What information should I include in my message?
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Please provide as much detail as possible about your inquiry, including your account email if you're an existing user, and any relevant screenshots or error messages.
              </p>
            </details>

            <details className="bg-white rounded-lg p-5 border border-slate-200 hover:border-slate-300 transition-colors group">
              <summary className="font-semibold text-slate-900 cursor-pointer text-sm">
                Do you offer phone support?
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Yes! You can reach us at +91 123 456 7890 during business hours (10 AM - 6 PM IST, Monday-Friday).
              </p>
            </details>

            <details className="bg-white rounded-lg p-5 border border-slate-200 hover:border-slate-300 transition-colors group">
              <summary className="font-semibold text-slate-900 cursor-pointer text-sm">
                Can I schedule a demo or consultation?
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Absolutely! Mention "Demo Request" in your subject line, and we'll arrange a convenient time to walk you through the platform.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join thousands of students preparing for their dream placements with CodeCampus AI.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
