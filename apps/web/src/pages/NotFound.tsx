import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Compass, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Ambient Background Washes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none opacity-50" />

      <div className="max-w-md w-full text-center relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted/50 mb-6 group hover:scale-110 transition-transform duration-500">
            <span className="font-serif text-4xl font-bold text-muted-foreground group-hover:text-primary transition-colors">404</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Lost in the <span className="italic text-primary">moment</span>?
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            The page you're looking for has moved to a different timeline or never existed in this one.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="hero" size="lg" className="w-full rounded-2xl shadow-soft hover:shadow-primary/20 transition-all duration-300">
            <Link to="/discover">
              <Compass className="w-4 h-4 mr-2" />
              Discover
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full rounded-2xl bg-background/50 backdrop-blur-sm border-border/50 hover:bg-muted/50 transition-all duration-200" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        <div className="mt-12 text-sm text-muted-foreground font-medium flex items-center justify-center gap-6">
          <Link to="/" className="hover:text-primary transition-colors">Home Base</Link>
          <Link to="/auth" className="hover:text-primary transition-colors">Join Us</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
