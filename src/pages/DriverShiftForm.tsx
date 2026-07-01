import React, { useState } from 'react';
import apiClient from '../services/api';
import {
  Calendar as CalendarIcon, User, Car, FileText, Settings, AlertTriangle, Send, CheckCircle, Activity
} from 'lucide-react';

export default function DriverShiftForm() {
  const [formData, setFormData] = useState({
    ShiftType: 'CA NGÀY',
    Date: '',
    DriverName: '',
    LicensePlate: '',
    StartingMileage: '',

    // Giấy tờ
    RegistrationPaper: 'CÒN HẠN',
    InspectionCertificate: 'CÒN HẠN',
    PriorityCertificate: 'CÒN HẠN',
    InsuranceCertificate: 'CÒN HẠN',

    // Thiết bị
    Dashcam: 'HOẠT ĐỘNG BÌNH THƯỜNG',
    AirConditioner: 'HOẠT ĐỘNG BÌNH THƯỜNG',
    TirePressure: 'BÌNH THƯỜNG',
    SpareTire: 'CÓ',
    ExteriorInspection: 'KHÔNG',
    LightsAndWipers: 'HOẠT ĐỘNG BÌNH THƯỜNG',
    BrakesAndSteering: 'HOẠT ĐỘNG BÌNH THƯỜNG',
    FireExtinguisherAndFirstAid: 'CÓ',
    JackAndWrench: 'CÓ',
    Battery: 'HOẠT ĐỘNG BÌNH THƯỜNG',
    Gasoline: 'CÒN',
    Diesel: 'CÒN',
    MotorOil: 'CÒN',
    Coolant: 'CÒN',
    Oxygen: 'CÒN',
    VehicleHygiene: 'SẠCH SẼ',

    // Kết thúc
    EndingMileage: '',
    HospitalTransferCount: '',
    OutsideEmergencyCount: '',
    AdminWorkCount: '',
    Incidents: 'KHÔNG',

    IsConfirmed: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.IsConfirmed) {
      alert('Vui lòng xác nhận hoàn tất báo cáo!');
      return;
    }

    setLoading(true);
    try {
      // Convert string numbers to integers for payload
      const payload = {
        ...formData,
        StartingMileage: parseInt(formData.StartingMileage) || 0,
        EndingMileage: parseInt(formData.EndingMileage) || 0,
        HospitalTransferCount: parseInt(formData.HospitalTransferCount) || 0,
        OutsideEmergencyCount: parseInt(formData.OutsideEmergencyCount) || 0,
        AdminWorkCount: parseInt(formData.AdminWorkCount) || 0,
      };

      await apiClient.post('/api/DriverShiftReport', payload);
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
    <div className="flex items-center gap-3 mb-6 mt-10 pb-2 border-b border-gray-200">
      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shadow-sm">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
    </div>
  );

  const RadioGroupWithOther = ({
    category,
    options,
    title,
    allowOther = false
  }: {
    category: string,
    options: string[],
    title: string,
    allowOther?: boolean
  }) => {
    const value = formData[category as keyof typeof formData] as string;
    const isStandardOption = options.includes(value);
    // Determine if "Khác" radio is active. It is active if value is not in options AND it's not the initial empty state.
    // To handle initial empty state properly when 'Khác' is selected, we maintain a small local state just for the radio button.
    const [isOtherSelected, setIsOtherSelected] = useState(!isStandardOption && value !== '');

    const handleOptionChange = (opt: string) => {
      setIsOtherSelected(false);
      setFormData(prev => ({ ...prev, [category]: opt }));
    };

    const handleOtherSelect = () => {
      setIsOtherSelected(true);
      if (isStandardOption) {
        setFormData(prev => ({ ...prev, [category]: '' }));
      }
    };

    const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [category]: e.target.value }));
    };

    return (
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
        <h3 className="font-bold text-gray-700 mb-3">{title}</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                checked={!isOtherSelected && value === opt}
                onChange={() => handleOptionChange(opt)}
                className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-gray-700 font-medium group-hover:text-indigo-600 transition-colors">{opt}</span>
            </label>
          ))}

          {allowOther && (
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                checked={isOtherSelected}
                onChange={handleOtherSelect}
                className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-gray-700 font-medium group-hover:text-indigo-600 transition-colors">Mục khác:</span>
            </label>
          )}
        </div>

        {allowOther && isOtherSelected && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2">
            <input
              type="text"
              required
              placeholder="Nhập nội dung khác..."
              value={isStandardOption ? '' : value}
              onChange={handleOtherChange}
              className="w-full p-3 bg-white border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all text-gray-800"
            />
          </div>
        )}
      </div>
    );
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Báo cáo thành công!</h2>
            <p className="text-gray-600">Báo cáo ca trực tài xế đã được ghi nhận vào hệ thống.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Gửi báo cáo mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

          {/* Header */}
          <div className="bg-indigo-700 px-6 py-10 sm:px-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute -top-10 -right-10 text-indigo-500 opacity-20">
              <Car size={150} />
            </div>
            <h1 className="relative text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              CA TRỰC TÀI XẾ
            </h1>
            <p className="relative mt-3 text-indigo-100 text-lg font-medium">
              Biểu mẫu ghi nhận thông tin và tình trạng xe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">

            {/* PHẦN I */}
            <div>
              <SectionTitle icon={Car} title="Phần I: Thông tin ca trực" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Loại ca */}
                <div className="col-span-1 md:col-span-2 flex flex-wrap gap-4 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                  {['CA NGÀY', 'CA ĐÊM', 'HÀNH CHÍNH'].map(shift => (
                    <label key={shift} className="flex items-center gap-2 cursor-pointer mr-4">
                      <input
                        type="radio"
                        name="shiftType"
                        checked={formData.ShiftType === shift}
                        onChange={() => setFormData({ ...formData, ShiftType: shift })}
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-lg font-bold text-gray-800">{shift}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase">
                    <CalendarIcon size={16} className="text-indigo-500" /> Ngày/Tháng/Năm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.Date}
                    onChange={e => setFormData({ ...formData, Date: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase">
                    <User size={16} className="text-indigo-500" /> Họ và tên tài xế <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ và tên..."
                    value={formData.DriverName}
                    onChange={e => setFormData({ ...formData, DriverName: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase">
                    <Car size={16} className="text-indigo-500" /> Biển số xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 51H-123.45"
                    value={formData.LicensePlate}
                    onChange={e => setFormData({ ...formData, LicensePlate: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase">
                    <Activity size={16} className="text-indigo-500" /> Số KM nhận ca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Nhập số KM..."
                    value={formData.StartingMileage}
                    onChange={e => setFormData({ ...formData, StartingMileage: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>

              </div>
            </div>

            {/* PHẦN II */}
            <div>
              <SectionTitle icon={FileText} title="Phần II: Giấy tờ pháp lý *" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RadioGroupWithOther category="RegistrationPaper" options={["CÒN HẠN", "HẾT HẠN"]} title="Giấy đăng ký xe" />
                <RadioGroupWithOther category="InspectionCertificate" options={["CÒN HẠN", "HẾT HẠN"]} title="Giấy kiểm định" />
                <RadioGroupWithOther category="PriorityCertificate" options={["CÒN HẠN", "HẾT HẠN"]} title="Giấy chứng nhận ưu tiên" allowOther={true} />
                <RadioGroupWithOther category="InsuranceCertificate" options={["CÒN HẠN", "HẾT HẠN"]} title="Giấy chứng nhận bảo hiểm DSBB" />
              </div>
            </div>

            {/* PHẦN III */}
            <div>
              <SectionTitle icon={Settings} title="Phần III: Tổng quan thiết bị xe *" />
              <div className="grid grid-cols-1 gap-4">
                <RadioGroupWithOther category="Dashcam" options={["HOẠT ĐỘNG BÌNH THƯỜNG", "KHÔNG HOẠT ĐỘNG"]} title="Camera hành trình" />
                <RadioGroupWithOther category="AirConditioner" options={["HOẠT ĐỘNG BÌNH THƯỜNG", "KHÔNG HOẠT ĐỘNG", "ĐỘ MÁT YẾU"]} title="Máy lạnh" />
                <RadioGroupWithOther category="TirePressure" options={["BÌNH THƯỜNG", "THIẾU"]} title="Áp suất lốp xe" allowOther={true} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RadioGroupWithOther category="SpareTire" options={["CÓ", "KHÔNG"]} title="Lốp dự phòng" />
                  <RadioGroupWithOther category="ExteriorInspection" options={["CÓ", "KHÔNG"]} title="Kiểm tra ngoại quan xe (trầy xước, móp méo, hư hỏng)" allowOther={true} />
                </div>
                <RadioGroupWithOther category="LightsAndWipers" options={["HOẠT ĐỘNG BÌNH THƯỜNG", "HƯ HỎNG"]} title="Kiểm tra đèn chiếu sáng, xi nhan, còi, gạt mưa" allowOther={true} />
                <RadioGroupWithOther category="BrakesAndSteering" options={["HOẠT ĐỘNG BÌNH THƯỜNG", "HOẠT ĐỘNG BẤT THƯỜNG"]} title="Kiểm tra hệ thống phanh và tay lái" allowOther={true} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RadioGroupWithOther category="FireExtinguisherAndFirstAid" options={["CÓ", "KHÔNG"]} title="Bình chữa cháy, hộp y tế" allowOther={true} />
                  <RadioGroupWithOther category="JackAndWrench" options={["CÓ", "KHÔNG"]} title="Con đội, khóa mở tắc kê" />
                </div>

                <RadioGroupWithOther category="Battery" options={["HOẠT ĐỘNG BÌNH THƯỜNG", "BẤT THƯỜNG"]} title="Bình ắc quy" allowOther={true} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RadioGroupWithOther category="Gasoline" options={["CÒN", "HẾT"]} title="Xăng" allowOther={true} />
                  <RadioGroupWithOther category="Diesel" options={["CÒN", "HẾT"]} title="Dầu" allowOther={true} />
                  <RadioGroupWithOther category="MotorOil" options={["CÒN", "HẾT"]} title="Nhớt" allowOther={true} />
                  <RadioGroupWithOther category="Coolant" options={["CÒN", "HẾT"]} title="Nước làm mát" allowOther={true} />
                  <RadioGroupWithOther category="Oxygen" options={["CÒN", "HẾT"]} title="Oxy" allowOther={true} />
                  <RadioGroupWithOther category="VehicleHygiene" options={["SẠCH SẼ", "BỪA BỘN"]} title="Vệ sinh xe" allowOther={true} />
                </div>
              </div>
            </div>

            {/* THÔNG TIN KẾT THÚC */}
            <div>
              <SectionTitle icon={AlertTriangle} title="Thông tin kết thúc ca trực" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase">
                    Tổng số KM kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" required min="0"
                    value={formData.EndingMileage}
                    onChange={e => setFormData({ ...formData, EndingMileage: e.target.value })}
                    className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase">
                    Số ca chuyển viện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" required min="0"
                    value={formData.HospitalTransferCount}
                    onChange={e => setFormData({ ...formData, HospitalTransferCount: e.target.value })}
                    className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase">
                    Số ca cấp cứu ngoại viện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" required min="0"
                    value={formData.OutsideEmergencyCount}
                    onChange={e => setFormData({ ...formData, OutsideEmergencyCount: e.target.value })}
                    className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase">
                    Số chuyến đi công tác hành chánh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" required min="0"
                    value={formData.AdminWorkCount}
                    onChange={e => setFormData({ ...formData, AdminWorkCount: e.target.value })}
                    className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <RadioGroupWithOther category="Incidents" options={["KHÔNG", "CÓ"]} title="Sự cố phát sinh (Va quẹt / TNGT)" allowOther={true} />
                </div>
              </div>
            </div>

            {/* XÁC NHẬN */}
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4 shadow-sm">
              <input
                type="checkbox"
                id="confirm"
                checked={formData.IsConfirmed}
                onChange={e => setFormData({ ...formData, IsConfirmed: e.target.checked })}
                className="w-6 h-6 mt-1 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
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
              className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-xl transition-all flex items-center justify-center gap-3 ${loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 hover:-translate-y-1'
                }`}
            >
              {loading ? (
                <span className="animate-pulse">Đang gửi báo cáo...</span>
              ) : (
                <>
                  <Send size={24} />
                  GỬI BÁO CÁO TÀI XẾ
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
