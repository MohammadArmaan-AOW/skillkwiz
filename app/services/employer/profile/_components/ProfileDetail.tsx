type ProfileDetailProps = {
    icon: React.ElementType;
    label: string;
    value: string;
};

export default function ProfileDetail({
    icon: Icon,
    label,
    value,
}: ProfileDetailProps) {
    return (
        <div className="rounded-xl border border-border p-4">
            <Icon className="size-4 text-primary" />

            <dt className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </dt>

            <dd className="mt-1 truncate text-sm font-medium">
                {value}
            </dd>
        </div>
    );
}