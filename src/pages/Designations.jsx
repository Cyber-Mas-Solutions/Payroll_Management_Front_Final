import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/CompensationCommon.css';

const Designations = () => {
  const [list,setList]=useState([
    {name:'HR', base:90000},
    {name:'Cleaning Staff', base:45000},
    {name:'QA', base:80000}
  ]);
  const [form,setForm]=useState({name:'',base:''});

  const add=()=>{ if(!form.name||!form.base) return;
    setList(prev=>[...prev,{name:form.name,base:Number(form.base)}]);
    setForm({name:'',base:''});
  };

  return (
    <div className="comp-container">
      <Sidebar />
      <div className="comp-content">
        <header className="comp-header">
          <div>
            <div className="comp-breadcrumb"><span>Administration</span> <span>›</span> <span className="active">Designations</span></div>
            <h1 className="comp-title">Designations</h1>
          </div>
          <div className="comp-right"><div className="comp-avatar" /><span className="sc-muted">John</span></div>
        </header>

        <div className="sc-section sc-grid sc-grid-2">
          <div className="sc-card">
            <h3 className="sc-subtitle">Add Designation</h3>
            <label className="sc-label">Designation</label>
            <input className="sc-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            <label className="sc-label">Base Salary (LKR)</label>
            <input className="sc-input" value={form.base} onChange={e=>setForm(f=>({...f,base:e.target.value}))}/>
            <div className="sc-actions" style={{marginTop:12}}><button className="btn btn-primary" onClick={add}>Add</button></div>
          </div>

          <div className="sc-card">
            <h3 className="sc-subtitle">Current Designations</h3>
            <table className="sc-table">
              <thead><tr><th>Designation</th><th>Base Salary</th></tr></thead>
              <tbody>
                {list.map((r,i)=>(
                  <tr key={i}><td>{r.name}</td><td>Rs {r.base.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Designations;
