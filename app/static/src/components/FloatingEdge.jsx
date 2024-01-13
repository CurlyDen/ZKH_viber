import React, { useCallback, useContext } from "react";
import { useStore, getStraightPath, EdgeText } from "reactflow";
import { getEdgeParams } from "../utils/utils.js";
import { useNodesContext } from "../context/NodeContext.jsx";

function FloatingEdge({ id, source, target, markerEnd, style, label }) {
  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(source), [source])
  );
  const targetNode = useStore(
    useCallback((store) => store.nodeInternals.get(target), [target])
  );

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const [edgePath] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  // Вычисляем координаты центра линии
  const centerX = (sx + tx) / 2;
  const centerY = (sy + ty) / 2;

  return (
    <g>
      {/* Отрисовываем линию */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />

      <EdgeText
        x={centerX}
        y={centerY}
        label={label}
        labelStyle={{ fill: "black", fontSize: 12 }}
        labelShowBg
        labelBgStyle={{ fill: "white" }}
        labelBgPadding={[2, 6]}
        labelBgBorderRadius={2}
      />
    </g>
  );
}

export default FloatingEdge;
