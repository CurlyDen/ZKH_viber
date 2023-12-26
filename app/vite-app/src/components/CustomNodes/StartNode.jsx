import React from "react";
import { Handle, Position } from "reactflow";
import styles from "./CustomNode.module.css";

const StartNode = ({ data }) => {
  return (
    <div className={styles.endpointNode}>
      <div className={styles.endpointNodeBody}>
        <Handle
          className={styles.customHandle}
          position={Position.Right}
          type="source"
        />
        {data.label}
      </div>
    </div>
  );
};

export default StartNode;
