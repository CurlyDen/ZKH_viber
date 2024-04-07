import { Handle, Position, useStore } from "reactflow";
import styles from "./CustomNode.module.css";
import { useState, useEffect, useContext } from "react";
import { useNodesContext } from "../../context/NodeContext";
import DeleteNodeButton from "../DeleteNodeButton";
import { Md2KPlus, MdPlusOne } from "react-icons/md";
import { TiPlus } from "react-icons/ti";

const connectionNodeIdSelector = (state) => state.connectionNodeId;

export default function CustomNode({ id, data, xPos, yPos }) {
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const {
    nodes,
    setNodes,
    setNodeDesc,
    edges,
    setEdges,
    selectedNode,
    scenario,
  } = useNodesContext();
  const isConnecting = !!connectionNodeId;
  const isTarget = connectionNodeId && connectionNodeId !== id;

  const [functionCounter, setFunctionCounter] = useState(
    nodes.filter((n) => n.id.startsWith(`${id}-tree`)).length + 1 || 1
  );
  const [textareaHeight, setTextareaHeight] = useState("auto");

  const [childNodesCreated, setChildNodesCreated] = useState(false);

  const functionOptions = scenario?.functions.map((f, id) => {
    return { id: "func" + id.toString(), label: f };
  });

  useEffect(() => {
    setFunctionCounter(
      nodes.filter((n) => n.id.startsWith(`${id}-tree`)).length + 1 || 1
    );
  }, [nodes.length]);

  useEffect(() => {
    const parentNode = nodes.find((node) => node.id === id);
    const parentTreeId = `${id}-tree`;

    // Check if child nodes with the specified IDs are already created
    const areChildNodesCreated = functionOptions.every((option) =>
      nodes.find((node) => node.id === `${parentTreeId}-${option.id}`)
    );

    setChildNodesCreated(areChildNodesCreated);

    if (
      nodes.find((node) => node.id.startsWith(`${parentTreeId}-`)) !== undefined
    ) {
      const updatedEdges = edges.filter((edge) => edge.source != id);
      setEdges(updatedEdges);
    }
  }, [nodes, id]);

  useEffect(() => {
    const functionNodes = nodes.filter(
      (node, index) => node.data.parentId === id
    );
    const otherNodes = nodes.filter((node, index) => node.data.parentId !== id);
    const updatedFunctionNodes = functionNodes?.map((node, index) => {
      return { ...node, position: { x: xPos, y: yPos + 104 + index * 55 } };
    });

    setNodes([...otherNodes, ...updatedFunctionNodes]);
  }, [xPos, yPos, nodes.length]);

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

    setTextareaHeight("auto");
    setTextareaHeight(`${e.target.scrollHeight}px`);
  };

  const handleClick = () => {
    createChildNodes();
  };

  const createChildNodes = () => {
    const parentNode = nodes.find((node) => node.id === id);

    if (parentNode) {
      const parentTreeId = `${id}-tree`;

      const newNodes = {
        id: `${parentTreeId}-${functionCounter}`,
        type: "function",
        position: {
          x: xPos,
          y: yPos + 104 + (functionCounter - 1) * 55,
        },
        style: { backgroundColor: "#ffffff" },
        data: { label: "", parentId: id },
      };
      setFunctionCounter(functionCounter + 1); // Increment the counter

      setNodes((nds) => [...nds, newNodes]);
    }
  };

  return (
    <div className={styles.customNode}>
      <div className={styles.customNodeBody}>
        <DeleteNodeButton nodeId={id} />
        {!isConnecting && (
          <Handle
            className={styles.customHandle}
            position={Position.Right}
            type="source"
            isConnectableStart={functionCounter === 1}
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

      <textarea
        id={`textarea-${id}`}
        value={data.description}
        onChange={handleTextareaChange}
        style={
          selectedNode?.id === id
            ? { height: textareaHeight }
            : { height: "42px" }
        }
        className="border-2 border-t-0 border-zinc-700 rounded-[10px] min-h-[42px] rounded-t-none w-full cursor-pointer text-sm px-1 outline-none resize-none overflow-hidden"
      />

      <button
        onClick={handleClick}
        className="text-center flex items-center justify-center text-sm w-[20px] h-[12px] border-[#222138] border-2 bg-green-400 absolute z-[10000] left-1/2 -translate-x-1/2 -bottom-[8px]"
      >
        <TiPlus size={12} />
      </button>
    </div>
  );
}
