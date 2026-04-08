import { Camera, Star, Image as ImageIcon, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserMedia, useUserReviews } from "@/hooks/useUGC";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function UGCSection() {
  const { data: media, isLoading: mediaLoading } = useUserMedia();
  const { data: reviews, isLoading: reviewsLoading } = useUserReviews();

  return (
    <div className="space-y-4">
      <Tabs defaultValue="media" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            My Media
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            My Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="mt-4">
          {mediaLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : media && media.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  {item.media_type === "video" ? (
                    <video
                      src={item.media_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.caption || "Moment media"}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <div className="text-white text-xs">
                      <p className="font-medium truncate">{item.caption || "No caption"}</p>
                      <p className="text-white/70">{item.view_count} views</p>
                    </div>
                  </div>
                  {/* Status indicator */}
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                    item.moderation_status === "approved" 
                      ? "bg-emerald-500" 
                      : item.moderation_status === "rejected"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border p-8 text-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No media uploaded yet</p>
              <p className="text-sm text-muted-foreground">
                Capture and share your moment experiences to earn points
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          {reviewsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card rounded-xl p-4 border border-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      review.moderation_status === "approved"
                        ? "bg-emerald-500/20 text-emerald-500"
                        : review.moderation_status === "rejected"
                        ? "bg-red-500/20 text-red-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}>
                      {review.moderation_status}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-foreground mb-1">{review.title}</h4>
                  )}
                  {review.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.content}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{format(new Date(review.created_at), "MMM d, yyyy")}</span>
                    {review.is_verified_participant && (
                      <span className="text-primary">✓ Verified Participant</span>
                    )}
                    <span>{review.helpful_count} found helpful</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No reviews written yet</p>
              <p className="text-sm text-muted-foreground">
                Share your experience after attending moments
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
