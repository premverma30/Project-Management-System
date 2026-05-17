import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-8">
        <SearchX className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-4xl font-bold tracking-tight mb-4">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button size="lg" variant="primary">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
