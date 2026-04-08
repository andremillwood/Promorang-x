import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    TrendingUp,
    Newspaper,
    BookOpen,
    ShoppingBag,
    Megaphone,
    ArrowRight,
    Filter
} from "lucide-react";
import { Button } from "@/react-app/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/react-app/components/ui/Card";
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import api from "@/react-app/lib/api";

interface BlogPostData {
    id: string;
    title: string;
    slug: string;
    summary: string;
    featured_image: string;
    published_at?: string;
    created_at: string;
    platform_tags: string[];
    category?: {
        name: string;
        icon_name?: string;
    };
}

const BlogHub = () => {
    const [posts, setPosts] = useState<BlogPostData[]>([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchCategories();
        fetchPosts();
    }, [activeCategory]);

    const fetchCategories = async () => {
        try {
            const categoriesData = await api.get('/blog/categories');
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (activeCategory) params.category = activeCategory;
            if (searchQuery) params.search = searchQuery;

            // api.get builds url with query params if needed, but simple way is passing params in query string
            // OR standardized api client might support params in options? 
            // Looking at api.ts, it doesn't explicitly support params object in options.
            // So we manually build query string.
            const queryString = new URLSearchParams(params).toString();
            const endpoint = `/blog${queryString ? `?${queryString}` : ''}`;

            const response = await api.get(endpoint);
            setPosts(response.posts || []);
        } catch (err) {
            console.error("Failed to fetch posts", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts();
    };

    const getCategoryIcon = (iconName) => {
        switch (iconName) {
            case 'Newspaper': return <Newspaper className="w-4 h-4" />;
            case 'BookOpen': return <BookOpen className="w-4 h-4" />;
            case 'ShoppingBag': return <ShoppingBag className="w-4 h-4" />;
            case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
            case 'Megaphone': return <Megaphone className="w-4 h-4" />;
            default: return <BookOpen className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-pr-surface-background text-white font-sans">
            <MarketingNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <section className="mb-12 text-center pt-8">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-500">
                        Intelligence Hub
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                        Unlock the secrets of SocialFi, platform updates, and content lineage strategies to grow your impact.
                    </p>

                    <form onSubmit={handleSearch} className="relative max-w-xl mx-auto flex gap-2">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-hover:text-orange-500 transition-colors pointer-events-none" />
                            <Input
                                placeholder="Search guides, news, platforms..."
                                className="pl-11 bg-zinc-900/50 border-zinc-800 text-white h-12 focus:border-orange-500/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="orange" className="h-12 px-8 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
                            Search
                        </Button>
                    </form>
                </section>

                {/* Categories Bar */}
                <section className="mb-12 flex flex-wrap gap-2 justify-center">
                    <Button
                        variant={!activeCategory ? "orange" : "ghost"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setActiveCategory(null)}
                    >
                        All Insights
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat.id}
                            variant={activeCategory === cat.id ? "orange" : "ghost"}
                            size="sm"
                            className="rounded-full flex gap-2 items-center hover:bg-zinc-800"
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {getCategoryIcon(cat.icon_name)}
                            {cat.name}
                        </Button>
                    ))}
                </section>

                {/* Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[400px] rounded-2xl bg-zinc-900 animate-pulse" />
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {posts.map(post => (
                            <Card key={post.id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden group hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col">
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={post.featured_image || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format"}
                                        alt={post.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <Badge className="bg-orange-500 text-black border-none font-bold shadow-lg">
                                            {post.category?.name}
                                        </Badge>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                </div>
                                <CardHeader className="p-6 pb-2">
                                    <div className="flex gap-2 mb-2">
                                        {post.platform_tags?.map(tag => (
                                            <span key={tag} className="text-[10px] uppercase tracking-widest text-yellow-500 font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-xl font-bold leading-tight group-hover:text-orange-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 flex-1">
                                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                                        {post.summary}
                                    </p>
                                </CardContent>
                                <CardFooter className="p-6 pt-0 border-t border-zinc-800/50 flex justify-between items-center mt-auto">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {new Date(post.published_at || post.created_at).toLocaleDateString()}
                                    </span>
                                    <Button variant="link" className="text-orange-500 p-0 flex items-center gap-1 group/btn hover:no-underline">
                                        <Link to={`/blog/${post.slug}`} className="flex items-center gap-1">
                                            Read More <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl mb-20">
                        <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-gray-500">No matching insights found. Try a different search.</p>
                    </div>
                )}

                {/* Newsletter / CTA */}
                <section className="mt-8 p-8 md:p-12 rounded-[2rem] bg-gradient-to-br from-orange-600 to-yellow-500 text-black text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/5 pattern-dots" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4">Stay Ahead of the Curve</h2>
                        <p className="font-medium opacity-80 mb-8 max-w-xl mx-auto">
                            Get weekly intelligence on TikTok algorithm shifts, Shopify ROI hacks, and SocialFi growth strategies.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <Input placeholder="your@email.com" className="bg-white/20 border-black/10 placeholder:text-black/60 h-12 text-black" />
                            <Button variant="primary" className="bg-black text-white h-12 px-8 font-bold hover:bg-zinc-800 border-none">
                                Join the Hub
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
            <MarketingFooter />
        </div>
    );
};

export default BlogHub;
