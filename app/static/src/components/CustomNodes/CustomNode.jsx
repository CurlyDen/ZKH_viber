import { Handle, Position, useStore } from "reactflow";
import styles from "./CustomNode.module.css";
import { useState, useEffect, useContext } from "react";
import { useNodesContext } from "../../context/NodeContext";
import DeleteNodeButton from "../DeleteNodeButton";

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
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [childNodesCreated, setChildNodesCreated] = useState(false);

  const functionOptions = scenario?.functions.map((f, id) => {
    return { id: "func" + id.toString(), label: f };
  });

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
    setSelectedOptions([]); // Clear selectedOptions when closing the menu
  };

  const handleMenuItemClick = (menuItem) => {
    if (selectedOptions.some((option) => option.id === menuItem.id)) {
      setSelectedOptions(
        selectedOptions.filter((option) => option.id !== menuItem.id)
      );
    } else {
      setSelectedOptions([...selectedOptions, menuItem]);
    }
  };

  const createChildNodes = () => {
    const parentNode = nodes.find((node) => node.id === id);

    if (parentNode) {
      const parentTreeId = `${id}-tree`;

      const newNodes = selectedOptions.map((option) => ({
        id: `${parentTreeId}-${option.id}-${functionCounter}`,
        type: "function",
        position: {
          x: xPos,
          y: yPos + 100 + (functionCounter - 1) * 55,
        },
        style: { backgroundColor: "#ffffff" },
        data: { label: option.label, parentId: id },
      }));

      setFunctionCounter(functionCounter + 1); // Increment the counter

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
        style={
          selectedNode?.id === id
            ? { height: textareaHeight }
            : { height: "42px" }
        }
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
                checked={selectedOptions.some(
                  (selectedOption) => selectedOption.id === option.id
                )}
                onChange={() => handleMenuItemClick(option)}
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
            Добавить
          </button>
        </div>
      )}
    </div>
  );
}
