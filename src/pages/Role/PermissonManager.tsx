import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from "../../services/api";
import type { ICategoryGroup } from '../../types/Menu/ICategoryGroup';
import { Search, ShieldCheck, Save, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

interface IRolePermission {
  id_RolePermission: number;
  roleId: string;
  id_menu: number;
}

const PermissonManager: React.FC = () => {
  const { id, name } = useParams<{ id: string; name: string }>();
  const navigate = useNavigate();

  const [groups, setGroups] = useState<ICategoryGroup[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<IRolePermission[]>([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [menuRes, permRes] = await Promise.all([
        apiClient.get('/api/danh-sach-menu', { params: { page: 1, pagesize: 500 } }),
        apiClient.get('/api/RolePermission')
      ]);

      const menuData = menuRes.data?.data || menuRes.data || [];
      setGroups(menuData);

      const allPerms: any[] = Array.isArray(permRes.data) ? permRes.data : [];
      const currentRolePerms = allPerms.filter(p => 
        (p.roleId || p.RoleId)?.toString().toLowerCase() === id.toLowerCase()
      ).map(p => ({
        id_RolePermission: p.id_RolePermission || p.Id_RolePermission,
        roleId: p.roleId || p.RoleId,
        id_menu: p.id_menu || p.Id_menu
      }));

      setOriginalPermissions(currentRolePerms);
      setSelectedMenuIds(currentRolePerms.map(p => p.id_menu));
    } catch (error: any) {
      alert("Lỗi tải dữ liệu: " + (error.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheckboxChange = (menuId: number) => {
    setSelectedMenuIds(prev => prev.includes(menuId) ? prev.filter(mid => mid !== menuId) : [...prev, menuId]);
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      const toAdd = selectedMenuIds
        .filter(menuId => !originalPermissions.some(p => p.id_menu === menuId))
        .map(menuId => ({ roleId: id, id_menu: menuId }));

      const toDeleteIds = originalPermissions
        .filter(p => !selectedMenuIds.includes(p.id_menu))
        .map(p => p.id_RolePermission);

      await apiClient.put('/api/RolePermission', toAdd, {
        params: { ids: toDeleteIds },
        paramsSerializer: { indexes: null }
      });

      alert('Lưu thành công!');
      fetchData();
    } catch (error: any) {
      alert("Lỗi: " + (error.response?.data?.message || "Lỗi lưu dữ liệu"));
    } finally {
      setSaving(false);
    }
  };

  // Tối ưu hóa việc lọc và hiển thị
  const filteredGroups = groups.map(g => {
    const rawMenus = (g as any).menus || (g as any).Menus || [];
    return {
      ...g,
      displayMenus: rawMenus.filter((m: any) => 
        (m.title || m.Title || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    };
  }).filter(g => g.displayMenus.length > 0);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full overflow-hidden bg-[#f8fafc] text-gray-900 font-sans">
      <div className="px-6 py-4 border-b bg-white flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-600" /> PHÂN QUYỀN TRUY CẬP</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vai trò: <span className="text-blue-600">{name || id}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Tìm tên chức năng..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button disabled={saving || loading} onClick={handleSavePermissions} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-all">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Đang lưu...' : 'Lưu quyền'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400"><Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" /><p>Đang tải dữ liệu...</p></div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">Không tìm thấy danh mục menu nào.</div>
        ) : (
          filteredGroups.map((group: any) => (
            <div key={group.id_Ctmenu || group.Id_Ctmenu} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b flex justify-between items-center font-bold text-xs uppercase tracking-wider text-gray-600">
                <span>Danh mục: {group.title_Ctmenu || group.Title_Ctmenu}</span>
              </div>
              <div className="flex flex-col divide-y divide-gray-100">
                {group.displayMenus.map((menu: any) => {
                  const mId = menu.id || menu.Id;
                  const isChecked = selectedMenuIds.includes(mId);
                  return (
                    <div key={mId} onClick={() => handleCheckboxChange(mId)} className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-blue-50/40 transition-all ${isChecked ? 'bg-blue-50/20' : ''}`}>
                      <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={isChecked} readOnly />
                      <div className="flex-1 truncate"><div className={`text-sm font-bold ${isChecked ? 'text-blue-700' : 'text-gray-700'}`}>{menu.title || menu.Title}</div><div className="text-[10px] text-gray-400 font-mono truncate">{menu.url || menu.Url || '#'}</div></div>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PermissonManager;