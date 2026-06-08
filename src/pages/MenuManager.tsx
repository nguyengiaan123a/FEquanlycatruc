import React, { useState, useEffect } from 'react';
import apiClient from "../services/api";
import type { IMenu } from '../types/Menu/IMenu'; 
import type { ICategoryGroup } from '../types/Menu/ICategoryGroup';
import type { IPagination } from '../types/IPagination';
import type { CategoryMenu } from '../types/Menu/Categorymenu';
import { 
  Edit3, Trash2, Search, Plus, ChevronLeft, 
  ChevronRight, X, Image as ImageIcon, Link as LinkIcon, 
  Layers
} from 'lucide-react';

const MenuManager: React.FC = () => {
  const [groups, setGroups] = useState<ICategoryGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(''); 
  const [ctMenu, setCtmenu] = useState<CategoryMenu[]>([]);
  const [pagination, setPagination] = useState<IPagination>({ 
    currentPage: 1, 
    totalPages: 1, 
    pageSize: 10 
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Partial<IMenu>>({
    title: '',
    url: '',
    thumnail: '',
    order: 0,
    status: 1,
    id_menu: 0
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // --- Actions ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/danh-sach-menu', {
        params: { page: pagination.currentPage, pagesize: pagination.pageSize, search: searchTerm }
      });
      setGroups(response.data.data || []);
      setPagination(prev => ({ ...prev, totalPages: response.data.totalPages || 1 }));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCtMenu = async () => {
    try {
      const response = await apiClient.get('/api/danh-sach-danh-muc-menu', {
         params: { page: 1, pagesize: 100 }
      });
      setCtmenu(response.data.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhóm menu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCtMenu();
  }, [pagination.currentPage, searchTerm]);

  // --- FIX HÀM GET ID & EDIT ---
  const openEdit = async (id: number) => {
    try {
      const response = await apiClient.get(`/api/Menu/${id}`);
      const item = response.data;

      setEditingId(id);
      // Đảm bảo ép kiểu status về number để đồng bộ với select
      setFormData({
        title: item.title,
        url: item.url,
        thumnail: item.thumnail,
        order: Number(item.order),
        status: Number(item.status), 
        id_menu: Number(item.id_menu)
      });
      setIsModalOpen(true);
    } catch (error) {
      alert("Không thể lấy thông tin chi tiết!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ép kiểu lại lần cuối trước khi gửi lên API
      const payload = {
        ...formData,
        order: Number(formData.order),
        id_menu: Number(formData.id_menu),
        status: Number(formData.status) 
      };

      if (editingId) {
        await apiClient.put(`/api/Menu/${editingId}`, payload);
      } else {
        await apiClient.post('/api/Menu', payload);
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert("Lỗi thao tác, vui lòng kiểm tra lại dữ liệu!");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiClient.delete(`/api/Menu/${itemToDelete}`);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      alert("Lỗi khi xóa!");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', url: '', thumnail: '', order: 0, status: 1, id_menu: 0 });
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white font-['Arial'] text-black">
      
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Quản lý danh mục
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold uppercase text-xs tracking-widest transition-all active:scale-95"
          >
            Thêm mới
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {loading && !isModalOpen ? (
          <div className="text-center py-10 font-bold italic">Đang tải...</div>
        ) : (
          groups.map((group) => (
            <div key={group.id_Ctmenu} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800">
                  {group.title_Ctmenu}
                </h2>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                  {group.menus.length} items
                </span>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                    <th className="px-6 py-4 w-16">Thứ tự</th>
                    <th className="px-6 py-4 w-20 text-center">Icon</th>
                    <th className="px-6 py-4">Menu / URL</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {group.menus.map((menu) => (
                    <tr key={menu.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold">{menu.order}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="w-9 h-9 bg-gray-100 rounded flex items-center justify-center mx-auto border border-gray-200 overflow-hidden">
  {menu.thumnail ? (
    <img 
      src={menu.thumnail} 
      className="w-full h-full object-cover" 
      alt="Thumbnail" 
    />
  ) : (
    <img 
      src="https://api.iconify.design/lucide/list.svg?color=%23475569" 
      className="w-5 h-5" 
      alt="List Icon" 
    />
  )}
</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm">{menu.title}</div>
                        <div className="text-[10px] text-gray-400 font-semibold italic uppercase tracking-tight">{menu.url}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                          menu.status === 1 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {menu.status === 1 ? 'Hoạt động' : 'Đang ẩn'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(menu.id)} className="p-2 hover:bg-blue-50 rounded-md transition-all text-black"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => { setItemToDelete(menu.id); setIsDeleteModalOpen(true); }} className="p-2 hover:bg-red-50 rounded-md transition-all text-black"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em]">
                {editingId ? 'Cập nhật Menu' : 'Thêm mới Menu'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-red-50 rounded-full text-black"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Tên menu</label>
                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none focus:border-blue-500" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Đường dẫn (URL)</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none focus:border-blue-500" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Link ảnh (Thumbnail)</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none focus:border-blue-500" value={formData.thumnail} onChange={(e) => setFormData({...formData, thumnail: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Thứ tự</label>
                <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Trạng thái</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none" 
                  value={formData.status} 
                  // QUAN TRỌNG: Phải dùng parseInt để status luôn là Number
                  onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}
                >
                  <option value={1}>HIỆN (ACTIVE)</option>
                  <option value={0}>ẨN (HIDDEN)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Nhóm menu cha</label>
                <select required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none" value={formData.id_menu} onChange={(e) => setFormData({ ...formData, id_menu: parseInt(e.target.value) })}>
                  <option value={0}>-- CHỌN NHÓM --</option>
                  {ctMenu.map((item) => (
                    <option key={item.id} value={item.id}>{item.title.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="col-span-2 bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-[0.3em] mt-2 transition-all active:scale-95">
                Lưu dữ liệu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
             <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Xác nhận xóa?</h3>
             <p className="text-gray-400 text-xs font-bold uppercase mb-8">Dữ liệu sẽ bị gỡ khỏi hệ thống</p>
             <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-lg font-bold text-[10px] uppercase tracking-wider">Hủy</button>
                <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider">Xóa ngay</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;