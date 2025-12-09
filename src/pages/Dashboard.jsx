// src/pages/Dashboard.jsx
import React from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

export default function Dashboard() {
  return (
    <Layout>
      <PageHeader
        breadcrumb={["Dashboard", "Employee Information Management"]}
        title="Dashboard"
      />

      {/* Main grid: left info + right content */}
      <div className="grid-2">
        {/* LEFT COLUMN */}
        <div className="card">
          {/* Employee card */}
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
            <div className="user-avatar" style={{ width:60, height:60 }} />
            <div>
              <div style={{ fontWeight:700, fontSize:18 }}>Nimal Perera</div>
              <div style={{ color:"var(--muted)", fontSize:14 }}>HR Manager</div>
            </div>
          </div>

          {/* Info */}
          <div style={{ fontWeight:700, marginBottom:12 }}>Info</div>
          {[
            ["🏢","HR","Department"],
            ["👤","Human Resource Manager","Role"],
            ["🆔","CMS 129099","Employee ID"],
            ["📄","200070301290","NIC"],
            ["🏦","29049080","Peoples Bank"],
            ["💵","$ 40,000","Salary", true],
            ["⏰","Regular","Work Shift"],
            ["📋","Permanent","Type"],
          ].map(([icon,label,sub,isGreen],i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <div style={{ width:24, textAlign:"center" }}>{icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, color:isGreen ? "var(--success)" : "#111" }}>{label}</div>
                <div style={{ color:"var(--muted)", fontSize:12 }}>{sub}</div>
              </div>
            </div>
          ))}

          {/* Contact */}
          <div style={{ fontWeight:700, margin:"20px 0 12px" }}>Contact</div>
          {[
            ["✉️","Email","alwissuryatmaja@gmail.com"],
            ["📱","Phone","+6282283386756"],
          ].map(([icon,label,value],i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <div style={{ width:24, textAlign:"center" }}>{icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{label}</div>
                <div style={{ color:"var(--muted)", fontSize:12 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Stats */}
          <div className="grid-3">
            {[
              ["Total Employees","1,200","+2.00% From Last month","ok"],
              ["Projected Headcount","500","+5 from current (495)","ok"],
              ["Ongoing Projects","10","This month","warn"],
            ].map(([title, num, change, type],i)=>(
              <div key={i} className="card">
                <div style={{ color:"var(--muted)", fontWeight:600, marginBottom:8 }}>{title}</div>
                <div style={{ fontSize:32, fontWeight:800, lineHeight:1 }}>{num}</div>
                <div style={{ fontSize:12, marginTop:6, color: type==="ok" ? "var(--success)" : "var(--muted)" }}>
                  {change}
                </div>
              </div>
            ))}
          </div>

          {/* Leave cards */}
          <div className="grid-3">
            {[
              ["Total Employees on Leave","34","Paid 11","Unpaid 4","linear-gradient(135deg, #10b981, #059669)"],
              ["Pending Leave Requests","20","Paid 62","Unpaid 76","linear-gradient(135deg, #3b82f6, #2563eb)"],
              ["Approved Leave Requests","87","Paid 50","Unpaid 51","linear-gradient(135deg, #14b8a6, #0d9488)"],
            ].map(([title, num, a, b, bg], i)=>(
              <div key={i} className="card" style={{ color:"#fff", background:bg, border:"none" }}>
                <div style={{ opacity:.9, fontWeight:600, marginBottom:8 }}>{title}</div>
                <div style={{ fontSize:36, fontWeight:800, lineHeight:1 }}>{num}</div>
                <div style={{ opacity:.85, fontSize:12, marginTop:8, display:"flex", gap:6, flexDirection:"column" }}>
                  <span>{a}</span><span>{b}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Growth cards */}
          <div className="grid-3">
            {Array.from({length:3}).map((_,i)=>(
              <div key={i} className="card" style={{ textAlign:"center" }}>
                <div style={{ color:"var(--muted)", fontWeight:600, marginBottom:8 }}>
                  {i===1 ? "Avg. Profit Growth" : "Avg. Salary Growth"}
                </div>
                <div style={{ fontSize:28, fontWeight:800, color:"var(--success)" }}>+ 15.2 %</div>
                <div style={{ color:"var(--muted)", fontSize:12, marginTop:6 }}>Over past 24 months</div>
              </div>
            ))}
          </div>

          {/* Charts (placeholders) */}
          <div className="grid-2">
            {[
              ["Department-wise Salary Distribution","blue"],
              ["Department Budget Allocation","green"]
            ].map(([title, tone],i)=>(
              <div key={i} className="card">
                <div style={{ fontWeight:700, marginBottom:12 }}>{title}</div>
                <div style={{ height:200, display:"flex", alignItems:"flex-end", gap:8 }}>
                  {[60,80,100,45,55].map((h,j)=>(
                    <div
                      key={j}
                      style={{
                        width:40,
                        height:`${h}%`,
                        background: tone==="green"
                          ? "linear-gradient(to top, #10b981, #34d399)"
                          : "linear-gradient(to top, #3b82f6, #60a5fa)",
                        borderRadius:"4px 4px 0 0"
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
