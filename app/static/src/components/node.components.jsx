import React, { useCallback, useState, useEffect } from "react";
import axios from "axios";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  updateEdge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNodes/CustomNode";
import FloatingEdge from "./FloatingEdge";
import CustomConnectionLine from "./CustomConnectionLine";
import { useNodesContext } from "../context/NodeContext";
import StartNode from "./CustomNodes/StartNode";
import EndNode from "./CustomNodes/EndNode";
import DeleteEdgeButton from "./DeleteEdgeButton";
import { MdHome } from "react-icons/md";
import { Link } from "react-router-dom";
import FunctionNode from "./CustomNodes/FunctionNode";

const nodeTypes = {
  custom: CustomNode,
  start: StartNode,
  end: EndNode,
  function: FunctionNode,
};

const connectionLineStyle = {
  strokeWidth: 2,
  stroke: "black",
};

const edgeTypes = {
  floating: FloatingEdge,
};

const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: "black" },
  type: "floating",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "black",
  },
  label: "",
};

const Nodes = ({ scenario, setScenarios }) => {
  const {
    nodes,
    setNodes,
    onNodesChange,
    nodeDesc,
    setNodeDesc,
    edges,
    setEdges,
    onEdgesChange,
    selectedEdge,
    setSelectedEdge,
    selectedNode,
    setSelectedNode,
  } = useNodesContext();

  const functions = scenario?.functions;
  const [nodeName, setNodeName] = useState("");
  const [nodeBg, setNodeBg] = useState("");
  const [edgeLabel, setEdgeLabel] = useState("");
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const handleSave = async () => {
    try {
      const blocks = nodes.map((n) => ({
        id: n.id,
        scenario_id: scenario.id,
        title: n.data.label,
        text: n.data.description,
        coords: n.position,
        style: n.style,
        type: n.type,
        parent_id: n.data.parentId,
      }));

      const links = edges.map((e) => ({
        id: e.id,
        scenario_id: scenario.id,
        text: e.label,
        type: e.type,
        start: e.source,
        end: e.target,
      }));

      const scenarioToSave = {
        id: scenario.id,
        title: scenario.title,
        blocks: blocks,
        links: links,
        functions: scenario.functions,
      };
      const response = await axios.post(
        `https://app3.fundeus.bg/api_mc/canvas/${scenario.id}`,
        scenarioToSave,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log("Scenario saved successfully");
      } else {
        console.error("Failed to save scenario:", response.statusText);
      }
    } catch (error) {
      console.error("Error during scenario save:", error.message);
    }
  };

  const onInit = (reactFlowInstance) => {
    // Save the ReactFlow instance to access pan and zoom values
    setReactFlowInstance(reactFlowInstance);
  };

  useEffect(() => {
    setNodes((nds) =>
      nds?.map((node) => {
        if (node.id === selectedNode?.id) {
          node.data = {
            ...node.data,
            description: nodeDesc,
          };
        }

        return node;
      })
    );
  }, [nodeDesc, setNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds?.map((node) => {
        if (node.id === selectedNode?.id) {
          node.data = {
            ...node.data,
            label: nodeName,
          };
        }

        return node;
      })
    );
  }, [nodeName, setNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds?.map((node) => {
        if (node.id === selectedNode?.id) {
          node.style = { ...node.style, backgroundColor: nodeBg };
        }

        return node;
      })
    );
  }, [nodeBg, setNodes]);

  useEffect(() => {
    setEdges((edges) =>
      edges?.map((edge) => {
        if (edge.id === selectedEdge?.id) {
          edge = {
            ...edge,
            label: edgeLabel,
          };
        }

        return edge;
      })
    );
  }, [edgeLabel, setEdgeLabel]);

  useEffect(() => {
    if (selectedNode) {
      setNodeName(selectedNode?.data.label);
      setNodeBg(selectedNode?.style?.backgroundColor);
      setNodeDesc(selectedNode?.data.description);
    }
  }, [selectedNode]);

  useEffect(() => {
    console.log(edges);
  }, [edges]);

  useEffect(() => {
    if (selectedEdge) {
      setEdgeLabel(selectedEdge?.label);
    }
  }, [selectedEdge]);

  const onConnect = useCallback(
    (params) => {
      const { source, target } = params;

      if (nodes.find((node) => node.id === source)?.type === "end") {
        return;
      }

      if (source === "-1" && edges.some((edge) => edge.source === "-1")) {
        return;
      }

      setEdges((eds) => addEdge(params, eds));
    },
    [edges, setEdges]
  );

  const onCreateNode = () => {
    if (!reactFlowInstance) return;

    // Get the current pan and zoom values
    const {
      x: offsetX,
      y: offsetY,
      zoom,
    } = reactFlowInstance.toObject().viewport;

    const newNode = {
      id: (nodes.length - 2).toString(),
      type: "custom",
      position: {
        x: (Math.random() * 600 - offsetX) / zoom,
        y: (Math.random() * 600 - offsetY) / zoom,
      },
      data: { label: scenario.functions[0], description: "" },
      style: { backgroundColor: "#ffffff" },
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  const onSelectNode = (event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const onSelectEdge = (event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  console.log(nodes);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onInit={onInit}
      onConnect={onConnect}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      snapToGrid={true}
      snapGrid={[15, 15]}
      onNodeClick={onSelectNode}
      onEdgeClick={onSelectEdge}
      onPaneClick={() => {
        setSelectedNode(null);
        setSelectedEdge(null);
      }}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineComponent={CustomConnectionLine}
      connectionLineStyle={connectionLineStyle}
      nodeTypes={nodeTypes}
    >
      <Controls />
      <MiniMap />
      <Background variant="lines" gap={20} size={1} />
      <div className="absolute z-50 flex gap-2 bg-slate-300 p-1 rounded-br-lg">
        <Link
          className=" bg-orange-400 transition-all hover:bg-yellow-400 text-white font-bold py-1 px-3 rounded"
          to="/mc_viber"
        >
          <MdHome size={28} />
        </Link>
        <button
          className="bg-blue-500 transition-all hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
          onClick={onCreateNode}
        >
          Добавить узел
        </button>
        <button
          className="bg-green-500 transition-all hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
          onClick={handleSave}
        >
          Сохранить
        </button>
      </div>
      {selectedNode && (
        <div className="absolute right-2 top-2 z-50 text-sm flex flex-col bg-slate-200 border border-slate-300">
          {!selectedNode.id.includes("tree") && (
            <div className="flex flex-col">
              <label className="font-medium">Имя блока:</label>
              <select
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                className="p-1"
              >
                {functions.map((func, index) => (
                  <option key={index} value={func}>
                    {func}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="font-medium">Фон:</label>
          <input
            value={nodeBg}
            className="p-1"
            onChange={(e) => setNodeBg(e.target.value)}
          />
          <label className="font-medium">Описание:</label>

          <div className="overflow-hidden">
            <textarea
              value={nodeDesc}
              onChange={(e) => setNodeDesc(e.target.value)}
              className="w-full h-20 p-1 outline-none resize-none overflow-x-hidden overflow-y-auto"
            />
          </div>
        </div>
      )}
      {selectedEdge && (
        <div className="absolute right-2 top-2 z-50 text-sm flex flex-col bg-slate-400 border border-slate-300 bg-opacity-30">
          <label className="font-medium">Имя связи:</label>
          <input
            value={edgeLabel}
            className="p-1"
            onChange={(e) => setEdgeLabel(e.target.value)}
          />
          <DeleteEdgeButton id={selectedEdge?.id} />
        </div>
      )}
    </ReactFlow>
  );
};

export default Nodes;