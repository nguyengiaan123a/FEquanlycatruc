import React, { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import apiClient from '../services/api';
import Chart from 'chart.js/auto';
import { Shield, AlertTriangle, Moon, Sun, Activity, CheckCircle, Edit3, Trash2, Eye, X } from 'lucide-react';

interface Stats {
  totalShifts: number;
  nightShifts: number;
  dayShifts: number;
  totalIncidents: number;
  chartData: any[];
}

export default function SecurityReportManager() {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [newAlert, setNewAlert] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // States cho xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const barChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const fetchData = async () => {
    try {
      const statsRes = await apiClient.get('/api/SecurityGuardShiftReport/stats');
      setStats({
        totalShifts: statsRes.data.totalShifts,
        nightShifts: statsRes.data.nightShifts,
        dayShifts: statsRes.data.dayShifts,
        totalIncidents: statsRes.data.totalIncidents,
        chartData: statsRes.data.chartData,
      });

      const reportsRes = await apiClient.get('/api/SecurityGuardShiftReport?page=1&pageSize=100');
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
          connection.on('NewSecurityReport', (newReport) => {
            setNewAlert(`Có báo cáo ca trực mới từ ${newReport.shiftLeaderName || 'Bảo vệ'}!`);
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

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      await apiClient.delete(`/api/SecurityGuardShiftReport/${reportToDelete}`);
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

  const handleEdit = (report: any) => {
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
          <Shield className="text-indigo-600" size={36} />
          Dashboard Quản Lý Ca Trực Bảo Vệ
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
            <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
              <Sun size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Ca Ngày</p>
              <p className="text-3xl font-bold text-gray-800">{stats.dayShifts}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-purple-50 rounded-xl text-purple-600">
              <Moon size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Ca Đêm</p>
              <p className="text-3xl font-bold text-gray-800">{stats.nightShifts}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-red-50 rounded-xl text-red-600">
              <AlertTriangle size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Báo cáo Sự cố</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalIncidents}</p>
            </div>
          </div>
        </div>

        {/* CHART FULL WIDTH */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Biểu đồ số ca trực (7 ngày qua)</h3>
          <div className="h-64 w-full relative">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* --- PHẦN 2: BẢNG DỮ LIỆU BÁO CÁO --- */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">Danh Sách Báo Cáo Ca Trực</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                  <th className="p-4 font-semibold w-16 text-center">STT</th>
                  <th className="p-4 font-semibold">Ngày Trực</th>
                  <th className="p-4 font-semibold">Tua Trưởng</th>
                  <th className="p-4 font-semibold">Loại Ca</th>
                  <th className="p-4 font-semibold">Thời Gian</th>
                  <th className="p-4 font-semibold text-center">Trạng Thái</th>
                  <th className="p-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 text-center text-sm font-medium text-gray-500">{i + 1}</td>
                    <td className="p-4 text-sm text-gray-700 font-medium">{new Date(r.date).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4 font-bold text-gray-800">{r.shiftLeaderName}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${r.shiftType === 'CA NGÀY' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {r.shiftType}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {r.startTime} - {r.endTime}
                    </td>
                    <td className="p-4 text-center">
                      {r.isConfirmed ? (
                        <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-md">Đã xác nhận</span>
                      ) : (
                        <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-md">Chưa xác nhận</span>
                      )}
                    </td>
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
                    <td colSpan={7} className="text-center text-gray-500 py-10">Không có dữ liệu báo cáo</td>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col zoom-in-95">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                <Shield size={24} />
                Chi tiết ca trực Bảo vệ
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
                  <div><span className="font-semibold text-gray-500">THỜI GIAN NHẬN CA:</span> <p className="font-medium text-gray-900 text-base">{selectedReport.startTime}</p></div>
                  <div><span className="font-semibold text-gray-500">THỜI GIAN KẾT THÚC CA:</span> <p className="font-medium text-gray-900 text-base">{selectedReport.endTime}</p></div>
                  <div><span className="font-semibold text-gray-500">NGÀY/THÁNG/NĂM:</span> <p className="font-medium text-gray-900 text-base">{new Date(selectedReport.date).toLocaleDateString('vi-VN')}</p></div>
                  <div><span className="font-semibold text-gray-500">HỌ VÀ TÊN TUA TRƯỞNG:</span> <p className="font-medium text-gray-900 text-base">{selectedReport.shiftLeaderName}</p></div>
                  <div className="md:col-span-2"><span className="font-semibold text-gray-500">THÔNG TIN CA TRỰC:</span> <p className="font-medium text-indigo-700 font-bold text-base">{selectedReport.shiftType}</p></div>
                  <div className="md:col-span-2"><span className="font-semibold text-gray-500">VỊ TRÍ TRỰC:</span> <p className="font-medium text-gray-900">{JSON.parse(selectedReport.shiftPositions || '[]').join(', ')}</p></div>
                </div>
              </div>

              {/* PHẦN CÔNG TÁC */}
              <div>
                <h3 className="text-lg font-bold text-blue-900 border-b-2 border-blue-100 pb-2 mb-4">II. CHI TIẾT CÔNG TÁC</h3>
                <div className="space-y-4 text-sm">
                  <div><span className="font-semibold text-gray-500 block mb-1">CÔNG TÁC AN NINH TRẬT TỰ:</span> <div className="bg-gray-50 p-3 rounded-lg border text-gray-800">{JSON.parse(selectedReport.securityTasks || '[]').join(', ')}</div></div>
                  <div><span className="font-semibold text-gray-500 block mb-1">CÔNG TÁC TUẦN TRA:</span> <div className="bg-gray-50 p-3 rounded-lg border text-gray-800">{JSON.parse(selectedReport.patrolTasks || '[]').join(', ')}</div></div>
                  <div><span className="font-semibold text-gray-500 block mb-1">CÔNG TÁC BÃI XE:</span> <div className="bg-gray-50 p-3 rounded-lg border text-gray-800">{JSON.parse(selectedReport.parkingTasks || '[]').join(', ')}</div></div>
                  <div><span className="font-semibold text-gray-500 block mb-1">CÔNG TÁC VỆ SINH - TÀI SẢN:</span> <div className="bg-gray-50 p-3 rounded-lg border text-gray-800">{JSON.parse(selectedReport.propertyTasks || '[]').join(', ')}</div></div>
                  <div><span className="font-semibold text-gray-500 block mb-1">CÔNG TÁC BÀN GIAO CA:</span> <div className="bg-gray-50 p-3 rounded-lg border text-gray-800">{JSON.parse(selectedReport.handoverTasks || '[]').join(', ')}</div></div>
                </div>
              </div>

              {/* PHẦN ĐỀ XUẤT */}
              <div>
                <h3 className="text-lg font-bold text-yellow-900 border-b-2 border-yellow-100 pb-2 mb-4">III. ĐỀ XUẤT VÀ XÁC NHẬN</h3>
                <div className="space-y-4 text-sm">
                  <div><span className="font-semibold text-gray-500 block mb-1">ĐỀ XUẤT - KIẾN NGHỊ SAU CA TRỰC:</span> <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-gray-800 whitespace-pre-wrap">{selectedReport.proposals || 'Không có'}</div></div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="font-semibold text-gray-500">XÁC NHẬN HOÀN TẤT BÁO CÁO: </span>
                    <span className={selectedReport.isConfirmed ? "font-bold text-green-600 text-base ml-2" : "font-bold text-red-600 text-base ml-2"}>
                      {selectedReport.isConfirmed ? "ĐÃ XÁC NHẬN" : "CHƯA XÁC NHẬN"}
                    </span>
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
