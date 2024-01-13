import React from "react";
import { Handle, Position } from "reactflow";
import styles from "./CustomNode.module.css";

const EndNode = ({ data }) => {
  return (
    <div className={styles.endpointNode}>
      <div className={styles.endpointNodeBody}>
        <Handle
          className={styles.customHandle}
          position={Position.Left}
          type="target"
          isConnectableStart={false}
          // Disable connections from EndNode
        />
        {data.label}
      </div>
    </div>
  );
};

export default EndNode;
