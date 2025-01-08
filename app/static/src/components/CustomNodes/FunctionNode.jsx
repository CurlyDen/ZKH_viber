import React, { useEffect, useState, useRef } from "react";
import { Handle, Position } from "reactflow";
import styles from "./CustomNode.module.css";
import NodeControls from "../NodeControls/NodeControls";
import { useNodesContext } from "../../context/NodeContext";

const FunctionNode = ({ id, data }) => {
  const { nodes, setNodes, edges, setNodeDesc, selectedNode, setSelectedNode } = useNodesContext();
  const [textareaHeight, setTextareaHeight] = useState('auto');
  const textareaRef = useRef(null);
  const cursorPositionRef = useRef(null);

  const parentId = data.parentId;
  const hasOutgoingEdge = edges.some(edge => edge.source === id);

  const handleMoveNode = (direction) => {
    const siblingNodes = nodes.filter(n => n.data.parentId === parentId)
      .sort((a, b) => a.position.y - b.position.y);
    
    const currentIndex = siblingNodes.findIndex(n => n.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(siblingNodes.length - 1, currentIndex + 1);

    if (currentIndex === newIndex) return;

    const parentNode = nodes.find(n => n.id === parentId);
    const baseY = parentNode ? parentNode.position.y + 104 : 0;

    setNodes(prevNodes => 
      prevNodes.map(node => {
        if (node.data.parentId === parentId) {
          const nodeIndex = siblingNodes.findIndex(n => n.id === node.id);
          let newNodeIndex = nodeIndex;

          if (nodeIndex === currentIndex) {
            newNodeIndex = newIndex;
          } else if (direction === 'up' && nodeIndex === currentIndex - 1) {
            newNodeIndex = currentIndex;
          } else if (direction === 'down' && nodeIndex === currentIndex + 1) {
            newNodeIndex = currentIndex;
          }

          return {
            ...node,
            position: {
              ...node.position,
              y: baseY + (newNodeIndex * 55)
            }
          };
        }
        return node;
      })
    );
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (selectedNode !== nodes.find((node) => node.id === id))
      setSelectedNode(nodes.find((node) => node.id === id));
  };

  const handleTextareaChange = (e) => {
    cursorPositionRef.current = e.target.selectionStart;
    
    setNodeDesc(e.target.value);
    setTextareaHeight('auto');
    setTextareaHeight(`${e.target.scrollHeight}px`);
  };

  useEffect(() => {
    if (textareaRef.current && cursorPositionRef.current !== null) {
      textareaRef.current.setSelectionRange(
        cursorPositionRef.current,
        cursorPositionRef.current
      );
    }
  });

  return (
    <div className={styles.functionNode}>
      <div
        className={`${styles.endpointNodeBody} nodrag`}
        onContextMenu={handleContextMenu}
      >
        <NodeControls
          nodeId={id}
          onMoveUp={() => handleMoveNode('up')}
          onMoveDown={() => handleMoveNode('down')}
        />
        
        <Handle
          className={styles.customHandle}
          position={Position.Right}
          type="source"
          isConnectable={!hasOutgoingEdge}
        />

        <Handle
          className={styles.customHandle}
          position={Position.Left}
          type="target"
        />

        <textarea
          ref={textareaRef}
          id={`textarea-${id}`}
          value={data.description}
          onChange={handleTextareaChange}
          style={
            selectedNode?.id === id
              ? { height: textareaHeight }
              : { height: '42px' }
          }
          className="nodrag w-full bg-transparent cursor-pointer text-sm px-12 outline-none resize-none overflow-hidden break-words"
        />
      </div>
    </div>
  );
};

export default FunctionNode;
