import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, MapPin, CheckCircle2, Star, Users, Layout, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizationCardProps {
    id: string;
    name: string;
    type: "brand" | "merchant" | "host";
    logo?: string;
    description?: string;
    category?: string;
    location?: string;
    verified?: boolean;
    website?: string;
    stats?: {
        label: string;
        value: string | number;
        icon: React.ReactNode;
    }[];
    className?: string;
}

export const OrganizationCard = ({
    id,
    name,
    type,
    logo,
    description,
    category,
    location,
    verified,
    website,
    stats,
    className
}: OrganizationCardProps) => {
    const getProfilePath = () => {
        switch (type) {
            case "brand": return `/brands/${id}`;
            case "merchant": return `/merchants/${id}`;
            case "host": return `/hosts/${id}`;
            default: return `/profile/${id}`;
        }
    };

    const getRoleIcon = () => {
        switch (type) {
            case "brand": return <Layout className="w-4 h-4" />;
            case "merchant": return <ShoppingBag className="w-4 h-4" />;
            case "host": return <Users className="w-4 h-4" />;
        }
    };

    return (
        <Card
            className={cn("overflow-hidden hover:shadow-lg transition-all duration-300 group", className)}
            data-tour="directory-card"
        >
            <CardHeader className="p-4 flex flex-row items-start space-x-4">
                <Avatar className="w-16 h-16 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                    <AvatarImage src={logo} alt={name} />
                    <AvatarFallback className="text-xl font-bold bg-primary/5">
                        {name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider gap-1 pl-1">
                            {getRoleIcon()}
                            {type}
                        </Badge>
                        {verified && (
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        )}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {name}
                    </CardTitle>
                    {location && (
                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                            <MapPin className="w-3 h-3" />
                            {location}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-4 py-2 space-y-3">
                {category && (
                    <div className="text-xs font-medium text-primary/80">
                        {category}
                    </div>
                )}
                <CardDescription className="text-sm line-clamp-3 min-h-[4.5rem]">
                    {description || "No description provided."}
                </CardDescription>

                {stats && stats.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 rounded-md bg-muted/50">
                                <span className="text-muted-foreground">{stat.icon}</span>
                                <span className="font-semibold">{stat.value}</span>
                                <span className="text-[10px] text-muted-foreground border-l pl-2 ml-auto">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-2 flex items-center justify-between gap-3 border-t bg-muted/20">
                {website ? (
                    <Button variant="ghost" size="sm" asChild className="h-8 group/link">
                        <a href={website} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4 mr-2 group-hover/link:animate-pulse" />
                            Website
                        </a>
                    </Button>
                ) : (
                    <div className="flex-1" />
                )}
                <Button size="sm" asChild className="h-8 shadow-sm">
                    <Link to={getProfilePath()}>
                        View Profile
                        <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

// Reusable ArrowRight since it's common
const ArrowRight = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);
