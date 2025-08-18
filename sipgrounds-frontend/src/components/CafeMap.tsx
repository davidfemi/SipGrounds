import React from 'react';
import { Cafe } from '../services/api';

interface CafeMapProps {
  cafe: Cafe;
  height?: string;
}

const CafeMap: React.FC<CafeMapProps> = ({ cafe, height = '300px' }) => {
  return (
    <div 
      className="d-flex align-items-center justify-content-center bg-light"
      style={{ height }}
    >
      <div className="text-center text-muted">
        <i className="fas fa-map-marker-alt fa-3x mb-2"></i>
        <h5>{cafe.name}</h5>
        <p>{cafe.location}</p>
        <small>Map integration coming soon</small>
      </div>
    </div>
  );
};

export default CafeMap;