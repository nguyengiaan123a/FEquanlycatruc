import { useState } from 'react';
import apiClient from '../services/api';
import Button from '../Component/Button';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Sử dụng apiClient (có withCredentials: true)
      const response = await apiClient.post('/api/dang-nhap', {
        username,
        password,
      });


      // Axios tự động parse JSON và lưu vào thuộc tính `data`
      const data = response.data;
         if (data.success === true) {

        // Chuyển hướng người dùng vào trang trong tại đây
        window.location.href = '/trang-chu';
        
      }else {
        setErrorMessage(data.message );
      }
   
      
   

    } catch (error: any) {
      // Axios sẽ tự động throw error nếu HTTP status code không nằm trong khoảng 2xx
      if (error.response) {
        // Lỗi từ server trả về (ví dụ: 400, 401)
        // Bạn có thể tùy chỉnh hiển thị thông báo lỗi chi tiết từ server nếu API có hỗ trợ trả về (VD: error.response.data.message)
        setErrorMessage('Sai tài khoản hoặc mật khẩu!'); 
      } else if (error.request) {
        // Lỗi không nhận được phản hồi từ server (mất mạng, server sập...)
        setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      } else {
        // Lỗi khác khi setup request
        setErrorMessage(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Wrapper: Trải rộng toàn bộ chiều cao (min-h-screen) và chiều ngang (w-full)
    <div className="flex min-h-screen w-full">
      
      {/* Cột Trái: Phần Banner/Giới thiệu (Chỉ hiển thị trên màn hình lớn từ lg trở lên) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 items-center justify-center p-12 text-white">
        <div className="max-w-lg text-center">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight">
            Hệ Thống Quản Lý Y Học Cổ Truyền
          </h1>
          <p className="text-lg text-blue-200">
            Chào mừng bạn quay trở lại. Đăng nhập để truy cập vào bảng điều khiển và bắt đầu phiên làm việc của bạn.
          </p>
        </div>
      </div>

      {/* Cột Phải: Khu vực Form đăng nhập (Chiếm toàn màn hình trên điện thoại, 50% trên PC) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 px-8 py-12 sm:px-12">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
          
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Đăng Nhập
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Vui lòng điền thông tin tài khoản của bạn
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            {/* Hiển thị lỗi */}
            {errorMessage && (
              <div className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              {/* Ô nhập Tài khoản */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tài khoản
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="Nhập tên tài khoản"
                />
              </div>

              {/* Ô nhập Mật khẩu */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Nút Đăng nhập */}
            <Button title={isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'} 
                  type="submit"
                  disabled={isLoading} 
                  className="w-full" 
            />
          
          </form>

        </div>
      </div>
      
    </div>
  );
}