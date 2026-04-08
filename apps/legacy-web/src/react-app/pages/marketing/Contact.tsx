import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Contact() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Thanks! We'll be in touch shortly.");
    };

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-20 bg-pr-surface-background overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Touch</span>
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-2xl mx-auto">
                        We'd love to hear from you. Here's how you can reach us.
                    </p>
                </div>
            </section>

            <section className="py-12 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-2xl font-bold text-pr-text-1 mb-6">Contact Information</h2>
                            <p className="text-pr-text-2 mb-8 leading-relaxed">
                                Fill out the form or reach out to us directly through one of the channels below.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-pr-text-1">General Inquiries</div>
                                        <a href="mailto:hello@promorang.com" className="text-pr-text-2 hover:text-blue-500 transition-colors">hello@promorang.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-500">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-pr-text-1">Support</div>
                                        <a href="mailto:support@promorang.com" className="text-pr-text-2 hover:text-purple-500 transition-colors">support@promorang.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 text-green-500">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-pr-text-1">Headquarters</div>
                                        <p className="text-pr-text-2">Los Angeles, CA</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 shadow-lg">
                            <h2 className="text-2xl font-bold text-pr-text-1 mb-6">Send us a message</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-pr-text-1 mb-1">First Name</label>
                                        <Input id="firstName" placeholder="John" required />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-pr-text-1 mb-1">Last Name</label>
                                        <Input id="lastName" placeholder="Doe" required />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-pr-text-1 mb-1">Email</label>
                                    <Input id="email" type="email" placeholder="john@example.com" required />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-pr-text-1 mb-1">Subject</label>
                                    <select className="w-full px-3 py-2 bg-pr-surface-background border border-pr-border rounded-md text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>General Inquiry</option>
                                        <option>Partnership</option>
                                        <option>Support</option>
                                        <option>Press</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-pr-text-1 mb-1">Message</label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        className="w-full px-3 py-2 bg-pr-surface-background border border-pr-border rounded-md text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="How can we help you?"
                                        required
                                    ></textarea>
                                </div>

                                <Button type="submit" variant="primary" className="w-full gap-2 btn-shine">
                                    Send Message <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
