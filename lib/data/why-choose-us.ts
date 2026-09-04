export type CardType = "library" | "secure" | "pricing";

export const CARDS: {
    id: CardType;
    title: string;
    description: string;
    image: string;
    alt: string;
}[] = [
    {
        id: "library",
        title: "Skill Library",
        description:
            "Access our extensive library of skill assessments covering technical, professional, and soft skills for comprehensive candidate evaluation.",
        image: "/images/homepage/books.gif",
        alt: "Skill assessment library",
    },
    {
        id: "secure",
        title: "Secure Testing",
        description:
            "Our testing takes place in secure environments with multiple authentication layers, including facial recognition and periodic identity checks to ensure assessment integrity.",
        image: "/images/homepage/guard.gif",
        alt: "Secure skill testing",
    },
    {
        id: "pricing",
        title: "Flexible Pricing",
        description:
            "Our pricing model is designed to scale with your needs. Pay only for what you use with our credit-based system. Larger organizations can benefit from our Enterprise plan with unlimited testing and custom features.",
        image: "/images/homepage/dollar.gif",
        alt: "Flexible assessment pricing",
    },
];