import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import apiClient from "../services/api";
import Loading from "../Component/Loading";

const ProtectedBlankRoute = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [allowedUrls, setAllowedUrls] = useState<string[]>([]);
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndFetchMenus = async () => {
      try {
        await apiClient.get("/api/user");

        const resMenu = await apiClient.get("/api/Authorization");
        let urls = ["/trang-chu"];
        if (resMenu.data && resMenu.data.success) {
          resMenu.data.data.forEach((category: any) => {
            category.menus.forEach((menu: any) => {
              if (menu.url && menu.url !== "/#" && menu.url !== "#") {
                urls.push(menu.url);
              }
            });
          });
        }
        setAllowedUrls(urls);
        setIsAuth(true);
      } catch (err: any) {
        setIsAuth(false);
      }
    };
    checkAuthAndFetchMenus();
  }, []);

  if (isAuth === null) return <Loading />;
  if (!isAuth) return <Navigate to="/login" replace />;

  const isAllowed = allowedUrls.some(url => {
    if (url === location.pathname) return true;
    if (location.pathname.startsWith(`${url}/`)) return true;
    return false;
  });

  if (allowedUrls.length > 0 && location.pathname !== "/" && location.pathname !== "/trang-chu" && !isAllowed) {
    return <Navigate to="/trang-chu" replace />;
  }

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <Outlet />
    </div>
  );
};

export default ProtectedBlankRoute;
