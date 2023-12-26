import React, { useEffect } from "react";
import { useNodesContext } from "../context/NodeContext";
import { TiDelete } from "react-icons/ti";

const DeleteNodeButton = ({ nodeId }) => {
  const { nodes, setNodes, setEdges, edges, setSelectedNode } =
    useNodesContext();

  const handleClick = (e) => {
    const updatedNodes = nodes.filter(
      (node) => node.id !== nodeId && node.data.parentId !== nodeId
    );
    const updatedEdges = edges.filter((edge) => {
      return (
        nodeId != edge.target &&
        nodeId != edge.source &&
        !edge.source.startsWith(nodeId + "-tree")
      );
    });

    setEdges(updatedEdges);
    setNodes(updatedNodes);
  };

  useEffect(() => {
    setSelectedNode(null);
  }, [nodes.length]);

  return (
    <button
      className="absolute flex align-center justify-center z-50 top-[2px] right-[2px] text-sm font-medium bg-zinc-100 rounded-full transition-colors hover:bg-red-400 "
      onClick={handleClick}
    >
      <TiDelete size={16} color="white" />
    </button>
  );
};

export default DeleteNodeButton;
