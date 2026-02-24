import React from 'react';
import { getBuildingImage } from '../utils/productImages';
import './VendingMachineCard.css';

const VendingMachineCard = ({ machine, onClick }) => {
  return (
    <div className="vm-machine-card" onClick={onClick} tabIndex={0} role="button">
      <img
        src={getBuildingImage(machine.building)}
        alt={machine.building}
        className="vm-machine-card-image"
      />
      <div className="vm-machine-card-info">
        <div className="vm-machine-card-name">{machine.name}</div>
        {machine.creditCardOnly && (
          <div className="vm-machine-card-credit-card-only">Credit card only</div>
        )}
        <div className="vm-machine-card-floor">{machine.floor}</div>
        {machine.notes && <div className="vm-machine-card-notes">{machine.notes}</div>}
      </div>
    </div>
  );
};

export default VendingMachineCard; 