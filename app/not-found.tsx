import Link from "next/link";
import { Home, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex min-h-[calc(100vh-16rem)] items-center justify-center bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-border bg-background shadow-sm sm:size-20">
          <SearchX className="size-8 text-primary sm:size-10" aria-hidden="true" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Error 404
        </p>
        <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
          The page you&apos;re looking for may have moved, been removed, or never
          existed.
        </p>

        <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
          <Link href="/">
            <Home aria-hidden="true" />
            Back to home
          </Link>
        </Button>
      </div>
    </section>
  );
}
