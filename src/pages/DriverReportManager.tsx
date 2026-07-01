import { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import apiClient from '../services/api';
import Chart from 'chart.js/auto';
import { Car, AlertTriangle, Activity, Navigation, PlusCircle, CheckCircle, Edit3, Trash2, Eye, X } from 'lucide-react';

interface Stats {
  totalShifts: number;
  totalEndingMileage: number;
  totalHospitalTransfers: number;
  totalOutsideEmergencies: number;
  totalIncidents: number;
  chartData: any[];
}

const PIE_COLORS = ['#3b82f6', '#ec4899', '#f59e0b'];

export default function DriverReportManager() {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [newAlert, setNewAlert] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // States cho xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const barChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const pieInstanceRef = useRef<Chart | null>(null);

  const fetchData = async () => {
    try {
      const statsRes = await apiClient.get('/api/DriverShiftReport/stats');
      setStats({
        totalShifts: statsRes.data.totalShifts,
        totalEndingMileage: statsRes.data.totalEndingMileage,
        totalHospitalTransfers: statsRes.data.totalHospitalTransfers,
        totalOutsideEmergencies: statsRes.data.totalOutsideEmergencies,
        totalIncidents: statsRes.data.totalIncidents,
        chartData: statsRes.data.chartData,
      });

      const reportsRes = await apiClient.get('/api/DriverShiftReport?page=1&pageSize=100');
      setReports(reportsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => {
    fetchData();

    const newConnection = new HubConnectionBuilder()
      .withUrl(`${apiClient.defaults.baseURL}shifthub`)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          connection.on('NewDriverReport', (newReport) => {
            setNewAlert(`Có báo cáo ca trực mới từ Tài xế ${newReport.driverName || ''} (Xe ${newReport.licensePlate})!`);
            fetchData();
            setTimeout(() => setNewAlert(null), 5000);
          });
        })
        .catch(e => console.log('Connection failed: ', e));
    }

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);

  useEffect(() => {
    if (stats && barChartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: stats.chartData.map((d: any) => d.date),
          datasets: [{
            label: 'Số ca trực',
            data: stats.chartData.map((d: any) => d.count),
            backgroundColor: '#4f46e5',
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' }
          }
        }
      });
    }
    return () => chartInstanceRef.current?.destroy();
  }, [stats]);

  const pieData = stats ? [
    { name: 'Chuyển viện', value: stats.totalHospitalTransfers },
    { name: 'Cấp cứu ngoại viện', value: stats.totalOutsideEmergencies },
  ] : [];

  useEffect(() => {
    if (stats && pieChartRef.current) {
      if (pieInstanceRef.current) {
        pieInstanceRef.current.destroy();
      }
      pieInstanceRef.current = new Chart(pieChartRef.current, {
        type: 'pie',
        data: {
          labels: pieData.map(d => d.name),
          datasets: [{
            data: pieData.map(d => d.value),
            backgroundColor: PIE_COLORS,
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
    return () => pieInstanceRef.current?.destroy();
  }, [stats]);

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      await apiClient.delete(`/api/DriverShiftReport/${reportToDelete}`);
      setIsDeleteModalOpen(false);
      setReportToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      alert('Đã xảy ra lỗi khi xóa!');
    }
  };

  const confirmDelete = (id: string) => {
    setReportToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = () => {
    alert('Chức năng sửa báo cáo đang được cập nhật...');
    // TODO: Chuyển hướng sang trang sửa hoặc mở modal
  };

  if (!stats) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu Dashboard...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Car className="text-indigo-600" size={36} />
          Dashboard Quản Lý Ca Trực Tài Xế
        </h1>
      </div>

      {newAlert && (
        <div className="mb-6 bg-green-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={24} />
          <span className="font-semibold">{newAlert}</span>
        </div>
      )}

      {/* --- PHẦN 1: DASHBOARD --- */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-3">Thống Kê Tổng Quan</h2>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
              <Activity size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tổng số ca trực</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalShifts}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
              <Navigation size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tổng số KM chốt ca</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalEndingMileage.toLocaleString()} <span className="text-base text-gray-500 font-normal">km</span></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-pink-50 rounded-xl text-pink-600">
              <PlusCircle size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tổng ca Cấp cứu/Chuyển viện</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalHospitalTransfers + stats.totalOutsideEmergencies}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-red-50 rounded-xl text-red-600">
              <AlertTriangle size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Xe Sự cố / Bất thường</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalIncidents}</p>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* CHART BAR */}
          <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Biểu đồ số ca trực (7 ngày qua)</h3>
            <div className="h-64 w-full relative">
              <canvas ref={barChartRef}></canvas>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[330px]">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Phân bổ chuyến đi</h3>
            <div className="flex-1 flex justify-center items-center w-full relative">
              <canvas ref={pieChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* --- PHẦN 2: BẢNG DỮ LIỆU --- */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">Danh Sách Báo Cáo Ca Trực Tài Xế</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                  <th className="p-4 font-semibold w-16 text-center">STT</th>
                  <th className="p-4 font-semibold">Ngày</th>
                  <th className="p-4 font-semibold">Tài xế</th>
                  <th className="p-4 font-semibold">Biển số</th>
                  <th className="p-4 font-semibold">Loại ca</th>
                  <th className="p-4 font-semibold">KM nhận</th>
                  <th className="p-4 font-semibold">KM giao</th>
                  <th className="p-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 text-center text-sm font-medium text-gray-500">{i + 1}</td>
                    <td className="p-4 text-sm text-gray-700 font-medium">{new Date(r.date).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4 font-bold text-gray-800">{r.driverName}</td>
                    <td className="p-4 text-sm font-bold text-indigo-600 uppercase">{r.licensePlate}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        {r.shiftType}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{r.startingMileage} km</td>
                    <td className="p-4 text-sm font-semibold text-gray-800">{r.endingMileage} km</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa báo cáo"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(r.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa báo cáo"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-500 py-10">Không có dữ liệu báo cáo</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL CHI TIẾT */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col zoom-in-95">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                <Car size={24} />
                Chi tiết ca trực Tài xế
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* PHẦN I */}
              <div>
                <h3 className="text-lg font-bold text-indigo-900 border-b-2 border-indigo-100 pb-2 mb-4">I. THÔNG TIN CA TRỰC</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-indigo-50/30 p-4 rounded-xl border border-indigo-50">
                  <div><span className="font-semibold text-gray-500">NGÀY THÁNG NĂM:</span> <p className="font-medium text-gray-900 text-base">{new Date(selectedReport.date).toLocaleDateString('vi-VN')}</p></div>
                  <div><span className="font-semibold text-gray-500">HỌ VÀ TÊN TÀI XẾ:</span> <p className="font-medium text-gray-900 text-base">{selectedReport.driverName}</p></div>
                  <div><span className="font-semibold text-gray-500">BIỂN SỐ XE:</span> <p className="font-medium text-indigo-600 font-bold uppercase text-base">{selectedReport.licensePlate}</p></div>
                  <div><span className="font-semibold text-gray-500">LOẠI CA:</span> <p className="font-medium text-gray-900 text-base">{selectedReport.shiftType}</p></div>
                  <div className="md:col-span-2"><span className="font-semibold text-gray-500">SỐ KM NHẬN CA:</span> <p className="font-medium text-gray-900 text-base">{selectedReport.startingMileage} km</p></div>
                </div>
              </div>

              {/* PHẦN II */}
              <div>
                <h3 className="text-lg font-bold text-blue-900 border-b-2 border-blue-100 pb-2 mb-4">II. GIẤY TỜ PHÁP LÝ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div><span className="font-semibold text-gray-500 block mb-1">GIẤY ĐĂNG KÝ XE:</span> <span className={`px-2 py-1 rounded text-xs font-bold ${selectedReport.registrationPaper === 'CÒN HẠN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedReport.registrationPaper || 'Trống'}</span></div>
                  <div><span className="font-semibold text-gray-500 block mb-1">GIẤY KIỂM ĐỊNH:</span> <span className={`px-2 py-1 rounded text-xs font-bold ${selectedReport.inspectionCertificate === 'CÒN HẠN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedReport.inspectionCertificate || 'Trống'}</span></div>
                  <div><span className="font-semibold text-gray-500 block mb-1">CHỨNG NHẬN ƯU TIÊN:</span> <span className={`px-2 py-1 rounded text-xs font-bold ${selectedReport.priorityCertificate === 'CÒN HẠN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedReport.priorityCertificate || 'Trống'}</span></div>
                  <div><span className="font-semibold text-gray-500 block mb-1">BẢO HIỂM DSBB:</span> <span className={`px-2 py-1 rounded text-xs font-bold ${selectedReport.insuranceCertificate === 'CÒN HẠN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedReport.insuranceCertificate || 'Trống'}</span></div>
                </div>
              </div>

              {/* PHẦN III */}
              <div>
                <h3 className="text-lg font-bold text-yellow-900 border-b-2 border-yellow-100 pb-2 mb-4">III. TỔNG QUAN THIẾT BỊ XE</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div><span className="font-semibold text-gray-500">CAMERA HÀNH TRÌNH:</span> <p className="font-medium text-gray-900">{selectedReport.dashcam}</p></div>
                  <div><span className="font-semibold text-gray-500">MÁY LẠNH:</span> <p className="font-medium text-gray-900">{selectedReport.airConditioner}</p></div>
                  <div><span className="font-semibold text-gray-500">ÁP SUẤT LỐP XE:</span> <p className="font-medium text-gray-900">{selectedReport.tirePressure}</p></div>
                  <div><span className="font-semibold text-gray-500">LỐP DỰ PHÒNG:</span> <p className="font-medium text-gray-900">{selectedReport.spareTire}</p></div>
                  <div><span className="font-semibold text-gray-500">NGOẠI QUAN XE (trầy xước, móp méo, hư hỏng):</span> <p className="font-medium text-gray-900">{selectedReport.exteriorInspection}</p></div>
                  <div><span className="font-semibold text-gray-500">ĐÈN CHIẾU SÁNG, XI NHAN, CÒI, GẠT MƯA:</span> <p className="font-medium text-gray-900">{selectedReport.lightsAndWipers}</p></div>
                  <div><span className="font-semibold text-gray-500">HỆ THỐNG PHANH VÀ TAY LÁI:</span> <p className="font-medium text-gray-900">{selectedReport.brakesAndSteering}</p></div>
                  <div><span className="font-semibold text-gray-500">BÌNH CHỮA CHÁY, HỘP Y TẾ:</span> <p className="font-medium text-gray-900">{selectedReport.fireExtinguisherAndFirstAid}</p></div>
                  <div><span className="font-semibold text-gray-500">CON ĐỘI, KHÓA MỞ TẮC KÊ:</span> <p className="font-medium text-gray-900">{selectedReport.jackAndWrench}</p></div>
                  <div><span className="font-semibold text-gray-500">BÌNH ẮC QUY:</span> <p className="font-medium text-gray-900">{selectedReport.battery}</p></div>

                  {/* CÁC CHỈ SỐ NHIÊN LIỆU */}
                  <div className="md:col-span-3 border-t pt-4 mt-2">
                    <h4 className="font-bold text-gray-800 mb-2">MỨC NHIÊN LIỆU & DUNG DỊCH</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-white p-2 rounded border"><span className="text-xs text-gray-500 block">XĂNG</span><p className="font-bold">{selectedReport.gasoline}</p></div>
                      <div className="bg-white p-2 rounded border"><span className="text-xs text-gray-500 block">DẦU</span><p className="font-bold">{selectedReport.diesel}</p></div>
                      <div className="bg-white p-2 rounded border"><span className="text-xs text-gray-500 block">NHỚT</span><p className="font-bold">{selectedReport.motorOil}</p></div>
                      <div className="bg-white p-2 rounded border"><span className="text-xs text-gray-500 block">NƯỚC LÀM MÁT</span><p className="font-bold">{selectedReport.coolant}</p></div>
                      <div className="bg-white p-2 rounded border"><span className="text-xs text-gray-500 block">OXY</span><p className="font-bold">{selectedReport.oxygen}</p></div>
                    </div>
                  </div>
                  <div className="md:col-span-3 mt-2"><span className="font-semibold text-gray-500">VỆ SINH XE:</span> <p className="font-medium text-gray-900">{selectedReport.vehicleHygiene}</p></div>
                </div>
              </div>

              {/* TỔNG KẾT CA TRỰC */}
              <div>
                <h3 className="text-lg font-bold text-emerald-900 border-b-2 border-emerald-100 pb-2 mb-4">IV. TỔNG KẾT CA TRỰC</h3>
                <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold text-gray-500">TỔNG KM KẾT THÚC:</span> <p className="font-bold text-xl text-indigo-600">{selectedReport.endingMileage} km</p></div>
                    <div><span className="font-semibold text-gray-500">SỰ CỐ PHÁT SINH (nếu có):</span> <p className="font-medium text-red-600">{selectedReport.incidents || 'Không có'}</p></div>

                    <div className="md:col-span-2 grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-white p-3 rounded-xl border text-center shadow-sm">
                        <p className="text-2xl font-bold text-blue-600">{selectedReport.hospitalTransferCount}</p>
                        <p className="text-xs text-gray-500">SỐ CA CHUYỂN VIỆN</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border text-center shadow-sm">
                        <p className="text-2xl font-bold text-red-600">{selectedReport.outsideEmergencyCount}</p>
                        <p className="text-xs text-gray-500">SỐ CA CẤP CỨU NGOẠI VIỆN</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border text-center shadow-sm">
                        <p className="text-2xl font-bold text-gray-800">{selectedReport.adminWorkCount}</p>
                        <p className="text-xs text-gray-500">SỐ CHUYẾN CÔNG TÁC HÀNH CHÍNH</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center border border-gray-200 zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa báo cáo?</h3>
            <p className="text-sm text-gray-500 mb-6">Bạn có chắc chắn muốn xóa báo cáo này không? Dữ liệu sẽ không thể khôi phục.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-red-200"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
