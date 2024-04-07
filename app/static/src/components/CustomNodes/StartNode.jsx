import React from "react";
import { Handle, Position, useStore } from "reactflow";
import styles from "./CustomNode.module.css";

const connectionNodeIdSelector = (state) => state.connectionNodeId;

const StartNode = ({ data }) => {
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const isConnecting = !!connectionNodeId;

  return (
    <div className={styles.endpointNode}>
      <div className={styles.endpointNodeBody}>
        {!isConnecting && (
          <Handle
            className={styles.customHandle}
            position={Position.Right}
            type="source"
          />
        )}
        <Handle
          className={styles.customHandle}
          position={Position.Left}
          type="target"
          isConnectableStart={false}
        />
        {data.label}
      </div>
    </div>
  );
};

export default StartNode;
