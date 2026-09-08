import { Building2, CalendarDays } from "lucide-react";

export const paths = [
    {
        role: "employee" as const,
        title: "I’m taking an assessment",
        copy: "Create your profile, review invitations, and reserve a convenient assessment time.",
        href: "/login?role=employee",
        icon: CalendarDays,
        action: "Start employee journey",
    },
    {
        role: "employer" as const,
        title: "I’m hiring or assessing talent",
        copy: "Set up your organization, invite candidates, pay securely, and review their results.",
        href: "/signup",
        icon: Building2,
        action: "Start employer journey",
    },
];