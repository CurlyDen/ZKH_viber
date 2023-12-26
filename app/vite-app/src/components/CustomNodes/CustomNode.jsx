import { Handle, Position, useStore } from "reactflow";
import styles from "./CustomNode.module.css";
import { useState, useEffect } from "react";
import { useNodesContext } from "../../context/NodeContext";
import DeleteNodeButton from "../DeleteNodeButton";

const connectionNodeIdSelector = (state) => state.connectionNodeId;

const functionOptions = [
  { id: "func1", label: "Function 1" },
  { id: "func2", label: "Function 2" },
  { id: "func3", label: "Function 3" },
];

export default function CustomNode({ id, data, xPos, yPos }) {
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const { nodes, setNodes, setNodeDesc, edges, setEdges } = useNodesContext();
  const isConnecting = !!connectionNodeId;
  const isTarget = connectionNodeId && connectionNodeId !== id;

  const [textareaHeight, setTextareaHeight] = useState("auto");
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [childNodesCreated, setChildNodesCreated] = useState(false);

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

  useEffect(() => {}, [selectedOptions]);

  useEffect(() => {
    const functionNodes = nodes.filter(
      (node, index) => node.data.parentId === id
    );
    const otherNodes = nodes.filter((node, index) => node.data.parentId !== id);
    const updatedFunctionNodes = functionNodes?.map((node, index) => {
      return { ...node, position: { x: xPos, y: yPos + 100 + index * 55 } };
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

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuVisible(!contextMenuVisible);
  };

  const handleCloseContextMenu = () => {
    setContextMenuVisible(false);
    createChildNodes();
  };

  const handleMenuItemClick = (menuItem) => {
    if (selectedOptions.includes(menuItem)) {
      setSelectedOptions(
        selectedOptions.filter((option) => option !== menuItem)
      );
    } else {
      setSelectedOptions([...selectedOptions, menuItem]);
    }
  };

  const createChildNodes = () => {
    const parentNode = nodes.find((node) => node.id === id);

    if (parentNode) {
      const parentTreeId = `${id}-tree`;

      const newNodes = selectedOptions
        .filter((option) => {
          // Check if a node with the same ID already exists
          const nodeId = `${parentTreeId}-${option}`;
          return !nodes.find((node) => node.id === nodeId);
        })
        .map((option, index) => ({
          id: `${parentTreeId}-${option}`,
          type: "function",
          position: {
            x: xPos,
            y: yPos + 100 + index * 55,
          },
          style: { backgroundColor: "#ffffff" },
          data: { label: option, parentId: id },
        }));

      setNodes((nds) => [...nds, ...newNodes]);
    }
  };

  return (
    <div className={styles.customNode} onContextMenu={handleContextMenu}>
      <div className={styles.customNodeBody}>
        <DeleteNodeButton nodeId={id} />
        {!isConnecting && !selectedOptions.length && (
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

      <textarea
        id={`textarea-${id}`}
        value={data.description}
        onChange={handleTextareaChange}
        style={{ height: textareaHeight }}
        className="border-2 border-t-0 border-zinc-700 rounded-[10px] min-h-[42px] rounded-t-none w-full cursor-pointer text-sm px-1 outline-none resize-none overflow-hidden"
      />

      {contextMenuVisible && (
        <div
          className={`absolute bg-white border border-gray-300 rounded-md shadow p-2 z-[1000] left-full w-48`}
          onClick={(e) => e.stopPropagation()} // Prevent closing on click within the context menu
        >
          {functionOptions.map((option) => (
            <div key={option.id} className="mb-2">
              <input
                type="checkbox"
                id={option.id}
                checked={selectedOptions.includes(option.id)}
                onChange={() => handleMenuItemClick(option.id)}
                className="mr-1"
                disabled={childNodesCreated}
              />
              <label htmlFor={option.id}>{option.label}</label>
            </div>
          ))}
          <button
            onClick={handleCloseContextMenu}
            className={`w-full bg-green-400 p-1 rounded-md ${
              childNodesCreated ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={childNodesCreated}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
