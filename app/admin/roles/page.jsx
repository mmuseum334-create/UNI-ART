'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { usePermissions } from '@/hooks/usePermissions';
import { roleService } from '@/services/rbac/roleService';
import { RESOURCES, PERMISSIONS } from '@/services/rbac/permissionService';

/**
 * Página de administración de roles
 * Solo accesible para administradores
 */
export default function RolesAdminPage() {
  return (
    <ProtectedRoute adminOnly redirectTo="/">
      <RolesAdminContent />
    </ProtectedRoute>
  );
}

function RolesAdminContent() {
  const router = useRouter();
  const { isAdmin, isSuperAdmin } = usePermissions();

  const [roles, setRoles] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Form states
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePermissions, setRolePermissions] = useState({});

  useEffect(() => {
    loadRoles();
    loadResources();
  }, []);

  const loadRoles = async () => {
    setIsLoading(true);
    const result = await roleService.getAllRoles();
    if (result.success) {
      setRoles(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const loadResources = async () => {
    const result = await roleService.getAvailableResources();
    if (result.success) {
      setResources(result.data);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();

    const result = await roleService.createRole({
      name: roleName,
      description: roleDescription,
    });

    if (result.success) {
      setShowCreateModal(false);
      setRoleName('');
      setRoleDescription('');
      loadRoles();
    } else {
      alert(result.error);
    }
  };

  const handleEditRole = async (e) => {
    e.preventDefault();

    const result = await roleService.updateRole(selectedRole.id, {
      name: roleName,
      description: roleDescription,
    });

    if (result.success) {
      setShowEditModal(false);
      setSelectedRole(null);
      setRoleName('');
      setRoleDescription('');
      loadRoles();
    } else {
      alert(result.error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('¿Estás seguro de eliminar este rol?')) return;

    const result = await roleService.deleteRole(roleId);
    if (result.success) {
      loadRoles();
    } else {
      alert(result.error);
    }
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setShowEditModal(true);
  };

  const openPermissionsModal = (role) => {
    setSelectedRole(role);

    // Convertir permisos del rol a formato del estado
    const perms = {};
    role.permissions?.forEach(p => {
      perms[p.resource] = {
        canView: p.canView,
        canCreate: p.canCreate,
        canEdit: p.canEdit,
        canDelete: p.canDelete,
      };
    });

    setRolePermissions(perms);
    setShowPermissionsModal(true);
  };

  const handlePermissionChange = (resource, permission, value) => {
    setRolePermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [permission]: value,
      },
    }));
  };

  const handleSavePermissions = async () => {
    // Convertir permisos a formato del backend
    const permissions = Object.entries(rolePermissions).map(([resource, perms]) => ({
      resource,
      ...perms,
    }));

    const result = await roleService.assignPermissions(selectedRole.id, permissions);

    if (result.success) {
      setShowPermissionsModal(false);
      setSelectedRole(null);
      setRolePermissions({});
      loadRoles();
    } else {
      alert(result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando roles...</p>
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

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Roles</h1>
              <p className="text-gray-600 mt-2">Administra los roles y permisos del sistema</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              + Crear Rol
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Roles table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuarios
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{role.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{role.description || 'Sin descripción'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{role.userCount || 0} usuarios</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openPermissionsModal(role)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Permisos
                    </button>
                    <button
                      onClick={() => openEditModal(role)}
                      className="text-purple-600 hover:text-purple-900 mr-4"
                    >
                      Editar
                    </button>
                    {role.name !== 'super_admin' && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal: Crear Rol */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Crear Nuevo Rol</h2>

              <form onSubmit={handleCreateRole}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Nombre del Rol</label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Editar Rol */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Editar Rol</h2>

              <form onSubmit={handleEditRole}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Nombre del Rol</label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Permisos */}
        {showPermissionsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                Permisos del Rol: {selectedRole?.name}
              </h2>

              <div className="space-y-4">
                {Object.values(RESOURCES).map((resource) => (
                  <div key={resource} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-lg">{resource}</h3>

                    <div className="grid grid-cols-4 gap-4">
                      {['canView', 'canCreate', 'canEdit', 'canDelete'].map((permission) => (
                        <label key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={rolePermissions[resource]?.[permission] || false}
                            onChange={(e) => handlePermissionChange(resource, permission, e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm">
                            {permission.replace('can', '')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePermissions}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Guardar Permisos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
