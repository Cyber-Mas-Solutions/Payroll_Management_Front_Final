import React, { useState } from "react";
import Layout from "../../../components/Layout";
import PageHeader from "../../../components/PageHeader";
import AdminTabs from "../AdminTabs";

import { Calendar, dateFnsLocalizer, Navigate } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Calendar config
const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const HolidaysPage = () => {
  const [events] = useState([
    { title: "New Year's Day", start: new Date(2025, 0, 1), end: new Date(2025, 0, 1), type: "Public Holiday" },
    { title: "Independence Day", start: new Date(2025, 1, 4), end: new Date(2025, 1, 4), type: "Public Holiday" },
    { title: "Christmas Day", start: new Date(2025, 11, 25), end: new Date(2025, 11, 25), type: "Public Holiday" },
  ]);

  // State to track current date
  const [currentDate, setCurrentDate] = useState(new Date());

  // Custom toolbar with < and >
  const CustomToolbar = ({ label, onNavigate }) => {
    const handleNavigate = (action) => {
      let newDate = new Date(currentDate);
      if (action === Navigate.PREVIOUS) newDate.setMonth(newDate.getMonth() - 1);
      else if (action === Navigate.NEXT) newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
      onNavigate(action);
    };

    return (
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginBottom: "12px" }}>
        <button className="btn btn-soft" onClick={() => handleNavigate(Navigate.PREVIOUS)} style={{ fontSize: "18px", fontWeight: "bold" }}>
          &lt;
        </button>
        <span style={{ fontWeight: "600", fontSize: "16px" }}>{label}</span>
        <button className="btn btn-soft" onClick={() => handleNavigate(Navigate.NEXT)} style={{ fontSize: "18px", fontWeight: "bold" }}>
          &gt;
        </button>
      </div>
    );
  };

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: "#1a73e8",
      color: "#fff",
      borderRadius: "6px",
      padding: "2px 4px",
    },
  });

  return (
    <Layout>
      <PageHeader breadcrumb={["Administrative", "Holidays"]} title="Holidays" />
      <AdminTabs />

      <div className="card" style={{ marginTop: "16px", padding: "16px" }}>
        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 18 }}>Holiday Calendar</div>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 650 }}
          views={["month"]}
          toolbar={true}
          components={{ toolbar: CustomToolbar }}
          defaultView="month"
          date={currentDate}      // <-- control current month
          eventPropGetter={eventStyleGetter}
        />
      </div>
    </Layout>
  );
};

export default HolidaysPage;
