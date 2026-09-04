interface CarouselSlide {
    title: string;
    backgroundImage: string;
    position: "left" | "center";
}

export const slides: CarouselSlide[] = [
    {
        title: "Skill Assessment",
        backgroundImage: "/images/homepage/Carousel/Drivers License.jpg",
        position: "left",
    },
    {
        title: "Quiz Excellence",
        backgroundImage: "/images/homepage/Carousel/Pick - Laptop.jpg",
        position: "left",
    },
    {
        title: "Learning Journey",
        backgroundImage: "/images/homepage/Carousel/Secure Center.jpg",
        position: "left",
    },
    {
        title: "Hiring Simplified",
        backgroundImage: "/images/homepage/Carousel/Skill Library.jpg",
        position: "center",
    },
];

export const SLIDE_COPY: Record<string, string> = {
    "Skill Assessment":
        "Measure real-world skills with assessments people enjoy taking.",
    "Quiz Excellence":
        "Build meaningful quizzes that turn knowledge into progress.",
    "Learning Journey":
        "Give every learner a clear path from potential to performance.",
    "Hiring Simplified": "Find the right talent with confidence and clarity.",
};
