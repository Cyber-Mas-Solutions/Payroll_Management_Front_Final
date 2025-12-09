// src/components/Header.jsx
import React from "react";

export default function Header() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      width: '100%',
      justifyContent: 'space-between'
    }}>
      {/* Left side - Page title or empty */}
      <div></div>
      
      {/* Right side - User info and icons */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        marginLeft: 'auto'
      }}>
        {/* Notification bell icon */}
        <div className="notification-icon">🔔</div>
        
        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="user-avatar"></div>
          <span className="username">Kamal</span>
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>
    </div>
  );
}