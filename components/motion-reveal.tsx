import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

export default function Reveal({
    children,
    className,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const reduceMotion = useReducedMotion();
    return (
        <motion.div
            className={className}
            initial={reduceMotion ? false : { opacity: 0, y: 50 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 3, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}
