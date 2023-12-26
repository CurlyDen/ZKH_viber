import React from "react";
import { useNodesContext } from "../context/NodeContext";
import { MdDelete } from "react-icons/md";

const DeleteEdgeButton = ({ id }) => {
  const { setEdges, edges, setSelectedEdge } = useNodesContext();
  const handleDeleteEdge = () => {
    const updatedEdges = edges.filter((edge) => edge.id !== id);
    setEdges(updatedEdges);
    setSelectedEdge(null);
  };

  return (
    <button
      className="w-full bg-red-500 p-1 flex align-center justify-center"
      onClick={handleDeleteEdge}
    >
      <MdDelete size={20} color="white" />
    </button>
  );
};

export default DeleteEdgeButton;
