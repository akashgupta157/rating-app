import { useState } from "react";
import type { Store } from "../type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";

interface StoreCardProps {
  store: Store;
  onRate: (storeId: string, rating: number, comment?: string) => Promise<void>;
}

export function StoreCard({ store, onRate }: StoreCardProps) {
  const [userRating, setUserRating] = useState(store.userRating || 0);
  const [tempRating, setTempRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = async (rating: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onRate(store.id, rating);
      setUserRating(rating);
    } catch (err: any) {
      console.error("Failed to submit rating:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 3.5) return "Good";
    if (rating >= 2.5) return "Average";
    if (rating >= 1.5) return "Fair";
    return "Poor";
  };

  return (
    <Card className="group hover:shadow-lg border-2 hover:border-primary/20 transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="font-bold text-foreground text-xl leading-tight">
            {store.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-start text-muted-foreground">
            <MapPin className="mt-0.5 mr-3 w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{store.address}</span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center bg-muted/30 px-4 py-3 rounded-lg">
            <span className="font-semibold text-foreground text-sm">
              Your Rating:
            </span>
            <span
              className={`font-medium text-sm ${
                userRating > 0 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {userRating > 0 ? (
                <span className="flex items-center gap-1.5">
                  {userRating}{" "}
                  <Star className="fill-yellow-400 w-4 h-4 text-yellow-400" />
                </span>
              ) : (
                "Not rated yet"
              )}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="flex space-x-1 bg-background p-2 rounded-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRating(star)}
                    disabled={isSubmitting}
                    onMouseEnter={() => setTempRating(star)}
                    onMouseLeave={() => setTempRating(0)}
                    className="hover:bg-transparent p-2 rounded-full h-auto transition-all duration-150"
                    aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-7 h-7 transition-all ${
                        star <= (tempRating || userRating)
                          ? "fill-yellow-400 text-yellow-400 scale-110"
                          : "text-gray-300 hover:text-yellow-200"
                      } ${
                        isSubmitting
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between px-2 font-medium text-muted-foreground text-xs">
              <span className="w-16 text-center">Poor</span>
              <span className="w-16 text-center">Fair</span>
              <span className="w-16 text-center">Average</span>
              <span className="w-16 text-center">Good</span>
              <span className="w-16 text-center">Excellent</span>
            </div>
          </div>
        </div>

        {store.overallRating && (
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <span className="font-medium text-foreground text-sm">
                  Community Rating
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-bold ${getRatingColor(
                      store.overallRating
                    )}`}
                  >
                    {store.overallRating.toFixed(1)}
                  </span>
                  <Badge variant="outline" className="font-normal text-xs">
                    {getRatingLabel(store.overallRating)}
                  </Badge>
                </div>
              </div>
              <div className="text-muted-foreground text-sm text-right">
                <div className="flex justify-end items-center gap-1.5 mb-1">
                  <Star
                    className={`w-4 h-4 ${getRatingColor(store.overallRating)}`}
                  />
                  <span className="font-medium">
                    {store.overallRating.toFixed(1)}
                  </span>
                </div>
                <span>{store.totalRatings?.toLocaleString()} reviews</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
