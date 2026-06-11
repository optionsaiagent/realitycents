interface WaveDividerProps {
  color?: string;
  flip?: boolean;
  className?: string;
}

export default function WaveDivider({ color = "#FAFAF7", flip, className = "" }: WaveDividerProps) {
  return (
    <div
      className={`wave-divider ${flip ? "rotate-180" : ""} ${className}`}
      style={{ marginTop: flip ? undefined : "-1px", marginBottom: flip ? "-1px" : undefined }}
    >
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-12 md:h-16 lg:h-20"
      >
        <path
          d="M0 80V30C240 60 480 10 720 30C960 50 1200 10 1440 30V80H0Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
