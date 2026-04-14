import { useState } from "react";
import { SavedCollections } from "@/components/SavedCollections";
import { useToast } from "@/hooks/use-toast";
import { demoMoments } from "@/data/demo-moments";

// Initial collections for demonstration
const initialCollections = [
    {
        id: "default",
        name: "All Saved",
        isDefault: true,
        moments: demoMoments.slice(0, 3),
    },
    {
        id: "weekend",
        name: "Weekend Plans",
        moments: demoMoments.slice(3, 1),
    },
    {
        id: "foodie",
        name: "Foodie Finds",
        moments: [],
    },
];

const Saved = () => {
    const { toast } = useToast();
    const [collections, setCollections] = useState(initialCollections);

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
