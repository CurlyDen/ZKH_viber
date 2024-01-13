import React from "react";
import { getStraightPath } from "reactflow";

// eslint-disable-next-line react/prop-types
function CustomConnectionLine({ fromX, fromY, toX, toY, connectionLineStyle }) {
  const [edgePath] = getStraightPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path style={connectionLineStyle} fill="none" d={edgePath} />
      <circle
        cx={toX}
        cy={toY}
        fill="black"
        r={4}
        stroke="black"
        strokeWidth={1.5}
      />
    </g>
  );
}

export default CustomConnectionLine;
