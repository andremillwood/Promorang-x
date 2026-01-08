import { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Heart, MessageSquare, Loader2 } from 'lucide-react';
import eventsService from '@/react-app/services/events';

interface EventGalleryProps {
    eventId: string;
    hasRsvp: boolean;
}

export default function EventGallery({ eventId, hasRsvp }: EventGalleryProps) {
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    const [newMediaUrl, setNewMediaUrl] = useState('');
    const [caption, setCaption] = useState('');

    useEffect(() => {
        fetchMedia();
    }, [eventId]);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const data = await eventsService.getEventMedia(eventId);
            setMedia(data);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMediaUrl) return;

        try {
            setUploading(true);
            await eventsService.uploadEventMedia(eventId, {
                media_url: newMediaUrl,
                caption,
                media_type: 'image'
            });
            setNewMediaUrl('');
            setCaption('');
            setShowUpload(false);
            fetchMedia();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload media');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-pr-text-3">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span>Loading community gallery...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-pr-text-1">Community Gallery</h2>
                    <p className="text-sm text-pr-text-2">Photos & videos from attendees</p>
                </div>
                {hasRsvp && (
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors"
                    >
                        {showUpload ? <ImageIcon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showUpload ? 'View Gallery' : 'Upload Photo'}
                    </button>
                )}
            </div>

            {showUpload ? (
                <div className="bg-pr-surface-2 border border-pr-border rounded-2xl p-6 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="font-bold text-pr-text-1 mb-4">Share a moment</h3>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-pr-text-2 mb-2">Image URL</label>
                            <input
                                type="url"
                                value={newMediaUrl}
                                onChange={(e) => setNewMediaUrl(e.target.value)}
                                placeholder="Paste an image link..."
                                className="w-full px-4 py-3 bg-white border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-pr-text-2 mb-2">Caption (Optional)</label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                rows={2}
                                placeholder="What's happening in this photo?"
                                className="w-full px-4 py-3 bg-white border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowUpload(false)}
                                className="px-6 py-2 text-pr-text-2 hover:text-pr-text-1 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="px-8 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Post to Gallery'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-pr-surface-2 border border-dashed border-pr-border rounded-2xl text-pr-text-3">
                    <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p>No photos shared yet.</p>
                    {hasRsvp && <p className="text-sm mt-1">Be the first to share a moment!</p>}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {media.map((item) => (
                        <div key={item.id} className="group relative aspect-square bg-pr-surface-2 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <img
                                src={item.media_url}
                                alt={item.caption}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                {item.caption && (
                                    <p className="text-white text-xs line-clamp-2 mb-2">{item.caption}</p>
                                )}
                                <div className="flex items-center justify-between text-white/80">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Heart className="w-3 h-3" />
                                            <span className="text-[10px]">0</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            <span className="text-[10px]">0</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px]">@{item.user_id.slice(0, 5)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
