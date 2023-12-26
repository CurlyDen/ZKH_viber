import React, { createContext, useContext, useEffect, useState } from "react";
import { useEdgesState, useNodesState } from "reactflow";
const NodesContext = createContext();

export const NodesProvider = ({ children, scenario }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(scenario.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(scenario.edges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [nodeDesc, setNodeDesc] = useState("");

  return (
    <NodesContext.Provider
      value={{
        nodes,
        setNodes,
        onNodesChange,
        nodeDesc,
        setNodeDesc,
        edges,
        setEdges,
        onEdgesChange,
        selectedNode,
        setSelectedNode,
        selectedEdge,
        setSelectedEdge,
      }}
    >
      {children}
    </NodesContext.Provider>
  );
};

export const useNodesContext = () => {
  return useContext(NodesContext);
};
