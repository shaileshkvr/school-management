import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout.js";
import api from "../../utils/api.js";

interface FeeItem {
  id: string;
  amount: string;
  dueDate: string;
  status: "PAID" | "UNPAID" | "PARTIAL";
  student: {
    admissionNo: string;
    user: {
      email: string;
    };
    class: {
      name: string;
    };
  };
}

type TabType = "ALL" | "PAID" | "UNPAID" | "PARTIAL";

export const FeesRegistry: React.FC = () => {
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchFees();
  }, [activeTab]);

  async function fetchFees() {
    try {
      setLoading(true);
      const url = activeTab === "ALL" ? "/admin/fees" : `/admin/fees?status=${activeTab}`;
      const response = await api.get(url);
      setFees(response.data);
    } catch (err) {
      console.error("Failed to load fees list:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (feeId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/fees/${feeId}`, { status: newStatus });
      setSuccessMessage("Fee status updated successfully!");
      
      // Update local state to avoid full reload
      setFees((prevFees) =>
        prevFees.map((fee) =>
          fee.id === feeId ? { ...fee, status: newStatus as FeeItem["status"] } : fee
        )
      );

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update fee status:", err);
      alert("Error: Failed to update fee status.");
    }
  };

  return (
    <DashboardLayout title="Fees Registry">
      {successMessage && <div className="toast-success">{successMessage}</div>}

      <div className="page-header">
        <h3>Fee Registry & Invoices</h3>
      </div>

      <div className="tab-nav">
        {(["ALL", "PAID", "UNPAID", "PARTIAL"] as TabType[]).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "ALL" ? "All Invoices" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Loading invoices...</h3>
        </div>
      ) : fees.length === 0 ? (
        <div className="empty-state">
          <p>No invoices found in this category.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Class</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td style={{ fontWeight: 600 }}>{fee.student.admissionNo}</td>
                  <td>{fee.student.user.email}</td>
                  <td>{fee.student.class.name}</td>
                  <td>
                    ₹{parseFloat(fee.amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    {new Date(fee.dueDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span className={`status-badge ${fee.status.toLowerCase()}`}>
                      {fee.status.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select btn-sm"
                      value={fee.status}
                      onChange={(e) => handleStatusChange(fee.id, e.target.value)}
                      style={{ width: "120px", display: "inline-block" }}
                    >
                      <option value="PAID">Paid</option>
                      <option value="UNPAID">Unpaid</option>
                      <option value="PARTIAL">Partial</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};
