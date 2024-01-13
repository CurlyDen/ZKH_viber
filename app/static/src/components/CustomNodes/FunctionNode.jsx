import React from "react";
import { Handle, Position } from "reactflow";
import styles from "./CustomNode.module.css";
import DeleteNodeButton from "../DeleteNodeButton";
import { useStore } from "reactflow";
import { useNodesContext } from "../../context/NodeContext";

const connectionNodeIdSelector = (state) => state.connectionNodeId;

const FunctionNode = ({ id, data }) => {
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const { nodes, setNodes, setNodeDesc } = useNodesContext();
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

  return (
    <div className={styles.functionNode}>
      <div className={styles.endpointNodeBody}>
        <DeleteNodeButton nodeId={id} onDelete={handleDelete} />
        {!isConnecting && (
          <Handle
            className={styles.customHandle}
            position={Position.Right}
            type="source"
          />
        )}

        {data.label}
      </div>
    </div>
  );
};

export default FunctionNode;
