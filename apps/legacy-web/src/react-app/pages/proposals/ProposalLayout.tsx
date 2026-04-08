import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Menu, X, ArrowRight } from "lucide-react";

interface Section {
    id: string;
    label: string;
}

interface ProposalLayoutProps {
    children: React.ReactNode;
    sections: Section[];
    title: string;
    subtitle?: string;
}

const ProposalLayout: React.FC<ProposalLayoutProps> = ({ children, sections, title }) => {
    const location = useLocation();
    const [activeSection, setActiveSection] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;
            const currentSection = sections.find((section) => {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    return scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight;
                }
                return false;
            });

            if (currentSection) {
                setActiveSection(currentSection.id);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [sections]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/" className="font-bold text-xl tracking-tight text-slate-900 hover:text-blue-600 transition-colors">
                                DRYVA
                            </Link>
                            <div className="hidden md:flex items-center gap-2 text-slate-400">
                                <ChevronRight size={16} />
                                <span className="text-sm font-medium text-slate-600">{title}</span>
                            </div>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden lg:flex items-center gap-8">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`text-sm font-medium transition-all hover:text-blue-600 ${activeSection === section.id ? "text-blue-600" : "text-slate-500"
                                        }`}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-white border-b border-slate-100 overflow-hidden"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`block w-full text-left px-3 py-4 text-base font-medium border-l-2 transition-all ${activeSection === section.id
                                            ? "bg-blue-50 border-blue-600 text-blue-600"
                                            : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                    >
                                        {section.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="pt-16">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-slate-500 text-sm mb-4">Dryva Mobility Proposal &copy; {new Date().getFullYear()}</p>
                    <div className="flex justify-center gap-8">
                        <Link to="/privacy" className="text-slate-400 hover:text-slate-600 text-xs">Privacy Policy</Link>
                        <Link to="/terms" className="text-slate-400 hover:text-slate-600 text-xs">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ProposalLayout;
