export type Article = {
    title: string;
    excerpt: string;
    image: string;
    category: "Learning" | "Career" | "Workplace";
    readTime: string;
    featured?: boolean;
};

export const articles: Article[] = [
    {
        title: "The Importance of Upskilling in Today’s Job Market",
        excerpt:
            "The habits and systems that keep people ready for a world of work that never stands still.",
        image: "/images/blogpage/1.png",
        category: "Career",
        readTime: "6 min read",
        featured: true,
    },
    {
        title: "How Gamified Learning Enhances Skill Retention",
        excerpt:
            "Why a little momentum, feedback, and play can make learning stick.",
        image: "/images/blogpage/2.png",
        category: "Learning",
        readTime: "5 min read",
    },
    {
        title: "Soft Skills vs. Hard Skills: What Matters More?",
        excerpt:
            "The strongest teams make room for both the human and technical sides of capability.",
        image: "/images/blogpage/3.png",
        category: "Workplace",
        readTime: "7 min read",
    },
    {
        title: "Top 10 Tech Skills That Can Land You a High-Paying Job",
        excerpt:
            "A practical look at the technical skills shaping high-impact roles today.",
        image: "/images/blogpage/4.png",
        category: "Career",
        readTime: "8 min read",
    },
    {
        title: "How to Stay Motivated While Learning New Skills",
        excerpt:
            "Build a learning practice that still works when motivation comes and goes.",
        image: "/images/blogpage/5.png",
        category: "Learning",
        readTime: "4 min read",
    },
    {
        title: "The Future of Online Learning",
        excerpt:
            "The learning experiences and signals that will matter in the years ahead.",
        image: "/images/blogpage/6.png",
        category: "Learning",
        readTime: "5 min read",
    },
    {
        title: "5 Essential Skills to Boost Your Career in 2025",
        excerpt:
            "Five durable skills that help professionals adapt, contribute, and grow.",
        image: "/images/blogpage/7.png",
        category: "Career",
        readTime: "6 min read",
    },
    {
        title: "How Gamification Enhances Learning & Engagement",
        excerpt:
            "A closer look at turning participation into meaningful progress.",
        image: "/images/blogpage/8.png",
        category: "Workplace",
        readTime: "5 min read",
    },
];

export const categories = ["All", "Learning", "Career", "Workplace"] as const;
export type Category = (typeof categories)[number];
