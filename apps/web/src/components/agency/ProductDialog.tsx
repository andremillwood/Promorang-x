import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProduct, useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Package, DollarSign, Tag } from "lucide-react";

const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    price: z.coerce.number().min(0).optional().nullable(),
    type: z.enum(["physical", "service", "digital"]),
    status: z.string().default("active"),
    image_url: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    product?: any;
    organizationId: string;
}

export function ProductDialog({
    isOpen,
    onClose,
    product,
    organizationId,
}: ProductDialogProps) {
    const [loading, setLoading] = useState(false);
    const createProduct = useCreateProduct();
    const isEditing = !!product;

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            type: "service",
            status: "active",
            image_url: "",
        },
    });

    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name,
                description: product.description || "",
                price: product.price || 0,
                type: product.type,
                status: product.status,
                image_url: product.image_url || "",
            });
        } else {
            form.reset({
                name: "",
                description: "",
                price: 0,
                type: "service",
                status: "active",
                image_url: "",
            });
        }
    }, [product, form]);

    const onSubmit = async (values: ProductFormValues) => {
        setLoading(true);
        try {
            if (isEditing) {
                const { error } = await supabase
                    .from("products")
                    .update({
                        ...values,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", product.id);

                if (error) throw error;
                toast.success("Product updated successfully");
            } else {
                await createProduct.mutateAsync({
                    name: values.name,
                    description: values.description || null,
                    price: values.price || null,
                    type: values.type,
                    status: values.status,
                    image_url: values.image_url || null,
                    organization_id: organizationId,
                    currency: "USD",
                    metadata: {},
                });
            }
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                        {isEditing ? "Edit Item" : "Add to Catalog"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update your service details." : "Define a new service, expertise, or product."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-muted-foreground" />
                                        Item Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Professional Photography" {...field} className="rounded-xl shadow-inner" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-muted-foreground" />
                                            Type
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl shadow-inner">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="service">Service (Time/Skill)</SelectItem>
                                                <SelectItem value="digital">Digital Product</SelectItem>
                                                <SelectItem value="physical">Physical Good</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                                            Base Price
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} className="rounded-xl shadow-inner" />
                                        </FormControl>
                                        <FormDescription className="text-[10px]">Set to 0 for custom quotes</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detail what's included and your expertise..."
                                            className="min-h-[100px] rounded-xl shadow-inner"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="image_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cover Image URL (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} className="rounded-xl shadow-inner" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0 pt-4">
                            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="rounded-xl px-8 shadow-soft">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    isEditing ? "Update Item" : "Add to Catalog"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
