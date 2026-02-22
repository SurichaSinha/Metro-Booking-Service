import { Routes, Route, NavLink } from 'react-router-dom';
import LineEditor from '../components/admin/LineEditor';
import BulkImport from '../components/admin/BulkImport';
import CompatibilityMatrix from '../components/admin/CompatibilityMatrix';

export default function AdminPage() {
  const tabClass = ({ isActive }) =>
    `px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
      isActive
        ? 'border-metro-blue text-metro-blue'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 pt-4">
          <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
          <div className="flex gap-4 border-b border-gray-200">
            <NavLink to="/admin" end className={tabClass}>
              Line Management
            </NavLink>
            <NavLink to="/admin/import" className={tabClass}>
              Bulk Import
            </NavLink>
            <NavLink to="/admin/compatibility" className={tabClass}>
              Compatibility Matrix
            </NavLink>
          </div>
        </div>

        <div className="p-6">
          <Routes>
            <Route index element={<LineEditor />} />
            <Route path="import" element={<BulkImport />} />
            <Route path="compatibility" element={<CompatibilityMatrix />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
