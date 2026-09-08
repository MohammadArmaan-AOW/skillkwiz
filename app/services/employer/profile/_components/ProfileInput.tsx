type ProfileInputProps = {
    label: string;
    value: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    helper?: string;
    icon?: React.ReactNode;
};

export default function ProfileInput({
    label,
    value,
    onChange,
    disabled = false,
    required = false,
    placeholder,
    helper,
    icon,
}: ProfileInputProps) {
    return (
        <div>
            <label className="text-sm font-medium">
                {label}
            </label>

            <div className="relative mt-2">
                <input
                    type="text"
                    value={value}
                    onChange={(event) =>
                        onChange?.(
                            event.target.value,
                        )
                    }
                    disabled={disabled}
                    required={required}
                    placeholder={placeholder}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-80"
                />

                {icon && (
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {icon}
                    </div>
                )}
            </div>

            {helper && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                    {helper}
                </p>
            )}
        </div>
    );
}