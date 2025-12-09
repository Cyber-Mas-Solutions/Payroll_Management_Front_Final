// src/components/PageHeader.jsx
import React from "react";

export default function PageHeader({ breadcrumb = [], title }) {
  return (
    <header className="page-header">
      <div className="breadcrumb">
        {breadcrumb.map((t, i) => (
          <span key={i} className={`breadcrumb-item ${i === breadcrumb.length - 1 ? "active" : ""}`}>
            {t}
            {i < breadcrumb.length - 1 && <span className="breadcrumb-sep">›</span>}
          </span>
        ))}
      </div>
      <h1 className="page-title">{title}</h1>
    </header>
  );
}