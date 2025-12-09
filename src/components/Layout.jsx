// src/components/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/global.css";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Sidebar />
      </aside>

      <main className="app-main">
        <div className="app-topbar">
          <Header />
        </div>
        <section 
          className="app-content"
          style={{
            padding: '0 !important',
            margin: '0 !important',
            width: '100% !important',
            height: '100% !important',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {children}
        </section>
      </main>
    </div>
  );
}