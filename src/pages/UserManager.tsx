import React, { useState, useEffect } from 'react';
import apiClient from "../services/api"; // Đường dẫn tuỳ thuộc vào cấu trúc thư mục của bạn
import { Edit3, Trash2, Search, Plus, ChevronLeft, ChevronRight, X, Shield, User } from 'lucide-react';

// Định nghĩa interface cho dữ liệu User trả về từ danh sách
interface UserItem {
  id: string;
  username: string;
  fullName: string;
  roleName?: string;
  // Thêm các trường khác nếu API danh sách trả về
}

// Định nghĩa interface cho form data
interface UserFormData {
  username: string;
  password?: string;
  fullname: string;
  gender: number;
  dateofBird: string;
  roleName: string;
}

interface role{
    id: string;
    name: string;
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, pageSize: 15 });
  const [roles, setRoles] = useState<role[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Khởi tạo formData chuẩn theo cấu trúc bạn cung cấp
  const initialFormState: UserFormData = {
    username: '',
    password: '',
    fullname: '',
    gender: 0, // 0: Nam, 1: Nữ, 2: Khác
    dateofBird: new Date().toISOString().split('T')[0], // Mặc định ngày hôm nay format yyyy-mm-dd
    roleName: 'CUSTOMER'
  };
  const [formData, setFormData] = useState<UserFormData>(initialFormState);

  // State cho Popup xác nhận Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // 1. Lấy danh sách User
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/danh-sach-tai-khoan', {
        params: { page: pagination.currentPage, pagesize: pagination.pageSize, search: searchTerm }
      });
      // Giả định API trả về { success: true, totalPage: number, data: [] }
      setUsers(response.data.data || []);
      setPagination(prev => ({ ...prev, totalPages: response.data.totalPage || 1 }));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };
  //2.lấy danh sách role
    const fetchRoles = async () => {
    try {
        const response = await apiClient.get('/api/Role', { params: { page: 1, pagesize: 1000  ,search: ""} });
        setRoles(response.data.data || []);
    } catch (error) {
        console.error("Lỗi lấy danh sách role:", error);
    }    
    };


  useEffect(() => {
    fetchData();
    fetchRoles();
  }, [pagination.currentPage, searchTerm]);

  // 2. Thêm mới hoặc Cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Chuẩn bị payload, format lại ngày giờ chuẩn ISO nếu cần
      const payload = {
        ...formData,
        dateofBird: new Date(formData.dateofBird).toISOString()
      };

      // Nếu đang edit mà không nhập password, ta xóa trường password đi để API không báo lỗi
      if (editingId && !payload.password) {
        delete payload.password;
      }

      if (editingId) {
        // Cập nhật: PUT /api/cap-nhat-tai-khoan/{id}
        await apiClient.put(`/api/cap-nhat-tai-khoan/${editingId}`, payload);
      } else {
        // Thêm mới: POST /api/dang-ky-tai-khoan
        await apiClient.post('/api/dang-ky-tai-khoan', payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Thao tác thất bại! Vui lòng kiểm tra lại dữ liệu.");
    }
  };

  // 3. Xóa User
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiClient.delete(`/api/xoa-tai-khoan/${itemToDelete}`);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi khi xóa!");
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    // Format lại ngày tháng cho thẻ <input type="date" />
    const formattedDate = item.dateofBird 
      ? item.dateofBird.split('T')[0] 
      : initialFormState.dateofBird;

    setFormData({ 
      username: item.username || item.userName || '', 
      password: item.password || '', // Luôn để trống password khi mở form sửa
      fullname: item.fullname || item.fullName || '', 
      gender: item.gender ?? 0, 
      dateofBird: formattedDate,
      roleName: item.role || 'CUSTOMER'
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full overflow-hidden bg-white font-sans text-gray-800">
      
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3 bg-white shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Quản lý Tài khoản</h1>
          <p className="text-xs text-gray-500">Danh sách người dùng và phân quyền hệ thống</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Tìm tên hoặc tài khoản..."
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
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600 w-16 text-center">STT</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600">Tài khoản</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600">Họ và tên</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600 text-center w-32">Quyền (Role)</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600 text-right w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10"><div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">Không tìm thấy dữ liệu</td></tr>
            ) : (
              users.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3 text-center font-medium text-sm text-gray-500">
                    {/* Tính số thứ tự dựa trên trang hiện tại */}
                    {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-800">{item.username || item.username}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: {item.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-700">
                    {item.fullName || item.fullname}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center gap-1 w-max mx-auto">
                      <Shield className="w-3 h-3" />
                      {item.role || 'N/A'}
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
            disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
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
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold uppercase text-gray-700">{editingId ? 'Chỉnh sửa Tài khoản' : 'Tạo Tài khoản mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Tài khoản (Username)</label>
                  <input required type="text" disabled={!!editingId} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="Nhập tên đăng nhập" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Mật khẩu</label>
                  <input required={!editingId} type="password" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={editingId ? "Bỏ trống nếu không đổi" : "Nhập mật khẩu"} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Họ và tên (Fullname)</label>
                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})} placeholder="Nhập họ và tên đầy đủ" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Giới tính</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700" value={formData.gender} onChange={(e) => setFormData({...formData, gender: parseInt(e.target.value)})}>
                    <option value={0}>Nam</option>
                    <option value={1}>Nữ</option>
                    <option value={2}>Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Ngày sinh</label>
                  <input required type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700" value={formData.dateofBird} onChange={(e) => setFormData({...formData, dateofBird: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Phân quyền (RoleName)</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700" value={formData.roleName} onChange={(e) => setFormData({...formData, roleName: e.target.value})}>
                  <option value="">-- Chọn phân quyền --</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-md transition-all active:scale-[0.98] text-sm uppercase">
                  Lưu dữ liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000] animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-xs shadow-xl p-6 text-center border border-gray-200 zoom-in-95">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-1">Xác nhận xóa tài khoản?</h3>
            <p className="text-xs text-gray-500 mb-5">Hành động này sẽ xóa dữ liệu người dùng và không thể hoàn tác.</p>
            <div className="flex gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg text-xs transition-colors">Hủy</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;