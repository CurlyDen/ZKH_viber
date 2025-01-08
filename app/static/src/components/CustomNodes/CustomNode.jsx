import { Handle, Position } from 'reactflow';
import styles from './CustomNode.module.css';
import { useState, useEffect, useRef } from 'react';
import { useNodesContext } from '../../context/NodeContext';
import DeleteNodeButton from '../DeleteNodeButton';
import { TiPlus } from "react-icons/ti";

export default function CustomNode({ id, data }) {
  const { nodes, setNodes, edges, selectedNode } = useNodesContext();
  const hasOutgoingEdge = edges.some(edge => edge.source === id);
  const textareaRef = useRef(null);
  const cursorPositionRef = useRef(null);

  const [textareaHeight, setTextareaHeight] = useState('auto');
  const [functionCounter, setFunctionCounter] = useState(
    nodes.filter((n) => n.id.startsWith(`${id}-tree`)).length + 1 || 1
  );

  useEffect(() => {
    setFunctionCounter(
      nodes.filter((n) => n.id.startsWith(`${id}-tree`)).length + 1 || 1
    );
  }, [nodes.length]);

  const handleTextareaChange = (e) => {
    cursorPositionRef.current = e.target.selectionStart;

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

  const updateChildNodesPositions = (parentNode, childNodes) => {
    const verticalSpacing = 55;
    const baseOffset = 104;
    
    return nodes.map(node => {
      if (node.data.parentId === id) {
        const index = childNodes.findIndex(n => n.id === node.id);
        if (index !== -1) {
          return {
            ...node,
            position: {
              x: parentNode.position.x,
              y: parentNode.position.y + baseOffset + (index * verticalSpacing)
            }
          };
        }
      }
      return node;
    });
  };

  const createChildNode = () => {
    const parentNode = nodes.find((n) => n.id === id);
    const childNodes = nodes
      .filter((n) => n.id.startsWith(`${id}-tree`))
      .sort((a, b) => a.position.y - b.position.y);
    
    const verticalSpacing = 55;
    const baseOffset = 104;
    
    const newNode = {
      id: `${id}-tree-${functionCounter}`,
      type: 'function',
      position: {
        x: parentNode.position.x,
        y: parentNode.position.y + baseOffset + (childNodes.length * verticalSpacing)
      },
      style: { backgroundColor: '#ffffff' },
      data: { label: '', description: '', parentId: id }
    };

    const updatedNodes = updateChildNodesPositions(parentNode, [...childNodes, newNode]);
    
    setFunctionCounter(prev => prev + 1);
    setNodes([...updatedNodes, newNode]);
  };

  return (
    <div className={styles.customNode}>
      <div className={styles.customNodeBody}>
        <DeleteNodeButton nodeId={id} />
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
        {data.label}
      </div>

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
        className="border-2 border-t-0 border-zinc-700 rounded-[10px] min-h-[42px] rounded-t-none w-full cursor-pointer text-sm px-1 outline-none resize-none overflow-hidden"
      />
      <button
        onClick={createChildNode}
        className="text-center flex items-center justify-center text-sm w-[20px] h-[12px] border-[#222138] border-2 bg-green-400 absolute z-[10000] left-1/2 -translate-x-1/2 -bottom-[8px]"
      >
        <TiPlus size={12} />
      </button>
    </div>
  );
}