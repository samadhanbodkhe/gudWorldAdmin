// src/pages/Dashboard.jsx
import React from "react";
import {
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiAlertTriangle,
  FiClock,
  FiPackage,
  FiTrendingUp,
  FiBarChart2,
  FiStar,
  FiRefreshCw,
  FiShoppingCart,
  FiArchive,
  FiXCircle
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";
import { useGetDashboardStatsQuery } from "../redux/api/dashboardApi";

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('Revenue') ? '₹' : ''}{entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
            <FiTrendingUp className={`mr-1 ${!trend.includes('+') && 'rotate-180'}`} />
            {trend}
          </div>
        )}
      </div>
      <div className={`p-2 sm:p-3 rounded-full ${color} text-white ml-3 flex-shrink-0`}>
        {icon}
      </div>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      'COMPLETED': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'CONFIRMED': { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      'PROCESSING': { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
      'SHIPPED': { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' },
      'DELIVERED': { color: 'bg-teal-100 text-teal-800', label: 'Delivered' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    return statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status?.toLowerCase() || 'Unknown' };
  };

  const config = getStatusConfig(status);
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const Dashboard = () => {
  const { data, isLoading, error, refetch } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A21] mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4 px-4">
            {error?.data?.message || "Please try again later"}
          </p>
          <button 
            onClick={refetch}
            className="bg-[#5C3A21] text-white px-6 py-2 rounded-lg hover:bg-[#7A4B2F] transition-colors flex items-center"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statsData = data?.data;
  console.log('📊 Dashboard Data:', statsData); // For debugging

  // Stats cards data - using the actual data structure from getQuickStats
  const statsCards = [
    { 
      title: "Total Revenue", 
      value: statsData?.formatted?.totalRevenue || '₹0', 
      icon: <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: "bg-green-500",
      subtitle: "All time revenue"
    },
    { 
      title: "Today's Revenue", 
      value: statsData?.formatted?.todayRevenue || '₹0', 
      icon: <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: "bg-blue-500",
      subtitle: `Growth: ${statsData?.revenueGrowth || 0}%`
    },
    { 
      title: "Total Orders", 
      value: statsData?.totalOrders || 0, 
      icon: <FiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: "bg-purple-500",
      subtitle: "All time orders"
    },
    { 
      title: "Today's Orders", 
      value: statsData?.todayOrders || 0, 
      icon: <FiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: "bg-orange-500",
      subtitle: "Orders today"
    },
    { 
      title: "Pending Orders", 
      value: statsData?.pendingOrders || 0, 
      icon: <FiClock className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: "bg-yellow-500",
      subtitle: "Awaiting processing"
    },
    { 
      title: "Cancelled Orders", 
      value: statsData?.cancelledOrders || 0, 
      icon: <FiXCircle className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: "bg-red-500",
      subtitle: "Cancelled orders"
    },
  ];

  // Chart colors
  const CHART_COLORS = {
    primary: "#5C3A21",
    secondary: "#8B5CF6",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    pie: ["#5C3A21", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6B7280", "#3B82F6", "#8B5A2B"]
  };

  // ✅ FIXED: Order status data with actual cancelled orders count
  const orderStatusData = [
    { name: 'Completed', value: statsData?.completedOrders || 0 },
    { name: 'Pending', value: statsData?.pendingOrders || 0 },
    { name: 'Cancelled', value: statsData?.cancelledOrders || 0 }
  ].filter(item => item.value > 0); // Only show statuses with orders

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#5C3A21]">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time business performance metrics
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 min-w-[200px]">
            <p className="text-sm text-gray-600">Avg Order Value</p>
            <p className="text-lg sm:text-xl font-semibold text-[#5C3A21]">
              {statsData?.formatted?.averageOrderValue || '₹0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {statsCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Revenue Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiTrendingUp className="w-5 h-5 mr-2 text-[#5C3A21]" />
              Revenue Overview
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold text-gray-900">
                {statsData?.formatted?.totalRevenue || '₹0'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Today's Revenue</span>
              <span className="font-semibold text-gray-900">
                {statsData?.formatted?.todayRevenue || '₹0'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Revenue Growth</span>
              <span className={`font-semibold ${(statsData?.revenueGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {statsData?.revenueGrowth || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Avg Order Value</span>
              <span className="font-semibold text-gray-900">
                {statsData?.formatted?.averageOrderValue || '₹0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiShoppingBag className="w-5 h-5 mr-2 text-[#5C3A21]" />
              Order Summary
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Orders</span>
              <span className="font-semibold text-gray-900">
                {statsData?.totalOrders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Completed Orders</span>
              <span className="font-semibold text-green-600">
                {statsData?.completedOrders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Pending Orders</span>
              <span className="font-semibold text-yellow-600">
                {statsData?.pendingOrders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Cancelled Orders</span>
              <span className="font-semibold text-red-600">
                {statsData?.cancelledOrders || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Order Status Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiBarChart2 className="w-5 h-5 mr-2 text-[#5C3A21]" />
            Order Status Distribution
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  label={({ name, percent }) => 
                    `${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS.pie[index % CHART_COLORS.pie.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Orders']} />
                <Legend 
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ 
                    fontSize: '12px',
                    paddingLeft: '20px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiShoppingCart className="w-5 h-5 mr-2 text-[#5C3A21]" />
              Quick Stats
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {statsData?.formatted?.totalRevenue || '₹0'}
              </div>
              <div className="text-sm text-green-800 mt-1">Total Revenue</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {statsData?.totalOrders || 0}
              </div>
              <div className="text-sm text-blue-800 mt-1">Total Orders</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {statsData?.formatted?.averageOrderValue || '₹0.00'}
              </div>
              <div className="text-sm text-purple-800 mt-1">Avg Order Value</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {statsData?.revenueGrowth || 0}%
              </div>
              <div className="text-sm text-orange-800 mt-1">Revenue Growth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Health Footer */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
          <div className="text-lg sm:text-xl font-bold text-green-600">
            {statsData?.completedOrders || 0}
          </div>
          <div className="text-xs text-gray-600 mt-1">Completed Orders</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
          <div className="text-lg sm:text-xl font-bold text-yellow-600">
            {statsData?.pendingOrders || 0}
          </div>
          <div className="text-xs text-gray-600 mt-1">Pending Orders</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
          <div className="text-lg sm:text-xl font-bold text-red-600">
            {statsData?.cancelledOrders || 0}
          </div>
          <div className="text-xs text-gray-600 mt-1">Cancelled Orders</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
          <div className="text-lg sm:text-xl font-bold text-blue-600">
            {statsData?.outOfStockCount || 0}
          </div>
          <div className="text-xs text-gray-600 mt-1">Out of Stock</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;