import React, { useState, useEffect } from 'react';
import apiClient from "../../services/api";
import { Edit3, Trash2, Search, Plus, ChevronLeft, ChevronRight, X, Shield, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Định nghĩa Interface cho dữ liệu Role
interface Role {
  id: string;
  name: string;
}

interface RoleVM {
  name: string;
}

const RoleManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, pageSize: 10 });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RoleVM>({ name: '' });
  const navigate = useNavigate();
  // State cho Popup xác nhận Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // 1. Lấy danh sách Role
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/Role', {
        params: { 
          page: pagination.currentPage, 
          pagesize: pagination.pageSize, 
          search: searchTerm 
        }
      });
      // Giả định API trả về đúng cấu trúc { totalPages, data: [...] }
      setRoles(response.data.data);
      setPagination(prev => ({ ...prev, totalPages: response.data.totalPages }));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu Role:", error);
    } finally {
      setLoading(false);
    }
  };
const handleAssignPermission = (roleId: string,name: string) => {
    // Chuyển hướng sang trang permission kèm theo ID của Role
    navigate(`/quan-ly-role/${roleId}/${name}`);
  };

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, searchTerm]);

  // 2. Thêm mới hoặc Cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Cập nhật: PUT /api/Role/{id}
        await apiClient.put(`/api/Role/${editingId}`, formData);
      } else {
        // Thêm mới: POST /api/Role
        await apiClient.post('/api/Role', formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Thao tác thất bại!");
    }
  };

  // 3. Xóa Role
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiClient.delete(`/api/Role/${itemToDelete}`);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      alert("Lỗi khi xóa quyền!");
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const openEdit = (item: Role) => {
    setEditingId(item.id);
    setFormData({ name: item.name });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full overflow-hidden bg-white font-sans text-gray-800">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3 bg-white shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Quản lý Quyền (Roles)
          </h1>
          <p className="text-xs text-gray-500">Phân quyền truy cập hệ thống</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Tìm tên quyền..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-95 text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Thêm Quyền
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-bold text-xs uppercase text-gray-600 w-16 text-center">STT</th>
              <th className="px-6 py-3 font-bold text-xs uppercase text-gray-600">Tên Quyền</th>
              <th className="px-6 py-3 font-bold text-xs uppercase text-gray-600">Mã (ID)</th>
              <th className="px-6 py-3 font-bold text-xs uppercase text-gray-600 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10"><div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div></td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-sm text-gray-400">Không có dữ liệu quyền</td></tr>
            ) : (
              roles.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-sm text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">{item.id}</code>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleAssignPermission(item.id, item.name)} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-all"title="Phân quyền cho Role này"><Key className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => confirmDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0 text-xs">
        <span className="font-medium text-gray-500">Trang {pagination.currentPage} / {pagination.totalPages}</span>
        <div className="flex gap-1">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
            className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
            className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold uppercase text-gray-700">{editingId ? 'Cập nhật Quyền' : 'Thêm Quyền mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Tên Quyền (Ví dụ: Admin, Editor...)</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Nhập tên quyền..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ name: e.target.value })} 
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-md transition-all active:scale-[0.98] text-sm uppercase">
                  {editingId ? 'Cập nhật ngay' : 'Tạo quyền mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
          <div className="bg-white rounded-xl w-full max-w-xs shadow-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-1">Xóa quyền này?</h3>
            <p className="text-xs text-gray-500 mb-5">Dữ liệu liên quan đến quyền này có thể bị ảnh hưởng.</p>
            <div className="flex gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg text-xs">Hủy</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-xs">Xác nhận Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManager;