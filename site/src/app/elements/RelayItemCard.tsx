import React from 'react';
import './RelayItemCard.css';

interface RelayItemCardProps {
  relay: string;
  onRemove?: () => void;
  onToggle?: () => void;
  isConnected?: boolean;
}

const RelayItemCard: React.FC<RelayItemCardProps> = ({ relay, onRemove, onToggle, isConnected }) => {
  return (
    <div className="relay-item">
      <input type="text" value={relay} readOnly />
      {onRemove ? (
        <button onClick={onRemove}>Remove</button>
      ) : (
        <button onClick={onToggle}>{isConnected ? 'Disconnect' : 'Connect'}</button>
      )}
    </div>
  );
};

export default RelayItemCard;
