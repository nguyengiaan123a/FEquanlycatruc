import React, { useState, useEffect } from 'react';
import apiClient from "../services/api";
import { Edit3, Trash2, Search, Plus, ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';

const CTMenuManager = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, pageSize: 15 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', order: 0, status: 1, thumnail: '' });

  // State cho Popup xác nhận Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // 1. Lấy danh sách Menu
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/danh-sach-danh-muc-menu', {
        params: { page: pagination.currentPage, pagesize: pagination.pageSize, search: searchTerm }
      });
      setMenus(response.data.data);
      setPagination(prev => ({ ...prev, totalPages: response.data.totalPages }));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, searchTerm]);

  // 2. Thêm mới hoặc Cập nhật (Theo Swagger: /api/CTmenu)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Cập nhật: PUT /api/CTmenu/{id}
        await apiClient.put(`/api/CTmenu/${editingId}`, formData);
      } else {
        // Thêm mới: POST /api/CTmenu
        await apiClient.post('/api/CTmenu', formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert("Thao tác thất bại! Vui lòng kiểm tra lại kết nối API.");
    }
  };

  // 3. Xóa Menu (Theo Swagger: /api/CTmenu/{id})
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiClient.delete(`/api/CTmenu/${itemToDelete}`);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      alert("Lỗi khi xóa!");
    }
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({ 
      title: item.title, 
      order: item.order, 
      status: item.status, 
      thumnail: item.thumnail || '' 
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', order: 0, status: 1, thumnail: '' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full overflow-hidden bg-white font-sans text-gray-800">
      
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3 bg-white shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Danh mục Menu</h1>
          <p className="text-xs text-gray-500">Quản lý điều hướng hệ thống</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-95 text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600 w-20 text-center">STT</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600 text-center w-24">Icon</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600">Tên danh mục</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600 text-center w-40">Trạng thái</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600 text-right w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10"><div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div></td></tr>
            ) : menus.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10 text-sm text-gray-400">Không tìm thấy dữ liệu</td></tr>
            ) : (
              menus.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3 text-center font-medium text-sm text-gray-500">{item.order}</td>
                  <td className="px-5 py-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mx-auto border border-gray-200 overflow-hidden">
                      {item.thumnail ? (
                        <img 
                          src={item.thumnail} 
                          className="w-full h-full object-cover" 
                          alt="icon" 
                          onError={(e) => { e.target.src = 'https://api.iconify.design/lucide/image-off.svg?color=%23cbd5e1'; }}
                        />
                      ) : (
                        <img src="https://api.iconify.design/lucide/list.svg?color=%23475569" className="w-4 h-4" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: {item.id}</div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      item.status === 1 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {item.status === 1 ? 'Hoạt động' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
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

      {/* Pagination Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0 text-xs">
        <span className="font-medium text-gray-500">Trang {pagination.currentPage} / {pagination.totalPages}</span>
        <div className="flex gap-1">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
            className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
            className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold uppercase text-gray-700">{editingId ? 'Chỉnh sửa Menu' : 'Thêm danh mục mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Tên danh mục</label>
                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Link Icon (URL)</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="url" 
                    placeholder="https://api.iconify.design/..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.thumnail} 
                    onChange={(e) => setFormData({...formData, thumnail: e.target.value})} 
                  />
                  {formData.thumnail && (
                    <div className="w-10 h-10 shrink-0 bg-white border border-gray-200 rounded-lg p-1">
                      <img src={formData.thumnail} alt="preview" className="w-full h-full object-contain" onError={(e) => e.target.style.opacity='0'} />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Thứ tự</label>
                  <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Trạng thái</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={formData.status} onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}>
                    <option value={1}>Hiện (Active)</option>
                    <option value={0}>Ẩn (Hidden)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-md transition-all active:scale-[0.98] mt-2 text-sm uppercase">
                Lưu dữ liệu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
          <div className="bg-white rounded-xl w-full max-w-xs shadow-xl p-6 text-center border border-gray-200">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-1">Xác nhận xóa?</h3>
            <p className="text-xs text-gray-500 mb-5">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg text-xs">Hủy</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-xs">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTMenuManager;