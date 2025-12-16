import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, trend, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl border ${colorClasses[color]} transition-colors`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            2.5%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-semibold tracking-wide uppercase mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}