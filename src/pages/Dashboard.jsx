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
  FiStar
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
  CartesianGrid,
  LineChart,
  Line
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
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
            <FiTrendingUp className={`mr-1 ${!trend.includes('+') && 'rotate-180'}`} />
            {trend}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color} text-white`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading, error, refetch } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A21] mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4">
            {error?.data?.message || "Please try again later"}
          </p>
          <button 
            onClick={refetch}
            className="bg-[#5C3A21] text-white px-6 py-2 rounded-lg hover:bg-[#7A4B2F] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statsData = data?.data;
  const adminName = statsData?.admin?.name || "Admin";

  // Stats cards data
  const statsCards = [
    { 
      title: "Total Products", 
      value: statsData?.totalProducts || 0, 
      icon: <FiBox size={24} />, 
      color: "bg-yellow-500",
      subtitle: "Active products"
    },
    { 
      title: "Total Orders", 
      value: statsData?.totalBookings || 0, 
      icon: <FiShoppingBag size={24} />, 
      color: "bg-green-500",
      subtitle: "All time orders"
    },
    { 
      title: "Total Users", 
      value: statsData?.totalUsers || 0, 
      icon: <FiUsers size={24} />, 
      color: "bg-blue-500",
      subtitle: "Registered users"
    },
    { 
      title: "Total Revenue", 
      value: `₹${(statsData?.totalRevenue || 0).toLocaleString()}`, 
      icon: <FiDollarSign size={24} />, 
      color: "bg-purple-500",
      subtitle: "Lifetime revenue"
    },
    { 
      title: "Low Stock", 
      value: statsData?.lowStockAlerts || 0, 
      icon: <FiAlertTriangle size={24} />, 
      color: "bg-orange-500",
      subtitle: "Need attention"
    },
    { 
      title: "Pending Orders", 
      value: statsData?.metrics?.pendingBookings || 0, 
      icon: <FiClock size={24} />, 
      color: "bg-red-500",
      subtitle: "Awaiting processing"
    },
  ];

  // Chart colors
  const CHART_COLORS = {
    primary: "#5C3A21",
    secondary: "#8B5CF6",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    pie: ["#5C3A21", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6B7280"]
  };

  // Order status data for pie chart
  const orderStatusData = statsData?.bookingStatusDistribution || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#5C3A21] to-amber-600 bg-clip-text text-transparent">
              Welcome back, {adminName}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your store today
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-lg font-semibold text-[#5C3A21]">
                ₹{(statsData?.metrics?.todayRevenue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <FiTrendingUp className="mx-auto text-2xl text-green-500 mb-2" />
          <h4 className="font-semibold text-gray-800">Order Completion</h4>
          <p className="text-xl font-bold text-gray-900">
            {statsData?.performance?.completionRate || 0}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <FiPackage className="mx-auto text-2xl text-blue-500 mb-2" />
          <h4 className="font-semibold text-gray-800">Stock Health</h4>
          <p className="text-xl font-bold text-gray-900">
            {statsData?.performance?.stockHealth || 0}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <FiBarChart2 className="mx-auto text-2xl text-purple-500 mb-2" />
          <h4 className="font-semibold text-gray-800">Avg. Order Value</h4>
          <p className="text-xl font-bold text-gray-900">
            ₹{(statsData?.metrics?.averageOrderValue || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <FiStar className="mx-auto text-2xl text-amber-500 mb-2" />
          <h4 className="font-semibold text-gray-800">Out of Stock</h4>
          <p className="text-xl font-bold text-gray-900">
            {statsData?.metrics?.outOfStockProducts || 0}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800">
              Revenue Overview (Last 6 Months)
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#5C3A21] rounded-full mr-2"></div>
                <span>Revenue</span>
              </div>
            </div>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="revenue" 
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            Order Status Distribution
          </h3>
          <div className="h-64 md:h-80">
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
                    `${name}: ${(percent * 100).toFixed(0)}%`
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
                <Legend 
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Tooltip formatter={(value) => [value, 'Orders']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            🏆 Top Selling Products
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {statsData?.topSellingProducts?.length > 0 ? (
              statsData.topSellingProducts.map((product, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <FiPackage className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Sold: {product.totalSold} {product.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{product.totalRevenue?.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 font-medium">Revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiPackage className="mx-auto text-3xl mb-2 text-gray-400" />
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            📋 Recent Orders
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {statsData?.recentBookings?.length > 0 ? (
              statsData.recentBookings.map((booking) => (
                <div 
                  key={booking._id} 
                  className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                    <FiShoppingBag className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {booking.userName}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {booking.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{booking.amount}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiShoppingBag className="mx-auto text-3xl mb-2 text-gray-400" />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;