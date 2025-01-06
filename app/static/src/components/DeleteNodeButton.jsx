import React from 'react';
import { useNodesContext } from '../context/NodeContext';
import { TiDelete } from 'react-icons/ti';

const DeleteNodeButton = ({ nodeId }) => {
  const { nodes, setNodes, setEdges, edges, setSelectedNode } = useNodesContext();

  const handleClick = (e) => {
    e.preventDefault();
    
    const nodeToDelete = nodes.find(node => node.id === nodeId);
    const parentId = nodeToDelete?.data?.parentId;
    
    const filteredNodes = nodes.filter(
      (node) => node.id !== nodeId && !node.id.startsWith(`${nodeId}-tree`)
    );

    if (parentId) {
      const parentNode = nodes.find(node => node.id === parentId);
      const siblingNodes = filteredNodes
        .filter(node => node.data.parentId === parentId)
        .sort((a, b) => a.position.y - b.position.y);

      const baseY = parentNode ? parentNode.position.y + 104 : 0;
      
      filteredNodes.forEach(node => {
        if (node.data.parentId === parentId) {
          const index = siblingNodes.findIndex(n => n.id === node.id);
          if (index !== -1) {
            node.position.y = baseY + (index * 55);
          }
        }
      });
    }

    const updatedEdges = edges.filter((edge) => {
      return !edge.source.startsWith(nodeId) && 
             !edge.target.startsWith(nodeId) &&
             edge.source !== nodeId &&
             edge.target !== nodeId;
    });

    setEdges(updatedEdges);
    setNodes(filteredNodes);
    setSelectedNode(null);
  };

  return (
    <button
      className="absolute flex items-center justify-center right-[2px] top-[2px] text-sm font-medium bg-zinc-100 rounded-full transition-colors hover:bg-red-400 w-[20px] h-[20px]"
      onClick={handleClick}
    >
      <TiDelete size={16} color="white" />
    </button>
  );
};

export default DeleteNodeButton;