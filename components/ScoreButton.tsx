import clsx from "clsx";

export default function ScoreButton({
  label,
  onClick,
  variant = "primary",
  disabled,
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "tap-target w-full rounded-card py-6 text-xl font-bold shadow-card transition active:scale-[0.98] disabled:opacity-40 dark:shadow-cardDark",
        variant === "primary"
          ? "bg-action text-white hover:brightness-110"
          : "bg-surfaceAlt text-ink hover:brightness-95 dark:bg-surfaceAltDark dark:text-paper"
      )}
    >
      {label}
    </button>
  );
}
