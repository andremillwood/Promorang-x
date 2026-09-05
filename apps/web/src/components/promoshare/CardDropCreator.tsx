import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CardDropCreator() {
  return (
    <Card>
      <CardHeader><CardTitle>Give someone a reason to go</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Choose an available perk or offer something you can fulfill. Share its link so people can claim it on their PromoCard.</p>
        <Button asChild><Link to="/give">Choose a perk to give</Link></Button>
      </CardContent>
    </Card>
  );
}
