import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout.js";
import api from "../../utils/api.js";

interface FeeInvoice {
  id: string;
  amount: string;
  dueDate: string;
  status: "PAID" | "UNPAID" | "PARTIAL";
}

export const MyFees: React.FC = () => {
  const [fees, setFees] = useState<FeeInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFees() {
      try {
        const response = await api.get("/student/fees");
        setFees(response.data);
      } catch (err) {
        console.error("Failed to load my fees/invoices:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFees();
  }, []);

  const getSummary = () => {
    let totalAmt = 0;
    let outstandingCount = 0;
    fees.forEach((f) => {
      const amt = parseFloat(f.amount);
      totalAmt += amt;
      if (f.status !== "PAID") {
        outstandingCount++;
      }
    });
    return { total: fees.length, totalAmt, outstandingCount };
  };

  const summary = getSummary();

  return (
    <DashboardLayout title="My Invoices">
      <div className="page-header">
        <h3>My Fee Invoices & Dues</h3>
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Retrieving invoices...</h3>
        </div>
      ) : (
        <div>
          <div className="summary-bar">
            <div className="summary-item">
              <span className="label">Total Generated Invoices</span>
              <span className="value">{summary.total} bills</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Cumulative Dues</span>
              <span className="value">
                ₹{summary.totalAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Pending Action Items</span>
              <span className="value" style={{ color: summary.outstandingCount > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
                {summary.outstandingCount === 0 ? "Fully Settled" : `${summary.outstandingCount} Action Required`}
              </span>
            </div>
          </div>

          {fees.length === 0 ? (
            <div className="empty-state">
              <p>No invoices registered for your student profile yet.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice Index</th>
                    <th>Invoice Amount</th>
                    <th>Payment Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee, idx) => (
                    <tr key={fee.id}>
                      <td style={{ fontWeight: 600 }}>INV-{idx + 101}</td>
                      <td>
                        ₹{parseFloat(fee.amount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        {new Date(fee.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <span className={`status-badge ${fee.status.toLowerCase()}`}>
                          {fee.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};
