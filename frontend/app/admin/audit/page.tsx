export default function AdminAuditPage() {
  return (
    <div>
      <h1 className="mb-4 fw-bold">Audit Logs</h1>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <p className="text-muted">Audit trail of super admin actions will appear here.</p>
          <div className="table-responsive mt-4">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">No audit logs yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
