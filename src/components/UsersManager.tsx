import React, { useState } from 'react';
import {
  Users,
  Plus,
  UserCheck,
  User as UserIcon,
  Trash2,
  KeyRound,
  Building2,
  Lock,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Edit2,
  CheckCircle2,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { User, Venture, UserRole } from '../types';

interface UsersManagerProps {
  users: User[];
  ventures: Venture[];
  currentUser: User | null;
  activeVentureId: string;
  onSaveUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersManager: React.FC<UsersManagerProps> = ({
  users,
  ventures,
  currentUser,
  activeVentureId,
  onSaveUser,
  onDeleteUser,
}) => {
  const isRoot = currentUser?.role === 'root';
  const isAdmin = currentUser?.role === 'admin';

  // Admin only sees users of their own venture. Root sees all or can filter by venture.
  const [ventureFilter, setVentureFilter] = useState<string>(
    isRoot ? 'all' : (currentUser?.ventureId || activeVentureId)
  );

  // New User Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<{ [id: string]: boolean }>({});

  // New User Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(isRoot ? 'admin' : 'invitado');
  const [ventureId, setVentureId] = useState<string>(
    isRoot ? activeVentureId : (currentUser?.ventureId || activeVentureId)
  );
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Edit User & Reset Password Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  // Ocultar la información del usuario root de la página Control de Usuarios
  const filteredUsers = users.filter((u) => {
    // Hide root user from the table and list
    if (u.role === 'root') return false;

    if (!isRoot) {
      // Admin sees users belonging strictly to their venture
      return u.ventureId === (currentUser?.ventureId || activeVentureId);
    }
    if (ventureFilter === 'all') return true;
    return u.ventureId === ventureFilter;
  });

  const openNewModal = () => {
    setName('');
    setUsername('');
    setPassword('');
    setRole(isRoot ? 'admin' : 'invitado');
    setVentureId(isRoot ? activeVentureId : (currentUser?.ventureId || activeVentureId));
    setEmail('');
    setFormErrors({});
    setIsNewModalOpen(true);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!name.trim()) errors.name = 'El nombre completo es obligatorio.';
    if (!username.trim()) errors.username = 'El nombre de usuario es obligatorio.';
    if (!password.trim() || password.length < 4) {
      errors.password = 'La contraseña debe tener al menos 4 caracteres.';
    }

    // Check unique username
    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      errors.username = 'Ese nombre de usuario ya existe en el sistema.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Target venture: if not root, always lock to current user's venture
    const targetVentureId = isRoot ? ventureId : (currentUser?.ventureId || activeVentureId);

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      role: isRoot ? role : 'invitado', // Admin can only create invitados
      ventureId: targetVentureId,
      email: email.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveUser(newUser);
    setIsNewModalOpen(false);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email || '');
    setEditPassword('');
    setShowEditPassword(false);
    setEditErrors({});
    setEditSuccessMsg(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const errors: { [key: string]: string } = {};

    if (!editName.trim()) {
      errors.name = 'El nombre completo es obligatorio.';
    }

    if (editPassword.trim() && editPassword.trim().length < 4) {
      errors.password = 'La nueva contraseña debe tener al menos 4 caracteres.';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    const updatedUser: User = {
      ...editingUser,
      name: editName.trim(),
      email: editEmail.trim() || undefined,
      password: editPassword.trim() ? editPassword.trim() : editingUser.password,
    };

    onSaveUser(updatedUser);
    setEditSuccessMsg('¡Usuario y credenciales actualizados con éxito!');
    setTimeout(() => {
      setEditingUser(null);
    }, 1200);
  };

  const handleDelete = (id: string, uName: string) => {
    if (id === currentUser?.id) {
      alert('No puede eliminar su propia cuenta activa.');
      return;
    }
    if (window.confirm(`¿Está seguro de eliminar al usuario "${uName}"?`)) {
      try {
        onDeleteUser(id);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Error al eliminar usuario.');
      }
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const getVentureName = (vId: string | null) => {
    if (!vId) return 'Emprendimiento';
    const v = ventures.find((item) => item.id === vId);
    return v ? v.name : 'Emprendimiento';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Control de Usuarios y Roles de Acceso
              </h1>
              <p className="text-xs text-slate-500">
                {isRoot
                  ? 'Gestión total de Administradores e Invitados por emprendimiento'
                  : 'Gestión de Usuarios Invitados para su emprendimiento'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-700/20 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isRoot ? '+ Crear Administrador / Invitado' : '+ Crear Usuario Invitado'}</span>
        </button>
      </div>

      {/* Role Hierarchy Cards (root info hidden) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-800 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-extrabold text-slate-900 block">1. Administrador (admin)</span>
            <span className="text-slate-500 text-[11px] leading-relaxed">
              Controla costos, recetas y presupuestos de su emprendimiento. Puede crear usuarios invitados, actualizar sus datos y restablecer sus contraseñas.
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-800 shrink-0">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-extrabold text-slate-900 block">2. Invitado (invitado)</span>
            <span className="text-slate-500 text-[11px] leading-relaxed">
              Accede a su emprendimiento asignado para consultar catálogo, emitir presupuestos y dar seguimiento a pedidos de producción.
            </span>
          </div>
        </div>
      </div>

      {/* Filter by Venture for Root only */}
      {isRoot && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Filtrar por Emprendimiento:</span>
            <select
              value={ventureFilter}
              onChange={(e) => setVentureFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">Todos los usuarios ({filteredUsers.length})</option>
              {ventures.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {filteredUsers.length} usuarios listados
          </span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-3">Nombre Completo</th>
                <th className="py-3 px-3">Correo Electrónico</th>
                <th className="py-3 px-3">Rol</th>
                {isRoot && <th className="py-3 px-3">Emprendimiento</th>}
                <th className="py-3 px-3">Contraseña</th>
                <th className="py-3 px-3">Alta</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((u) => {
                const isPasswordShown = !!showPassword[u.id];
                // Admin can edit users of their own venture; Root can edit any listed user
                const canManageUser = isRoot || (isAdmin && u.ventureId === (currentUser?.ventureId || activeVentureId));

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-[11px]">
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{u.username}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {u.name}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {u.email || <span className="text-slate-300 italic">No especificado</span>}
                    </td>
                    <td className="py-3 px-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          <UserCheck className="w-2.5 h-2.5" /> ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <UserIcon className="w-2.5 h-2.5" /> INVITADO
                        </span>
                      )}
                    </td>
                    {isRoot && (
                      <td className="py-3 px-3 text-slate-600">
                        <span className="font-semibold text-slate-800">{getVentureName(u.ventureId)}</span>
                      </td>
                    )}
                    <td className="py-3 px-3 font-mono text-slate-600">
                      <div className="flex items-center gap-2">
                        <span>{isPasswordShown ? u.password : '••••••••'}</span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={isPasswordShown ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                          {isPasswordShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canManageUser && (
                          <button
                            onClick={() => openEditModal(u)}
                            title="Editar usuario y restablecer contraseña"
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canManageUser && (
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            title="Eliminar usuario"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Crear Nuevo Usuario */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {isRoot ? 'Crear Nuevo Usuario' : 'Crear Usuario Invitado'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Asignación de credenciales con contraseña</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4">
              {/* Role selection (only visible for Root) */}
              {isRoot ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rol del Usuario <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        role === 'admin'
                          ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Administrador</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('invitado')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        role === 'invitado'
                          ? 'bg-purple-50 border-purple-500 text-purple-800 ring-2 ring-purple-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5 text-purple-600" />
                      <span>Invitado</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 font-medium">
                  Creando nuevo usuario con rol <strong>Invitado</strong>.
                </div>
              )}

              {/* Venture assignment (SOLO para Root; los nombres de los demás emprendimientos están completamente ocultos para el administrador) */}
              {isRoot && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emprendimiento Asignado <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={ventureId}
                    onChange={(e) => setVentureId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {ventures.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Mariana Gómez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre de Usuario <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. mariana_ventas"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.username ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.username && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.password && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.password}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="ej. usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-700/20 transition-all cursor-pointer"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Editar Usuario & Restablecer Contraseña (para administrador y root) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Editar Usuario & Restablecer Contraseña</h3>
                  <p className="text-[11px] text-slate-400">
                    Usuario: <span className="text-cyan-300 font-mono font-bold">{editingUser.username}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editSuccessMsg ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-slate-900">¡Usuario Actualizado!</h4>
                <p className="text-xs text-slate-500">{editSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                {/* Nombre Completo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      editErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                  {editErrors.name && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{editErrors.name}</p>
                  )}
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    placeholder="ej. usuario@empresa.com"
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Restablecer Contraseña */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Restablecer Contraseña</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-tight">
                    Deja este campo en blanco si deseas conservar la contraseña actual del usuario.
                  </p>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editPassword}
                      placeholder="Nueva contraseña (mínimo 4 caracteres)"
                      onChange={(e) => setEditPassword(e.target.value)}
                      className={`w-full px-3 py-2 text-xs bg-white border rounded-xl text-slate-900 font-mono pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        editErrors.password ? 'border-rose-400 bg-rose-50/30' : 'border-amber-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {editErrors.password && (
                    <p className="text-[11px] text-rose-500 font-medium">{editErrors.password}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-700/20 transition-all cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
