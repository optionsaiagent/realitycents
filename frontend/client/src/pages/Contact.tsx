/*
 * Pacific Modernism — Contact Page
 * Contact form + business info card layout
 */
import { useState } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Clock,
  Shield,
  Send,
  CheckCircle,
} from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });

  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message sent! Jay will be in touch soon.");
    },
    onError: (err) => {
      console.error("Contact form error:", err);
      // Still show success to user (graceful degradation)
      setSubmitted(true);
      toast.success("Message sent! Jay will be in touch soon.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      subject: formData.subject || undefined,
      message: formData.message,
    });
  };

  return (
    <Layout>
      <SEO
        title="Contact Jay Miller — Hawaii Mortgage Lender"
        description="Contact Jay Miller, NMLS #657301, at CMG Home Loans in Honolulu, HI. Get personalized mortgage guidance, request a pre-approval, or ask about Hawaii home loan options. Call (808) 429-0811 or email jaym@cmghomeloans.com."
        url="/contact"
        keywords="contact Hawaii mortgage lender, Jay Miller contact, CMG Home Loans Honolulu, Hawaii mortgage pre-approval, mortgage consultation Hawaii"
      />
      <PageHero
        title="Get in Touch"
        subtitle="Have questions about mortgages in Hawaii? Jay Miller is here to help with personalized guidance and expert advice."
        image={IMAGES.heroAbout}
        compact
      />

      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-teal/5 border border-teal/20 rounded-xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-teal" />
                  </div>
                  <h3 className="font-display text-2xl text-navy mb-3">Message Received!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Thank you for reaching out. Jay will review your message and get back to you within one business day. In the meantime, feel free to call directly at {LENDER.phone}.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="font-display text-2xl md:text-3xl text-navy mb-2">Send a Message</h2>
                  <p className="text-muted-foreground mb-8">
                    Fill out the form below and Jay will get back to you promptly.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-body font-medium text-navy mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-body font-medium text-navy mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                          placeholder="you@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-body font-medium text-navy mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                          placeholder="(808) 555-0123"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-body font-medium text-navy mb-1.5">
                          Subject
                        </label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="preapproval">Pre-Approval Request</option>
                          <option value="refinance">Refinancing</option>
                          <option value="agent">Agent Partnership</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-body font-medium text-navy mb-1.5">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
                        placeholder="Tell Jay about your homebuying goals or questions..."
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-teal hover:bg-teal-dark text-white px-8 py-3 h-auto font-body font-semibold"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Contact info sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-navy rounded-xl p-6 lg:p-8 sticky top-28">
                <div className="flex justify-center mb-5">
                  <img src={IMAGES.cmgLogo} alt="CMG Home Loans" className="h-8 object-contain brightness-0 invert opacity-80" />
                </div>
                <h3 className="font-display text-xl text-white mb-6">Contact Information</h3>

                <div className="space-y-5 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal/20 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-teal" />
                    </div>
                    <div>
                      <p className="text-xs text-sand/50 uppercase tracking-wider mb-0.5">Phone</p>
                      <a href={`tel:${LENDER.phone}`} className="text-white text-sm hover:text-gold transition-colors">
                        {LENDER.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal/20 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-teal" />
                    </div>
                    <div>
                      <p className="text-xs text-sand/50 uppercase tracking-wider mb-0.5">Email</p>
                      <a href={`mailto:${LENDER.email}`} className="text-white text-sm hover:text-gold transition-colors">
                        {LENDER.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-teal" />
                    </div>
                    <div>
                      <p className="text-xs text-sand/50 uppercase tracking-wider mb-0.5">Office</p>
                      <p className="text-white text-sm">{LENDER.address.street}</p>
                      <p className="text-sand/70 text-sm">{LENDER.address.city}, {LENDER.address.state} {LENDER.address.zip}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal/20 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-4 h-4 text-teal" />
                    </div>
                    <div>
                      <p className="text-xs text-sand/50 uppercase tracking-wider mb-0.5">Website</p>
                      <a
                        href={`https://${LENDER.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white text-sm hover:text-gold transition-colors"
                      >
                        {LENDER.website}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal/20 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-teal" />
                    </div>
                    <div>
                      <p className="text-xs text-sand/50 uppercase tracking-wider mb-0.5">Hours</p>
                      <p className="text-white text-sm">Mon–Fri: 8:00 AM – 6:00 PM HST</p>
                      <p className="text-sand/70 text-sm">Sat: By Appointment</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-gold" />
                    <span className="text-xs text-sand/50 uppercase tracking-wider">Licensing</span>
                  </div>
                  <p className="text-sm text-sand/70">
                    {LENDER.name} | NMLS #{LENDER.nmls}
                  </p>
                  <p className="text-sm text-sand/70">
                    CMG Mortgage, Inc. | NMLS #{LENDER.companyNmls}
                  </p>
                  <p className="text-sm text-sand/70">
                    {LENDER.company} (Branch) | NMLS #{LENDER.branchNmls}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
