const nodes = [
  { x: 60, y: 90 }, { x: 160, y: 50 }, { x: 160, y: 150 },
  { x: 260, y: 30 }, { x: 260, y: 100 }, { x: 260, y: 170 },
  { x: 360, y: 70 }, { x: 360, y: 140 },
];

const edges = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [4, 6], [4, 7],
];

const GraphVisual = () => {
  return (
    <svg viewBox="0 0 420 200" className="w-full max-w-md">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="#2A3236"
          strokeWidth="1.5"
        />
      ))}
      <line
        x1={nodes[0].x}
        y1={nodes[0].y}
        x2={nodes[4].x}
        y2={nodes[4].y}
        stroke="#FF6A39"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.6"
      >
        <animate attributeName="stroke-dashoffset" from="16" to="0" dur="1.2s" repeatCount="indefinite" />
      </line>
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={i === 0 ? 6 : 4}
          fill={i === 0 ? "#FF6A39" : "#4FD1C5"}
        >
          {i === 0 && (
            <animate attributeName="r" values="6;9;6" dur="1.6s" repeatCount="indefinite" />
          )}
        </circle>
      ))}
    </svg>
  );
};

export default GraphVisual;