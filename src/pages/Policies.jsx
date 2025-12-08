import React from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/CompensationCommon.css';

const Policies = () => {
  return (
    <div className="comp-container">
      <Sidebar />
      <div className="comp-content">
        <header className="comp-header">
          <div>
            <div className="comp-breadcrumb"><span>Administration</span> <span>›</span> <span className="active">Policies</span></div>
            <h1 className="comp-title">Policies</h1>
          </div>
          <div className="comp-right"><div className="comp-avatar" /><span className="sc-muted">John</span></div>
        </header>

        <div className="sc-section sc-grid sc-grid-2">
          <div className="sc-card">
            <h3 className="sc-subtitle">Leave Policy</h3>
            <label className="sc-label">Annual leave (paid / days)</label>
            <input className="sc-input" defaultValue="14" />
            <label className="sc-label">Sick leave (paid / days)</label>
            <input className="sc-input" defaultValue="7" />
            <label className="sc-label">Medical leave (paid / days)</label>
            <input className="sc-input" defaultValue="7" />
            <label className="sc-label">Bereavement (parents) – paid days</label>
            <input className="sc-input" defaultValue="7" />
            <div className="sc-actions" style={{marginTop:12}}><button className="btn btn-primary">Save</button></div>
          </div>

          <div className="sc-card">
            <h3 className="sc-subtitle">Overtime Policy</h3>
            <label className="sc-label">Weekday ×</label><input className="sc-input" defaultValue="1.5" />
            <label className="sc-label">Weekend ×</label><input className="sc-input" defaultValue="2.0" />
            <label className="sc-label">Public holiday ×</label><input className="sc-input" defaultValue="2.5" />
            <label className="sc-label">Monthly cap (hours)</label><input className="sc-input" defaultValue="60" />
            <div className="sc-actions" style={{marginTop:12}}><button className="btn btn-primary">Save</button></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Policies;
