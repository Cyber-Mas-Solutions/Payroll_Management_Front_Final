import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import PageHeader from "../../../components/PageHeader";
import AdminTabs from "../AdminTabs";
import DepartmentsTable from "./DepartmentsTable";
import AddDepartmentModal from "./AddDepartmentModal";
import { apiGet, apiPost, apiPut } from "../../../services/api";
import Spineer from "../../../components/Spineer";

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDept, setCurrentDept] = useState({
    name: "",
    // manager_name: "",
    // description: "",
    // status: "Active",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchDepts = async () => {
      setLoading(true);
      try {
        const res = await apiGet('/departments');
        console.log(res);
        setDepartments(Array.isArray(res.data) ? res.data : []); // <-- ensure array
      } catch (err) {
        console.error(err);
        setDepartments([]); // <-- fallback to empty array
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);


  // FILTER DEPARTMENTS
  const filteredDepartments = departments.filter((dept) =>
    Object.values(dept).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // FORMAT DATE
  const formatDate = (d) => {
    const date = new Date(d);
    if (Number.isNaN(date)) return d;
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${m}/${day}/${date.getFullYear()}`;
  };

  // Open Add Department modal
  const handleAddClick = () => {
    setCurrentDept({
      name: "",
      //  manager_name: "", description: "", status: "Active" 
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // Save department (Add or Edit) — this connects to backend
  const handleSaveDept = async () => {
    try {
      if (isEditing) {
        // Edit existing department
        const res = await apiPut(`/departments/${currentDept.id}`, currentDept);
        if (res.ok) {
          setDepartments(departments.map(d => (d.id === currentDept.id ? res.data : d)));
        }
      } else {
        // Add new department
        console.log(currentDept);
        const res = await apiPost(`/departments`, currentDept);
        if (res.ok) {
          setDepartments([...departments, res.data]);
        }
      }

      setShowModal(false);
      setCurrentDept({
        name: "",
        // manager_name: "",
        // description: "",
        // status: "Active",
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save department");
    }
  };


  const handleEditClick = (dept) => {
    setCurrentDept(dept);
    setIsEditing(true);
    setShowModal(true);
  };


  // DELETE
  const handleDeleteClick = (dept) => {
    if (window.confirm(`Are you sure you want to delete "${dept.name}"?`)) {
      setDepartments(departments.filter((d) => d.id !== dept.id));
    }
  };



  return (
    <Layout>
      <PageHeader breadcrumb={["Administrative", "Departments"]} title="Departments" />
      <AdminTabs />

      {/* Search + Add Button */}
      <div className="card p-3 mb-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search departments, manager, status..."
          style={{ width: "320px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button className="btn btn-primary" onClick={handleAddClick}>
          + Add Department
        </button>
      </div>
      {loading
        ? (
          <Spineer />)
        : (
          <DepartmentsTable
            departments={filteredDepartments}
            formatDate={formatDate}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />)
      }

      <AddDepartmentModal
        show={showModal}
        onClose={() => setShowModal(false)}
        newDept={currentDept}
        setNewDept={setCurrentDept}
        onSave={handleSaveDept}
        isEditing={isEditing}
      />
    </Layout>
  );
};

export default DepartmentsPage;
