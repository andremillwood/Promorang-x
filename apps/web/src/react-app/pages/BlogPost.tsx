import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    Share2,
    Calendar,
    User,
    Tag,
    TrendingUp
} from "lucide-react";
import { Button } from "@/react-app/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Helmet } from "react-helmet-async";
import RelayModal from "@/react-app/components/Relay/RelayModal";
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import api from "@/react-app/lib/api";

interface BlogPostData {
    id: string;
    title: string;
    slug: string;
    content: string;
    summary: string;
    featured_image: string;
    published_at?: string;
    created_at: string;
    platform_tags: string[];
    seo_title?: string;
    seo_description?: string;
    category_id: string;
    category?: {
        name: string;
    };
}

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState<BlogPostData | null>(null);
    const [related, setRelated] = useState<BlogPostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRelayModal, setShowRelayModal] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const postData = await api.get(`/blog/${slug}`);
                setPost(postData);

                // Fetch related posts
                const relatedData = await api.get(`/blog/${slug}/related`);
                setRelated(Array.isArray(relatedData) ? relatedData : []);
            } catch (err) {
                console.error("Failed to fetch post", err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPost();
        }
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    if (!post) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <h1 className="text-2xl font-bold mb-4">Insight Not Found</h1>
            <Button variant="orange">
                <Link to="/blog">Back to Hub</Link>
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-pr-surface-background text-white font-sans">
            <MarketingNav />
            <div className="pb-20">
                <Helmet>
                    <title>{post.seo_title || `${post.title} | Promorang Intelligence`}</title>
                    <meta name="description" content={post.seo_description || post.summary} />
                    <meta property="og:title" content={post.seo_title || post.title} />
                    <meta property="og:image" content={post.featured_image} />
                    <meta property="og:type" content="article" />
                </Helmet>

                {/* Header Image */}
                <div className="w-full h-[40vh] md:h-[60vh] relative">
                    <img
                        src={post.featured_image || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pr-surface-background via-pr-surface-background/40 to-transparent" />
                    <div className="absolute top-6 left-6">
                        <Button variant="ghost" className="bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 hover:text-white border border-white/10">
                            <Link to="/blog" className="flex items-center">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
                    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl">
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
                            <Badge className="bg-orange-500 text-black border-none font-bold">
                                {post.category?.name}
                            </Badge>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> {new Date(post.published_at || post.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <User className="w-4 h-4" /> Promorang Intelligence
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
                            {post.title}
                        </h1>

                        {/* Platform Tags */}
                        <div className="flex gap-2 mb-8">
                            {post.platform_tags?.map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-500 px-3 py-1">
                                    <Tag className="w-3 h-3 mr-1" /> {tag}
                                </Badge>
                            ))}
                        </div>

                        {/* Content */}
                        <div
                            className="prose prose-invert prose-orange max-w-none text-gray-300 leading-relaxed text-lg"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Footer Actions */}
                        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-wrap justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12 border border-zinc-700">
                                    <AvatarFallback className="bg-orange-500 text-black font-bold">PR</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-white">Promorang Team</p>
                                    <p className="text-xs text-gray-400">Platform Strategy</p>
                                </div>
                            </div>

                            <Button
                                variant="orange"
                                className="flex items-center gap-2 shadow-lg shadow-orange-500/20"
                                onClick={() => setShowRelayModal(true)}
                            >
                                <Share2 className="w-4 h-4" /> Relay this Insight
                            </Button>
                        </div>
                    </div>

                    <RelayModal
                        isOpen={showRelayModal}
                        onClose={() => setShowRelayModal(false)}
                        objectType="blog_post"
                        objectId={post.id}
                    />

                    {/* Related Posts */}
                    {related.length > 0 && (
                        <section className="mt-16 mb-20">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-orange-500" /> Related Insights
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {related.map(r => (
                                    <Link key={r.id} to={`/blog/${r.slug}`} className="group block">
                                        <div className="aspect-video rounded-xl overflow-hidden mb-3 border border-zinc-800 relative">
                                            <img
                                                src={r.featured_image || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format"}
                                                alt={r.title}
                                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                        </div>
                                        <h4 className="font-bold leading-tight group-hover:text-orange-400 transition-colors line-clamp-2">
                                            {r.title}
                                        </h4>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
            <MarketingFooter />
        </div>
    );
};

export default BlogPost;
