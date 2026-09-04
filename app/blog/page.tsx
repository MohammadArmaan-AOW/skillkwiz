"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Clock3, Search, Sparkles } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { articles, categories, Category } from "@/lib/data/blog";
import Reveal from "@/components/motion-reveal";

function ArticleLink({ className }: { className?: string }) {
    return (
        <a
            href="/downloads/dummy-article.pdf"
            download
            className={cn(
                "inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                className,
            )}
        >
            Read article{" "}
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
    );
}

export default function BlogPage() {
    const [activeCategory, setActiveCategory] = useState<Category>("All");
    const [query, setQuery] = useState("");
    const featuredArticle = articles[0];
    const filteredArticles = useMemo(
        () =>
            articles
                .slice(1)
                .filter(
                    (article) =>
                        (activeCategory === "All" ||
                            article.category === activeCategory) &&
                        `${article.title} ${article.excerpt}`
                            .toLowerCase()
                            .includes(query.trim().toLowerCase()),
                ),
        [activeCategory, query],
    );

    return (
        <div className="overflow-hidden bg-background text-foreground">
            <section className="relative isolate border-b border-border/60 pt-24 sm:pt-28">
                <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_5%,hsl(var(--primary)/.2),transparent_28%),radial-gradient(circle_at_15%_85%,hsl(var(--secondary)/.1),transparent_26%)]" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/.32)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/.32)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                <div className="mx-auto max-w-6xl px-5 pb-12 pt-11 sm:px-6 sm:pb-16 lg:pt-14">
                    <Reveal className="mx-auto max-w-3xl text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                            <Sparkles className="size-3.5" /> SkillKwiz journal
                        </div>
                        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                            Ideas for the people building{" "}
                            <span className="text-primary">what’s next.</span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                            Practical perspectives on skills, learning, and the
                            changing world of work.
                        </p>
                    </Reveal>
                    <Reveal delay={0.12} className="mx-auto mt-7 max-w-xl">
                        <label className="relative block">
                            <span className="sr-only">Search articles</span>
                            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Search the journal"
                                className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </label>
                    </Reveal>
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
                <Reveal>
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-secondary uppercase tracking-wide">
                                Editor&apos;s pick
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-primary tracking-tight sm:text-3xl">
                                Start here
                            </h2>
                        </div>
                        <span className="hidden text-sm text-muted-foreground sm:block">
                            Fresh thinking, made useful.
                        </span>
                    </div>
                    <article className="group grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5 md:grid-cols-[1.1fr_.9fr]">
                        <div className="relative min-h-60 overflow-hidden md:min-h-80">
                            <Image
                                src={featuredArticle.image}
                                alt="Professional developing new skills"
                                fill
                                priority
                                sizes="(min-width: 768px) 55vw, 100vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        <div className="flex flex-col justify-center p-6 sm:p-8">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-secondary">
                                <BookOpen className="size-3.5" />{" "}
                                {featuredArticle.category}
                            </div>
                            <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                {featuredArticle.title}
                            </h3>
                            <p className="mt-3 leading-7 text-muted-foreground">
                                {featuredArticle.excerpt}
                            </p>
                            <div className="mt-5 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock3 className="size-3.5" />
                                    {featuredArticle.readTime}
                                </span>
                                <ArticleLink />
                            </div>
                        </div>
                    </article>
                </Reveal>

                <section
                    className="mt-12 sm:mt-16"
                    aria-labelledby="latest-heading"
                >
                    <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-secondary uppercase tracking-wide">
                                Explore the journal
                            </p>
                            <h2
                                id="latest-heading"
                                className="mt-1 text-2xl font-semibold text-primary tracking-tight sm:text-3xl"
                            >
                                Latest insights
                            </h2>
                        </div>
                        <div
                            className="flex max-w-full gap-2 overflow-x-auto pb-1"
                            role="tablist"
                            aria-label="Article categories"
                        >
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    type="button"
                                    size="sm"
                                    variant={
                                        activeCategory === category
                                            ? "default"
                                            : "outline"
                                    }
                                    role="tab"
                                    aria-selected={activeCategory === category}
                                    onClick={() => setActiveCategory(category)}
                                    className="shrink-0 rounded-full"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </Reveal>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${activeCategory}-${query}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22 }}
                            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {filteredArticles.map((article, index) => (
                                <motion.article
                                    key={article.title}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.35,
                                        delay: index * 0.045,
                                    }}
                                    whileHover={{ y: -4 }}
                                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-primary/5"
                                >
                                    <div className="relative aspect-[16/9] overflow-hidden">
                                        <Image
                                            src={article.image}
                                            alt=""
                                            fill
                                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold uppercase tracking-[0.12em] text-secondary">
                                                {article.category}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                <Clock3 className="size-3" />
                                                {article.readTime}
                                            </span>
                                        </div>
                                        <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">
                                            {article.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {article.excerpt}
                                        </p>
                                        <ArticleLink className="mt-5" />
                                    </div>
                                </motion.article>
                            ))}
                            {filteredArticles.length === 0 && (
                                <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
                                    <Search className="mx-auto size-5 text-muted-foreground" />
                                    <h3 className="mt-3 font-semibold">
                                        No articles found
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Try another keyword or category.
                                    </p>
                                    <Button
                                        variant="link"
                                        onClick={() => {
                                            setQuery("");
                                            setActiveCategory("All");
                                        }}
                                        className="mt-2"
                                    >
                                        Clear filters
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </section>

                <Reveal className="mt-12 sm:mt-16">
                    <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-primary px-6 py-8 text-primary-foreground sm:px-9 sm:py-10">
                        <div className="absolute -right-10 -top-16 size-48 rounded-full bg-white/10 blur-2xl" />
                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-primary-foreground/70">
                                    Keep learning with SkillKwiz
                                </p>
                                <h2 className="mt-1 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Turn insight into a better talent strategy.
                                </h2>
                            </div>
                            <Button
                                asChild
                                variant="secondary"
                                className="shrink-0 rounded-full"
                            >
                                <a href="/services">
                                    Explore solutions{" "}
                                    <ArrowRight className="size-4" />
                                </a>
                            </Button>
                        </div>
                    </section>
                </Reveal>
            </main>
        </div>
    );
}
