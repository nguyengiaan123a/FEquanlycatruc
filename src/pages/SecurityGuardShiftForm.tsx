import React, { useState } from 'react';
import apiClient from '../services/api';
import {
  Clock, Calendar as CalendarIcon, User, MapPin, ShieldCheck,
  Activity, Car, Package, BookOpen, Send, CheckCircle
} from 'lucide-react';

const POSITIONS = [
  "Cổng Cấp cứu", "Sảnh chính", "Khoa Khám", "Nhà xe", "Khoa cấp cứu",
  "Khu nội trú", "Tuần tra khuôn viên", "Hồ xử lý nước thải", "Kho Oxy",
  "Trạm điện", "Các kho", "Vườn dầu", "Vườn chuối", "Bờ rào toàn viện"
];

const SECURITY_TASKS = [
  "Kiểm tra người và phương tiện ra vào", "Hướng dẫn hỗ trợ người bệnh vào khám",
  "Hướng dẫn phân luồng khi bệnh đông", "Giám sát CAMERA an ninh toàn viện"
];

const PATROL_TASKS = [
  "Đã tuần tra đầy đủ các khu vực theo quy định", "Kiểm tra khóa cửa các khu vực",
  "Kiểm tra hệ thống điện – nước", "Kiểm tra PCCC", "Không phát hiện bất thường"
];

const PARKING_TASKS = [
  "Sắp xếp xe gọn gàng", "Kiểm soát vé xe đầy đủ",
  "Không xảy ra mất cắp / va chạm", "Có sự cố liên quan phương tiện"
];

const PROPERTY_TASKS = [
  "Kiểm tra tài sản khu vực trực", "Không phát hiện hư hỏng",
  "Có ghi nhận hư hỏng tài sản", "Đề xuất sửa chữa", "Ghi nhận tình hình đảm bảo vệ sinh các khu vực"
];

const HANDOVER_TASKS = [
  "Bàn giao đầy đủ công cụ hỗ trợ", "Bàn giao chìa khóa",
  "Bàn giao sổ sách / thiết bị", "Báo cáo đầy đủ tình hình ca trực"
];

export default function SecurityGuardShiftForm() {
  const [formData, setFormData] = useState({
    IsNightShift: false,
    StartTime: '',
    EndTime: '',
    Date: '',
    ShiftLeaderName: '',
    ShiftPositions: [] as string[],
    SecurityTasks: [] as string[],
    PatrolTasks: [] as string[],
    ParkingTasks: [] as string[],
    PropertyTasks: [] as string[],
    HandoverTasks: [] as string[],
    Proposals: '',
    IsConfirmed: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCheckboxToggle = (category: string, item: string) => {
    setFormData(prev => {
      const currentList = prev[category as keyof typeof prev] as string[];
      if (currentList.includes(item)) {
        return { ...prev, [category]: currentList.filter(i => i !== item) };
      } else {
        return { ...prev, [category]: [...currentList, item] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.IsConfirmed) {
      alert('Vui lòng xác nhận hoàn tất báo cáo!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ShiftType: formData.IsNightShift ? "CA ĐÊM" : "CA NGÀY",
        StartTime: formData.StartTime ? formData.StartTime + ':00' : '00:00:00',
        EndTime: formData.EndTime ? formData.EndTime + ':00' : '00:00:00',
        Date: formData.Date,
        ShiftLeaderName: formData.ShiftLeaderName,
        ShiftPositions: JSON.stringify(formData.ShiftPositions),
        SecurityTasks: JSON.stringify(formData.SecurityTasks),
        PatrolTasks: JSON.stringify(formData.PatrolTasks),
        ParkingTasks: JSON.stringify(formData.ParkingTasks),
        PropertyTasks: JSON.stringify(formData.PropertyTasks),
        HandoverTasks: JSON.stringify(formData.HandoverTasks),
        Proposals: formData.Proposals,
        IsConfirmed: formData.IsConfirmed
      };

      await apiClient.post('/api/SecurityGuardShiftReport', payload);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi gửi báo cáo!');
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-3 mb-4 mt-8 pb-2 border-b border-gray-200">
      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    </div>
  );

  const CheckboxGroup = ({ category, items }: { category: string, items: string[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map(item => {
        const isChecked = (formData[category as keyof typeof formData] as string[]).includes(item);
        return (
          <label
            key={item}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isChecked
              ? 'border-blue-500 bg-blue-50/50 shadow-sm'
              : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
              }`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={isChecked}
              onChange={() => handleCheckboxToggle(category, item)}
            />
            <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}>
              {isChecked && <CheckCircle size={14} className="text-white" />}
            </div>
            <span className={`text-sm md:text-base font-medium ${isChecked ? 'text-blue-900' : 'text-gray-700'}`}>
              {item}
            </span>
          </label>
        );
      })}
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Báo cáo thành công!</h2>
            <p className="text-gray-600">Cảm ơn bạn. Báo cáo ca trực đã được ghi nhận vào hệ thống.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Gửi báo cáo mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          {/* Header */}
          <div className="bg-blue-600 px-6 py-10 sm:px-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <h1 className="relative text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              CA TRỰC TỔ BẢO VỆ
            </h1>
            <p className="relative mt-2 text-blue-100 text-lg font-medium">
              Biểu mẫu ghi nhận thông tin ca trực
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">

            {/* PHẦN I */}
            <div>
              <SectionTitle icon={Clock} title="Phần I: Thông tin ca trực" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Loại ca */}
                <div className="col-span-1 md:col-span-2 flex flex-wrap gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="shiftType"
                      checked={!formData.IsNightShift}
                      onChange={() => setFormData({ ...formData, IsNightShift: false })}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-lg font-medium text-gray-800">☀️ CA NGÀY</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer ml-6">
                    <input
                      type="radio"
                      name="shiftType"
                      checked={formData.IsNightShift}
                      onChange={() => setFormData({ ...formData, IsNightShift: true })}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-lg font-medium text-gray-800">🌙 CA ĐÊM</span>
                  </label>
                </div>

                {/* Ngày */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <CalendarIcon size={16} /> NGÀY/THÁNG/NĂM <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.Date}
                    onChange={e => setFormData({ ...formData, Date: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </div>

                {/* Tua trưởng */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <User size={16} /> HỌ VÀ TÊN TUA TRƯỞNG <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ và tên..."
                    value={formData.ShiftLeaderName}
                    onChange={e => setFormData({ ...formData, ShiftLeaderName: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </div>

                {/* Thời gian nhận/kết thúc */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Clock size={16} /> THỜI GIAN NHẬN CA <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.StartTime}
                    onChange={e => setFormData({ ...formData, StartTime: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Clock size={16} /> THỜI GIAN KẾT THÚC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.EndTime}
                    onChange={e => setFormData({ ...formData, EndTime: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </div>

              </div>
            </div>

            {/* PHẦN II - MULTIPLE CHOICE */}
            <div>
              <SectionTitle icon={MapPin} title="Vị trí trực *" />
              <CheckboxGroup category="ShiftPositions" items={POSITIONS} />
            </div>

            <div>
              <SectionTitle icon={ShieldCheck} title="Công tác an ninh trật tự *" />
              <CheckboxGroup category="SecurityTasks" items={SECURITY_TASKS} />
            </div>

            <div>
              <SectionTitle icon={Activity} title="Công tác tuần tra *" />
              <CheckboxGroup category="PatrolTasks" items={PATROL_TASKS} />
            </div>

            <div>
              <SectionTitle icon={Car} title="Công tác bãi xe *" />
              <CheckboxGroup category="ParkingTasks" items={PARKING_TASKS} />
            </div>

            <div>
              <SectionTitle icon={Package} title="Công tác vệ sinh - Tài sản *" />
              <CheckboxGroup category="PropertyTasks" items={PROPERTY_TASKS} />
            </div>

            <div>
              <SectionTitle icon={BookOpen} title="Công tác bàn giao ca *" />
              <CheckboxGroup category="HandoverTasks" items={HANDOVER_TASKS} />
            </div>

            {/* ĐỀ XUẤT */}
            <div>
              <SectionTitle icon={Send} title="Đề xuất - Kiến nghị sau ca trực *" />
              <textarea
                required
                rows={4}
                placeholder="Nhập các đề xuất, kiến nghị của bạn..."
                value={formData.Proposals}
                onChange={e => setFormData({ ...formData, Proposals: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-y"
              ></textarea>
            </div>

            {/* XÁC NHẬN */}
            <div className="bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-100 flex items-start gap-4">
              <input
                type="checkbox"
                id="confirm"
                checked={formData.IsConfirmed}
                onChange={e => setFormData({ ...formData, IsConfirmed: e.target.checked })}
                className="w-6 h-6 mt-1 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <label htmlFor="confirm" className="text-lg font-bold text-gray-900 cursor-pointer">
                  Xác nhận hoàn tất báo cáo <span className="text-red-500">*</span>
                </label>
                <p className="text-gray-600 mt-1 italic">
                  “Tôi cam kết nội dung báo cáo là đúng thực tế.”
                </p>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2 ${loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 hover:-translate-y-1'
                }`}
            >
              {loading ? (
                <span className="animate-pulse">Đang gửi báo cáo...</span>
              ) : (
                <>
                  <Send size={24} />
                  GỬI BÁO CÁO
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
