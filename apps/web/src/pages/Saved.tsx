import { useState } from "react";
import { SavedCollections } from "@/components/SavedCollections";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockCollections = [
    {
        id: "default",
        name: "All Saved",
        isDefault: true,
        moments: [
            {
                id: "m1",
                title: "Sunset Yoga at the Park",
                description: "Join us for a relaxing evening yoga session",
                category: "fitness",
                starts_at: new Date(Date.now() + 3 * 24 * 3600000).toISOString(),
                location: "Central Park",
                image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
                host_id: "host1",
                max_participants: 20,
                reward: "Free yoga mat",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: "m2",
                title: "Coffee Tasting Experience",
                description: "Explore artisan coffee from around the world",
                category: "food",
                starts_at: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
                location: "Local Roastery",
                image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
                host_id: "host2",
                max_participants: 15,
                reward: "Coffee sampler pack",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ],
    },
    {
        id: "weekend",
        name: "Weekend Plans",
        moments: [
            {
                id: "m3",
                title: "Hiking Adventure",
                description: "Explore beautiful mountain trails",
                category: "outdoor",
                starts_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
                location: "Mountain View Trail",
                image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400",
                host_id: "host3",
                max_participants: 25,
                reward: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ],
    },
    {
        id: "foodie",
        name: "Foodie Finds",
        moments: [],
    },
];

const Saved = () => {
    const { toast } = useToast();
    const [collections, setCollections] = useState(mockCollections);

    const handleCreateCollection = (name: string) => {
        toast({
            title: "Collection created",
            description: `"${name}" is ready for you to add moments`,
        });
        // TODO: Persist to Supabase
    };

    const handleDeleteCollection = (id: string) => {
        setCollections(prev => prev.filter(c => c.id !== id));
        toast({
            title: "Collection deleted",
            description: "The collection has been removed",
        });
        // TODO: Persist to Supabase
    };

    return (
        <div className="min-h-screen bg-background">

            <main className="pt-20 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <SavedCollections
                        collections={collections as any}
                        onCreateCollection={handleCreateCollection}
                        onDeleteCollection={handleDeleteCollection}
                    />
                </div>
            </main>

        </div>
    );
};

export default Saved;
