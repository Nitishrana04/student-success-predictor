interface RiskBadgeProps {
  level: "low" | "medium" | "high";
}

const config = {
  low: { label: "Low Risk", className: "bg-success/10 text-success" },
  medium: { label: "Medium Risk", className: "bg-warning/10 text-warning" },
  high: { label: "High Risk", className: "bg-danger/10 text-danger" },
};

const RiskBadge = ({ level }: RiskBadgeProps) => {
  const { label, className } = config[level];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
};

export default RiskBadge;
