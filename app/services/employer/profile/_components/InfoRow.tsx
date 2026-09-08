type ProfileDetailProps = {
    icon: React.ElementType;
    label: string;
    value: string;
};

export default function InfoRow({
    icon: Icon,
    label,
    value,
}: ProfileDetailProps) {
    return (
        <div className="flex gap-3 rounded-lg border border-border p-4">
            <Icon className="mt-0.5 size-4 shrink-0 text-primary" />

            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}
