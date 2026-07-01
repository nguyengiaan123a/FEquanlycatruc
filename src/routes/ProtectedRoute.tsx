import { useEffect, useState } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import apiClient from "../services/api";
import Loading from "../Component/Loading";
import logoBv from "../Asset/logobv.png";

const ProtectedRoute = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>("User");

  // State lưu danh sách Menu từ API và mảng các URL được phép truy cập
  const [menuData, setMenuData] = useState<any[]>([]);
  const [allowedUrls, setAllowedUrls] = useState<string[]>([]);

  // State quản lý việc Đóng/Mở của các danh mục cha
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  // State quản lý menu trên thiết bị di động
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const checkAuthAndFetchMenus = async () => {
      try {
        const resUser = await apiClient.get("/api/user");
        setUserName(resUser.data.username || "Admin");

        const resMenu = await apiClient.get("/api/Authorization");

        if (resMenu.data && resMenu.data.success) {
          let fetchedMenus = resMenu.data.data;

          // Sắp xếp danh mục cha (Category) theo order_ct từ thấp đến cao
          fetchedMenus.sort((a: any, b: any) => a.order_ct - b.order_ct);

          // Sắp xếp các menu con bên trong theo order_menu từ thấp đến cao
          fetchedMenus.forEach((category: any) => {
            if (category.menus && Array.isArray(category.menus)) {
              category.menus.sort((a: any, b: any) => a.order_menu - b.order_menu);
            }
          });

          setMenuData(fetchedMenus);

          let urls = ["/trang-chu"];
          fetchedMenus.forEach((category: any) => {
            category.menus.forEach((menu: any) => {
              if (menu.url && menu.url !== "/#" && menu.url !== "#") {
                urls.push(menu.url);
              }
            });
          });
          setAllowedUrls(urls);
        }

        setIsAuth(true);
      } catch (err: any) {
        setIsAuth(false);
      }
    };
    checkAuthAndFetchMenus();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/dang-xuat");
      window.location.href = "/login";
    } catch (error) {
      window.location.href = "/login";
    }
  };

  // Hàm xử lý Đóng/Mở danh mục
  const toggleCategory = (index: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (isAuth === null) return <Loading />;
  if (!isAuth) return <Navigate to="/login" replace />;

  // Kiểm tra quyền (hỗ trợ cả các route có tham số)
  const isAllowed = allowedUrls.some(url => {
    if (url === location.pathname) return true;
    if (location.pathname.startsWith(`${url}/`)) return true;
    return false;
  });

  if (allowedUrls.length > 0 && location.pathname !== "/" && location.pathname !== "/trang-chu" && !isAllowed) {
    return <Navigate to="/trang-chu" replace />;
  }

  // --- THAY ĐỔI MÀU CHỮ Ở ĐÂY ---
  // text-slate-600 đổi thành text-black
  const activeClass = (path: string) =>
    location.pathname === path
      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
      : "text-black hover:bg-slate-100 hover:text-blue-600";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">

      {/* --- BACKDROP MOBILE --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`w-64 bg-white shadow-xl fixed h-full z-30 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex justify-center items-center">
          <img src={logoBv} alt="Logo" className="w-full max-w-[150px] object-contain" />
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-4 flex-1 overflow-y-auto pb-4">
          <p className="text-[10px] font-bold text-black uppercase px-4 mb-2 tracking-widest">Main Menu</p>
          <Link to="/trang-chu" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeClass('/trang-chu')}`}>
            <span className="text-lg">📊</span>
            <span>Dashboard</span>
          </Link>

          {/* RENDER MENU ĐỘNG TỪ API */}
          {menuData.map((category, catIndex) => {
            const isExpanded = expandedCategories[catIndex];

            return (
              <div key={catIndex} className="mt-2 flex flex-col gap-1">

                {/* Khu vực tiêu đề biến thành Nút bấm */}
                <div
                  className="flex items-center justify-between px-4 py-2 mt-2 cursor-pointer group hover:bg-slate-50 rounded-xl transition-colors"
                  onClick={() => toggleCategory(catIndex)}
                >
                  {/* Đổi text-slate-400 thành text-black */}
                  <p className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-2 group-hover:text-blue-500 transition-colors">
                    {category.thumnail && category.thumnail.startsWith("http") && (
                      <img src={category.thumnail} alt="cat-icon" className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    )}
                    {category.title_ctmenu}
                  </p>

                  {/* Icon mũi tên thể hiện đóng mở */}
                  <span className="text-black text-xs transition-transform duration-200">
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </div>

                {/* Render menu con có điều kiện */}
                {isExpanded && (
                  <div className="flex flex-col gap-1 ml-2 border-l-2 border-slate-200 pl-2">
                    {category.menus.map((menu: any, mIndex: number) => {
                      const linkUrl = (menu.url === "/#" || menu.url === "#") ? "#" : menu.url;

                      return (
                        <Link
                          key={mIndex}
                          to={linkUrl}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${activeClass(linkUrl)}`}
                        >
                          {menu.thumnail && menu.thumnail.startsWith("http") ? (
                            <img src={menu.thumnail} alt="menu-icon" className="w-4 h-4" />
                          ) : (
                            <span className="text-base">⚙️</span>
                          )}
                          <span>{menu.title_menu}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-medium text-sm"
          >
            <span className="text-lg">🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* --- NỘI DUNG CHÍNH --- */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full transition-all duration-300">
        <header className="h-20 flex items-center justify-between bg-white/80 backdrop-blur-md px-4 md:px-8 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex flex-col">
              {/* Đổi thành text-black */}
              <h1 className="text-black font-bold text-base sm:text-lg">
                Hệ thống quản lý
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">Chào mừng trở lại, {userName}!</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3">
              <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-black font-semibold text-xs">{userName}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;