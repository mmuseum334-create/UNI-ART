'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { usePermissions } from '@/hooks/usePermissions';
import { roleService } from '@/services/rbac/roleService';
import { ROLES } from '@/services/rbac/permissionService';

/**
 * Página de administración de usuarios
 * Solo accesible para administradores
 */
export default function UsersAdminPage() {
  return (
    <ProtectedRoute adminOnly redirectTo="/">
      <UsersAdminContent />
    </ProtectedRoute>
  );
}

function UsersAdminContent() {
  const router = useRouter();
  const { isSuperAdmin, canAssignSuperAdmin } = usePermissions();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const result = await roleService.getAllUsers();
    if (result.success) {
      setUsers(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const loadRoles = async () => {
    const result = await roleService.getAllRoles();
    if (result.success) {
      setRoles(result.data);
    }
  };

  const openAssignRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRoleId(user.role?.id || null);
    setShowAssignRoleModal(true);
  };

  const handleAssignRole = async () => {
    if (!selectedRoleId) {
      alert('Selecciona un rol');
      return;
    }

    // Verificar si está tratando de asignar Super Admin
    const selectedRole = roles.find(r => r.id === selectedRoleId);
    if (selectedRole?.name === ROLES.SUPER_ADMIN && !canAssignSuperAdmin()) {
      alert('Solo los Super Admins pueden asignar el rol de Super Admin');
      return;
    }

    const result = await roleService.assignRoleToUser(selectedUser.id, selectedRoleId);

    if (result.success) {
      setShowAssignRoleModal(false);
      setSelectedUser(null);
      setSelectedRoleId(null);
      loadUsers();
      alert('Rol asignado exitosamente');
    } else {
      alert(result.error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case ROLES.SUPER_ADMIN:
        return 'bg-red-100 text-red-800';
      case ROLES.ADMIN:
        return 'bg-purple-100 text-purple-800';
      case ROLES.MODERATOR:
        return 'bg-blue-100 text-blue-800';
      case ROLES.ARTIST:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-purple-600 hover:text-purple-800 mb-4 flex items-center"
          >
            ← Volver al Admin
          </button>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-2">Administra usuarios y asigna roles</p>
            </div>

            {isSuperAdmin() && (
              <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                Super Admin
              </span>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <svg
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Users table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role?.name)}`}>
                      {user.role?.name || 'Sin rol'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openAssignRoleModal(user)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Cambiar Rol
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal: Asignar Rol */}
        {showAssignRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Asignar Rol</h2>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">Usuario: <strong>{selectedUser?.name}</strong></p>
                <p className="text-gray-600 mb-4">Email: {selectedUser?.email}</p>

                <label className="block text-gray-700 mb-2">Seleccionar Rol</label>
                <select
                  value={selectedRoleId || ''}
                  onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((role) => {
                    // Solo mostrar Super Admin si el usuario actual es Super Admin
                    if (role.name === ROLES.SUPER_ADMIN && !canAssignSuperAdmin()) {
                      return null;
                    }

                    return (
                      <option key={role.id} value={role.id}>
                        {role.name} {role.description ? `- ${role.description}` : ''}
                      </option>
                    );
                  })}
                </select>

                {/* Warning para Super Admin */}
                {roles.find(r => r.id === selectedRoleId)?.name === ROLES.SUPER_ADMIN && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm font-semibold">
                      ⚠️ Advertencia: Estás asignando el rol de Super Admin
                    </p>
                    <p className="text-red-600 text-sm mt-1">
                      Este rol tiene acceso total al sistema y puede asignar otros Super Admins.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAssignRoleModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignRole}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Asignar Rol
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
