import React from 'react';
import PositionButton from './PositionButton';
import DeleteNodeButton from '../DeleteNodeButton';

const NodeControls = ({ 
  nodeId, 
  onMoveUp, 
  onMoveDown,
}) => {
  return (
    <>
      <div className="absolute left-0 top-0 flex flex-col items-center gap-1 p-[2px]">
        <PositionButton direction="up" onClick={onMoveUp} />
        <PositionButton direction="down" onClick={onMoveDown} />
      </div>
      <div className="absolute right-0 top-0 flex flex-col items-center gap-1 p-[2px]">
        <DeleteNodeButton nodeId={nodeId} />
      </div>
    </>
  );
};

export default NodeControls;