export default async function AdminDashboard() {
  let stats: any = { users: 0, organizations: 0, items: 0, active_subscriptions: 0 }

  try {
    const [usersRes, orgsRes, itemsRes, subsRes] = await Promise.all([
      fetch('http://localhost:8000/api/auth/users/'),
      fetch('http://localhost:8000/api/auth/organizations/'),
      fetch('http://localhost:8000/api/items/items/'),
      fetch('http://localhost:8000/api/subscriptions/subscriptions/'),
    ])

    if (usersRes.ok) {
      const usersData = await usersRes.json()
      stats.users = usersData.count ?? usersData.length ?? 0
    }
    if (orgsRes.ok) {
      const orgsData = await orgsRes.json()
      stats.organizations = orgsData.count ?? orgsData.length ?? 0
    }
    if (itemsRes.ok) {
      const itemsData = await itemsRes.json()
      stats.items = itemsData.count ?? itemsData.length ?? 0
    }
    if (subsRes.ok) {
      const subsData = await subsRes.json()
      const subs = subsData.count ?? subsData.length ?? 0
      stats.active_subscriptions = subs
    }
  } catch {
    // Stats remain 0
  }

  return (
    <div>
      <h1 className="mb-4 fw-bold">Super Admin Overview</h1>
      <div className="row g-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <div className="text-primary fs-4 fw-bold">{stats.users}</div>
              <div className="text-muted small">Total Users</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <div className="text-success fs-4 fw-bold">{stats.organizations}</div>
              <div className="text-muted small">Organizations</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <div className="text-info fs-4 fw-bold">{stats.items}</div>
              <div className="text-muted small">Total Items</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <div className="text-warning fs-4 fw-bold">{stats.active_subscriptions}</div>
              <div className="text-muted small">Active Subscriptions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold">Quick Actions</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <a href="/admin/users" className="btn btn-outline-primary w-100">Manage Users</a>
              </div>
              <div className="col-md-3">
                <a href="/admin/organizations" className="btn btn-outline-primary w-100">Manage Organizations</a>
              </div>
              <div className="col-md-3">
                <a href="/admin/site-content" className="btn btn-outline-primary w-100">Website Content</a>
              </div>
              <div className="col-md-3">
                <a href="/admin/subscriptions" className="btn btn-outline-primary w-100">Subscription Plans</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
