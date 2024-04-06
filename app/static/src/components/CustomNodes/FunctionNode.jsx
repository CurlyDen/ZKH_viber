import React, { useEffect, useState } from "react";
import { Handle, Position, useStore, ReactFlowProvider } from "reactflow";
import styles from "./CustomNode.module.css";
import DeleteNodeButton from "../DeleteNodeButton";
import { useNodesContext } from "../../context/NodeContext";

const connectionNodeIdSelector = (state) => state.connectionNodeId;

const FunctionNode = ({ id, data }) => {
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const { nodes, setNodes, setNodeDesc, selectedNode, setSelectedNode } =
    useNodesContext();
  const [isEditing, setIsEditing] = useState(false); // State to track editing mode

  const isConnecting = !!connectionNodeId;
  const isTarget = connectionNodeId && connectionNodeId !== id;

  const handleDelete = () => {
    // Find the parent node
    const parentNode = nodes.find((node) => node.id === data.parentId);

    if (parentNode) {
      // Remove the current function node ID from the parent's functions array
      parentNode.data.functions = parentNode.data.functions.filter(
        (functionId) => functionId !== id
      );

      // Update the nodes state
      setNodes((prevNodes) => [
        ...prevNodes.filter((node) => node.id !== id),
        parentNode,
      ]);
    }
  };

  const handleTextareaChange = (e) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = {
            ...node.data,
            description: e.target.value,
          };
        }
        return node;
      })
    );
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); // Preventing default context menu
    if (selectedNode !== nodes.find((node) => node.id === id))
      setSelectedNode(nodes.find((node) => node.id === id));
  };

  const handleBlur = () => {
    setIsEditing(false); // Disable editing mode on blur
  };

  useEffect(() => {
    setIsEditing(true);
    if (selectedNode !== nodes.find((node) => node.id === id)) {
      handleBlur();
    }
  }, [selectedNode]);

  const handleConnectStart = (params) => {
    if (isEditing) {
      params.preventDefault();
    }
  };

  return (
    <div className={styles.functionNode}>
      <div
        className={styles.endpointNodeBody}
        onContextMenu={handleContextMenu}
      >
        <DeleteNodeButton nodeId={id} onDelete={handleDelete} />
        {!isConnecting && (
          <Handle
            className={styles.customHandle}
            position={Position.Right}
            type="source"
            onConnectStart={handleConnectStart}
            isConnectable={!isEditing}
          />
        )}

        {isEditing ? (
          <textarea
            id={`textarea-${id}`}
            value={data.description}
            onChange={handleTextareaChange}
            onBlur={handleBlur}
            spellCheck={false}
            className="h-10 mr-[10px] w-full bg-transparent cursor-pointer text-sm px-1 outline-none resize-none overflow-hidden break-words"
          />
        ) : (
          <div className="w-full mr-[10px] bg-transparent h-10 cursor-pointer text-sm px-1 text-ellipsis overflow-hidden break-words">
            {data.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default FunctionNode;
