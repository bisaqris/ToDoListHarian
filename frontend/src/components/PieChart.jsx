export const PieChart = ({ completed, pending, inProgress, total }) => {
  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: 120, height: 120 }}
      >
        <svg width={120} height={120} viewBox="0 0 120 120">
          <circle
            cx={60}
            cy={60}
            r={50}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={20}
          />
          <text x={60} y={65} textAnchor="middle" fontSize={12} fill="#9ca3af">
            Kosong
          </text>
        </svg>
      </div>
    );
  }

  const SIZE = 120;
  const CX = 60;
  const CY = 60;
  const R = 42;
  const STROKE = 20;
  const circ = 2 * Math.PI * R;

  // Proporsi tiap segmen
  const segments = [
    { value: completed, color: "#22c55e", label: "Selesai" },
    { value: inProgress, color: "#3b82f6", label: "Dikerjakan" },
    { value: pending, color: "#f97316", label: "Pending" },
  ].filter((s) => s.value > 0);

  // Bangun arc segments
  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circ;
    const gap = circ - dash;
    const arc = {
      ...seg,
      dasharray: `${dash} ${gap}`,
      dashoffset: -offset * circ,
    };
    offset += pct;
    return arc;
  });

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="-rotate-90"
    >
      {/* track */}
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth={STROKE}
      />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={arc.color}
          strokeWidth={STROKE}
          strokeDasharray={arc.dasharray}
          strokeDashoffset={arc.dashoffset}
          strokeLinecap="butt"
          style={{
            transition:
              "stroke-dashoffset 0.8s ease, stroke-dasharray 0.8s ease",
          }}
        />
      ))}
    </svg>
  );
};
