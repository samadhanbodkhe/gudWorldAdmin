// src/pages/Refunds.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiDollarSign,
  FiEye,
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiArrowUp,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiXCircle,
  FiPackage,
  FiX,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiArchive,
  FiActivity,
  FiCreditCard,
  FiBarChart,
  FiMapPin,
  FiBox,
  FiPercent,
  FiTag,
  FiHome,
  FiUser,
  FiTruck,
} from "react-icons/fi";
import { 
  useGetCancelledOrdersQuery,
  useGetCancelledOrderByIdQuery 
} from "../redux/api/cancelOrderApi";

const Refunds = () => {
  // State for filters and modals
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // API calls
  const {
    data: cancelledOrdersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchCancelledOrders,
  } = useGetCancelledOrdersQuery({
    page,
    limit: 10,
    search,
    status: statusFilter,
  });

  // Get individual order details when selected
  const {
    data: orderDetailsData,
    isLoading: orderDetailsLoading,
  } = useGetCancelledOrderByIdQuery(selectedOrder?._id, {
    skip: !selectedOrder?._id,
  });

  // Data extraction from backend response
  const cancelledOrders = cancelledOrdersData?.data?.orders || [];
  const analytics = cancelledOrdersData?.data?.analytics || {};
  const pagination = cancelledOrdersData?.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.total || 0;

  // Use detailed order data when available
  const displayOrder = orderDetailsData?.data || selectedOrder;

  // Handler functions
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setShowRefundModal(true);
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (order) => {
    const status = order.status;
    let color = "bg-gray-100 text-gray-800 border-gray-200";
    let icon = FiClock;
    let text = status;

    if (status === 'CANCELLED') {
      if (order.paymentDetails?.method === 'cod') {
        color = "bg-gray-100 text-gray-800 border-gray-200";
        icon = FiXCircle;
        text = "COD Cancelled";
      } else if (order.refund?.status === 'PROCESSED') {
        color = "bg-green-100 text-green-800 border-green-200";
        icon = FiCheckCircle;
        text = "Refund Processed";
      } else if (order.paymentDetails?.status === 'PAID') {
        color = "bg-orange-100 text-orange-800 border-orange-200";
        icon = FiClock;
        text = "Pending Refund";
      } else {
        color = "bg-red-100 text-red-800 border-red-200";
        icon = FiXCircle;
        text = "Cancelled";
      }
    }

    const IconComponent = icon;
    return (
      <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center gap-1 w-fit border ${color}`}>
        <IconComponent className="w-3 h-3" />
        {text}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const config = {
      online: { color: "bg-blue-100 text-blue-800", label: "Online" },
      cod: { color: "bg-gray-100 text-gray-800", label: "COD" },
    }[method] || { color: "bg-gray-100 text-gray-800", label: method };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const calculateRefundPercentage = (order) => {
    const original = order.financialDetails?.originalAmount || order.totalAmount || 0;
    const refund = order.financialDetails?.refundAmount || order.refundAmount || 0;
    if (original === 0) return 0;
    return Math.round((refund / original) * 100);
  };

  // Calculate active metrics
  const activeMetrics = {
    totalRefundProcessed: analytics.summary?.totalRefundAmount || 0,
    pendingRefundValue: analytics.financialImpact?.totalRefundableAmount || 0,
    averageRefundTime: "2-5 days",
    successRate: "98%",
    activeRefunds: analytics.statusBreakdown?.pendingRefunds || 0,
    todayRefunds: analytics.timeBased?.cancelledToday || 0,
  };

  // Loading state
  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-700">Loading cancelled orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (ordersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-4xl mb-4">😔</div>
            <p className="text-red-600 text-lg mb-2">Failed to load cancelled orders</p>
            <p className="text-red-500 text-sm mb-4">
              {ordersError.data?.error || ordersError.error || 'Please try again'}
            </p>
            <button
              onClick={refetchCancelledOrders}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Order Card Component
  const MobileOrderCard = ({ order }) => {
    const financial = order.financialDetails || {};
    const refundPercentage = calculateRefundPercentage(order);
    
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 mb-4 transition-all duration-300 hover:shadow-xl hover:border-blue-300">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-sm font-bold text-blue-900">
              #{order.invoiceNumber}
            </div>
            <div className="text-xs text-blue-600 flex items-center mt-1">
              <FiCalendar className="w-3 h-3 mr-1" />
              {formatDate(order.createdAt)}
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(order)}
            <div className="text-xs text-blue-500 mt-1">
              {getPaymentMethodBadge(order.paymentDetails?.method)}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-3 p-3 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 text-sm">
                {order.user?.name || 'Customer'}
              </h4>
              <p className="text-blue-600 text-xs flex items-center gap-1">
                <FiMail className="w-3 h-3" />
                {order.user?.email || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <FiPackage className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900 text-sm">
              {order.product?.name}
            </span>
          </div>
          <div className="text-xs text-blue-600">
            Qty: {order.quantity} {order.product?.unit} • 
            Category: {order.product?.category}
          </div>
        </div>

        {/* Financial Details */}
        <div className="mb-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-700">Order Amount:</span>
            <span className="font-bold text-green-600">
              {formatCurrency(financial.originalAmount)}
            </span>
          </div>
          
          {financial.cancellationFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Cancellation Fee:</span>
              <span className="font-bold text-red-600">
                -{formatCurrency(financial.cancellationFee)}
              </span>
            </div>
          )}
          
          {financial.refundAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Refund Amount:</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(financial.refundAmount)}
              </span>
            </div>
          )}

          {refundPercentage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Refund Percentage:</span>
              <span className="font-bold text-purple-600">
                {refundPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Cancellation Reason */}
        {order.cancellationDetails?.reason && (
          <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">
              <strong>Reason:</strong> {order.cancellationDetails.reason}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-blue-200">
          <button
            onClick={() => {
              setSelectedOrder(order);
              setShowDetailsModal(true);
            }}
            className="flex items-center gap-1 text-blue-700 hover:text-blue-900 transition-colors p-2 text-xs font-medium cursor-pointer"
          >
            <FiEye className="w-3 h-3" />
            Details
          </button>
          
          {order.paymentDetails?.method === 'online' && 
           order.paymentDetails?.status === 'PAID' && 
           order.refund?.status !== 'PROCESSED' && (
            <button
              onClick={() => handleOrderSelect(order)}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium cursor-pointer"
            >
              <FiDollarSign className="w-3 h-3" />
              Process Refund
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Refund Management</h1>
          <p className="text-blue-700">Manage and process refunds for cancelled orders</p>
        </div>

        {/* Active Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Refunds Processed */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Refunds</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(activeMetrics.totalRefundProcessed)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-600">
              Successfully processed
            </div>
          </div>

          {/* Pending Refunds */}
          <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Pending Refunds</p>
                <p className="text-2xl font-bold text-orange-900">{analytics.statusBreakdown?.pendingRefunds || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FiClock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-orange-600">
              Amount: {formatCurrency(activeMetrics.pendingRefundValue)}
            </div>
          </div>

          {/* Active Refunds */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Active Refunds</p>
                <p className="text-2xl font-bold text-blue-900">{activeMetrics.activeRefunds}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiActivity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              Requires attention
            </div>
          </div>

          {/* Today's Activity */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Today's Refunds</p>
                <p className="text-2xl font-bold text-purple-900">{activeMetrics.todayRefunds}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-purple-600">
              New cancellations
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">Refund Success Rate</p>
                <p className="text-2xl font-bold text-indigo-900">{activeMetrics.successRate}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <FiBarChart className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-indigo-600">
              Average processing time: {activeMetrics.averageRefundTime}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Revenue Impact</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(analytics.financialImpact?.totalRevenueLoss || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-red-600">
              Total amount refunded
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <FiActivity className="w-5 h-5" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all duration-200 cursor-pointer">
              <FiDollarSign className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Process Refund</p>
                <p className="text-xs text-blue-600">Start new refund process</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-all duration-200 cursor-pointer">
              <FiCreditCard className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-green-900">Payment Methods</p>
                <p className="text-xs text-green-600">Manage refund options</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200 hover:bg-purple-100 transition-all duration-200 cursor-pointer">
              <FiBarChart className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <p className="font-medium text-purple-900">Analytics</p>
                <p className="text-xs text-purple-600">View detailed reports</p>
              </div>
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 w-4 h-4 text-blue-500" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, product, or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50 transition-all duration-200 cursor-text"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending_refund">Pending Refund</option>
                <option value="refunded">Refunded</option>
                <option value="refund_failed">Refund Failed</option>
              </select>

              <button
                onClick={refetchCancelledOrders}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 cursor-pointer"
              >
                <FiRefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-blue-600 flex items-center gap-2 cursor-default">
              <FiFilter className="w-4 h-4" />
              {totalItems} cancelled orders found
            </div>
            <div className="text-sm text-blue-600 cursor-default">
              Page {page} of {totalPages}
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider cursor-default">
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider cursor-default">
                    Customer & Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider cursor-default">
                    Amount & Refund
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider cursor-default">
                    Status & Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider cursor-default">
                    Timeline
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider cursor-default">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {cancelledOrders.map((order) => {
                  const refundPercentage = calculateRefundPercentage(order);
                  const financial = order.financialDetails || {};
                  
                  return (
                    <tr key={order._id} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 cursor-default">
                        <div>
                          <div className="font-semibold text-blue-900">
                            #{order.invoiceNumber}
                          </div>
                          <div className="text-blue-600 text-xs mt-1">
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="text-blue-500 text-xs mt-1">
                            Qty: {order.quantity} {order.product?.unit}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 cursor-default">
                        <div>
                          <div className="font-medium text-blue-900">
                            {order.user?.name || 'Customer'}
                          </div>
                          <div className="text-blue-600 text-xs flex items-center gap-1 mt-1">
                            <FiMail className="w-3 h-3" />
                            {order.user?.email || 'N/A'}
                          </div>
                          <div className="text-blue-500 text-xs mt-2">
                            <div className="flex items-center gap-1">
                              <FiPackage className="w-3 h-3" />
                              {order.product?.name}
                            </div>
                            <div className="text-blue-400 text-xs">
                              {order.product?.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 cursor-default">
                        <div className="space-y-1">
                          <div className="font-bold text-green-600">
                            {formatCurrency(financial.originalAmount)}
                          </div>
                          
                          {financial.cancellationFee > 0 && (
                            <div className="text-red-600 text-xs">
                              Fee: -{formatCurrency(financial.cancellationFee)}
                            </div>
                          )}
                          
                          {financial.refundAmount > 0 && (
                            <div className="text-blue-600 text-sm font-semibold">
                              Refund: {formatCurrency(financial.refundAmount)}
                            </div>
                          )}
                          
                          {refundPercentage > 0 && (
                            <div className="text-purple-600 text-xs font-medium">
                              {refundPercentage}% Refunded
                            </div>
                          )}
                          
                          {financial.netLoss > 0 && (
                            <div className="text-red-500 text-xs">
                              Net Loss: {formatCurrency(financial.netLoss)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 cursor-default">
                        <div className="space-y-2">
                          {getStatusBadge(order)}
                          {getPaymentMethodBadge(order.paymentDetails?.method)}
                          {order.cancellationDetails?.reason && (
                            <div className="text-blue-600 text-xs max-w-xs">
                              {order.cancellationDetails.reason}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 cursor-default">
                        <div className="text-blue-900 text-sm">
                          {formatDate(order.timeline?.orderCancelled)}
                        </div>
                        <div className="text-blue-500 text-xs">
                          {order.timeline?.daysSinceCancellation} days ago
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 cursor-pointer"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          {order.paymentDetails?.method === 'online' && 
                           order.paymentDetails?.status === 'PAID' && 
                           order.refund?.status !== 'PROCESSED' && (
                            <button
                              onClick={() => handleOrderSelect(order)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 cursor-pointer"
                              title="Process Refund"
                            >
                              <FiDollarSign className="w-4 h-4" />
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* No Orders State */}
          {cancelledOrders.length === 0 && (
            <div className="text-center py-12 cursor-default">
              <FiShoppingBag className="mx-auto w-16 h-16 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">No cancelled orders found</h3>
              <p className="text-blue-600 mb-6">
                {search 
                  ? `No cancelled orders found with current search` 
                  : "No cancelled orders at the moment"
                }
              </p>
            </div>
          )}
        </div>

        {/* Mobile Lists */}
        <div className="lg:hidden space-y-4">
          {cancelledOrders.map((order) => (
            <MobileOrderCard key={order._id} order={order} />
          ))}
          
          {cancelledOrders.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-blue-200 cursor-default">
              <FiShoppingBag className="mx-auto w-16 h-16 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">No cancelled orders found</h3>
              <p className="text-blue-600 mb-6">
                {search 
                  ? `No cancelled orders found with current search` 
                  : "No cancelled orders at the moment"
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-blue-600 cursor-default">
                Showing page {page} of {totalPages} • {cancelledOrders.length} orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Refund Details Modal */}
        {showRefundModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-900 cursor-default">Process Refund</h2>
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Order Information */}
                  <div className="bg-blue-50 rounded-xl p-4 cursor-default">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Order Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Order ID:</span>
                        <span className="text-blue-900 font-semibold">#{selectedOrder.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Customer:</span>
                        <span className="text-blue-900">{selectedOrder.user?.name || 'Customer'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Product:</span>
                        <span className="text-blue-900">{selectedOrder.product?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Original Amount:</span>
                        <span className="text-blue-900 font-semibold">
                          {formatCurrency(selectedOrder.financialDetails?.originalAmount)}
                        </span>
                      </div>
                      {selectedOrder.financialDetails?.cancellationFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Cancellation Fee:</span>
                          <span className="text-blue-900">
                            {formatCurrency(selectedOrder.financialDetails.cancellationFee)}
                          </span>
                        </div>
                      )}
                      {selectedOrder.financialDetails?.refundAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Refund Amount:</span>
                          <span className="text-blue-900 font-semibold">
                            {formatCurrency(selectedOrder.financialDetails.refundAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-green-700 text-sm">
                      Ready to process refund for this order
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowRefundModal(false)}
                      className="flex-1 px-4 py-3 border border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        toast.success("Refund process initiated!");
                        setShowRefundModal(false);
                      }}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium cursor-pointer flex items-center justify-center gap-2"
                    >
                      <FiDollarSign className="w-4 h-4" />
                      Process Refund
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && displayOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-900 cursor-default">
                    Order Details - #{displayOrder.invoiceNumber || displayOrder.basicInfo?.invoiceNumber}
                  </h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedOrder(null);
                    }}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {orderDetailsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-700">Loading order details...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Basic Order Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-2xl p-6 cursor-default">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                          <FiShoppingBag className="w-5 h-5" />
                          Order Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Order ID</label>
                            <p className="text-blue-900 font-mono">#{displayOrder.invoiceNumber || displayOrder.basicInfo?.invoiceNumber}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Status</label>
                            {getStatusBadge(displayOrder)}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Order Type</label>
                            <p className="text-blue-900">{displayOrder.basicInfo?.orderType || (displayOrder.paymentDetails?.method === 'online' ? 'Online Payment' : 'Cash on Delivery')}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Created At</label>
                            <p className="text-blue-900">{formatDate(displayOrder.createdAt || displayOrder.basicInfo?.createdAt)}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Confirmed At</label>
                            <p className="text-blue-900">{formatDate(displayOrder.timeline?.orderConfirmed || displayOrder.basicInfo?.confirmedAt)}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Cancelled At</label>
                            <p className="text-blue-900">{formatDate(displayOrder.timeline?.orderCancelled || displayOrder.basicInfo?.cancelledAt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-2xl p-6 cursor-default">
                        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                          <FiDollarSign className="w-5 h-5" />
                          Payment Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Payment Method</label>
                            {getPaymentMethodBadge(displayOrder.paymentDetails?.method || displayOrder.financial?.paymentMethod)}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Payment Status</label>
                            <p className="text-green-900 font-semibold capitalize">{displayOrder.paymentDetails?.status || displayOrder.basicInfo?.paymentStatus || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Payment ID</label>
                            <p className="text-green-900 font-mono text-sm">{displayOrder.paymentDetails?.paymentId || displayOrder.financial?.paymentId || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Order ID</label>
                            <p className="text-green-900 font-mono text-sm">{displayOrder.paymentDetails?.paymentOrderId || displayOrder.financial?.paymentOrderId || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-2xl p-6 cursor-default">
                        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                          <FiBarChart className="w-5 h-5" />
                          Financial Summary
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-purple-700">Original Amount:</span>
                            <span className="text-purple-900 font-semibold">{formatCurrency(displayOrder.financialDetails?.originalAmount || displayOrder.financial?.originalAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-700">Base Amount:</span>
                            <span className="text-purple-900">{formatCurrency(displayOrder.financialDetails?.baseAmount || displayOrder.financial?.baseAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-700">GST Amount ({displayOrder.financialDetails?.gstRate || displayOrder.financial?.gstRate}%):</span>
                            <span className="text-purple-900">{formatCurrency(displayOrder.financialDetails?.gstAmount || displayOrder.financial?.gstAmount)}</span>
                          </div>
                          <div className="border-t border-purple-200 pt-2">
                            <div className="flex justify-between">
                              <span className="text-purple-700 font-semibold">Total Amount:</span>
                              <span className="text-purple-900 font-semibold">{formatCurrency(displayOrder.financialDetails?.originalAmount || displayOrder.financial?.originalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Information */}
                    <div className="bg-orange-50 rounded-2xl p-6 cursor-default">
                      <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                        <FiPackage className="w-5 h-5" />
                        Product Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-orange-700 mb-1">Product Name</label>
                          <p className="text-orange-900 font-semibold">{displayOrder.product?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-orange-700 mb-1">Category</label>
                          <p className="text-orange-900">{displayOrder.product?.category || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-orange-700 mb-1">Brand</label>
                          <p className="text-orange-900">{displayOrder.product?.brand || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-orange-700 mb-1">Unit</label>
                          <p className="text-orange-900">{displayOrder.product?.unit || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-orange-700 mb-1">Quantity</label>
                          <p className="text-orange-900 font-semibold">{displayOrder.quantity || displayOrder.order?.quantity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-orange-700 mb-1">Unit Price</label>
                          <p className="text-orange-900">{formatCurrency(displayOrder.unitPrice || displayOrder.order?.unitPrice)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-orange-700 mb-1">GST Rate</label>
                          <p className="text-orange-900">{displayOrder.product?.gstRate || displayOrder.financial?.gstRate}%</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-orange-700 mb-1">HSN Code</label>
                          <p className="text-orange-900 font-mono">{displayOrder.product?.hsnCode || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2 lg:col-span-4">
                          <label className="block text-sm font-medium text-orange-700 mb-1">Description</label>
                          <p className="text-orange-900">{displayOrder.product?.description || 'No description available'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-indigo-50 rounded-2xl p-6 cursor-default">
                      <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                        <FiUser className="w-5 h-5" />
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">Customer Name</label>
                          <p className="text-indigo-900 font-semibold">{displayOrder.user?.name || displayOrder.customer?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">Email</label>
                          <p className="text-indigo-900 break-all">{displayOrder.user?.email || displayOrder.customer?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">Phone</label>
                          <p className="text-indigo-900">{displayOrder.user?.phone || displayOrder.customer?.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">Customer Since</label>
                          <p className="text-indigo-900">{formatDate(displayOrder.customer?.customerSince)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">Total Orders</label>
                          <p className="text-indigo-900">{displayOrder.customer?.totalOrders || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">Cancelled Orders</label>
                          <p className="text-indigo-900">{displayOrder.customer?.cancelledOrders || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block text-sm font-medium text-indigo-700 mb-1">Address</label>
                          <p className="text-indigo-900">{displayOrder.user?.address || displayOrder.customer?.address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="bg-teal-50 rounded-2xl p-6 cursor-default">
                      <h3 className="text-lg font-semibold text-teal-900 mb-4 flex items-center gap-2">
                        <FiTruck className="w-5 h-5" />
                        Shipping Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-teal-700 mb-1">Recipient Name</label>
                          <p className="text-teal-900">{displayOrder.shippingDetails?.name || displayOrder.shipping?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-teal-700 mb-1">Phone</label>
                          <p className="text-teal-900">{displayOrder.shippingDetails?.phone || displayOrder.shipping?.phone || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-teal-700 mb-1">Full Address</label>
                          <p className="text-teal-900 bg-teal-100 p-3 rounded-lg border border-teal-200">
                            {displayOrder.shippingDetails?.address || displayOrder.shipping?.fullAddress || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-teal-700 mb-1">City</label>
                          <p className="text-teal-900">{displayOrder.shippingDetails?.city || displayOrder.shipping?.address?.city || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-teal-700 mb-1">State</label>
                          <p className="text-teal-900">{displayOrder.shippingDetails?.state || displayOrder.shipping?.address?.state || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-teal-700 mb-1">Pincode</label>
                          <p className="text-teal-900">{displayOrder.shippingDetails?.pincode || displayOrder.shipping?.address?.pincode || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-teal-700 mb-1">Country</label>
                          <p className="text-teal-900">{displayOrder.shippingDetails?.country || displayOrder.shipping?.address?.country || 'India'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation & Refund Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-red-50 rounded-2xl p-6 cursor-default">
                        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                          <FiXCircle className="w-5 h-5" />
                          Cancellation Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">Cancellation Reason</label>
                            <p className="text-red-900 bg-red-100 p-3 rounded-lg border border-red-200">
                              {displayOrder.cancellationDetails?.reason || displayOrder.cancellation?.reason || 'No reason provided'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">Cancelled By</label>
                            <p className="text-red-900">{displayOrder.cancellationDetails?.cancelledBy || displayOrder.cancellation?.initiatedBy || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">Cancellation Fee</label>
                            <p className="text-red-900 font-semibold">{formatCurrency(displayOrder.financialDetails?.cancellationFee || displayOrder.financial?.cancellationFee || 0)}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">Time to Cancel</label>
                            <p className="text-red-900">{displayOrder.timeline?.timeToCancelFormatted || displayOrder.cancellation?.timeToCancelFormatted || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">Days Since Cancellation</label>
                            <p className="text-red-900">{displayOrder.timeline?.daysSinceCancellation || displayOrder.cancellation?.daysSinceCancellation || 0} days</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-2xl p-6 cursor-default">
                        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                          <FiDollarSign className="w-5 h-5" />
                          Refund Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Refund Status</label>
                            <p className="text-green-900 font-semibold capitalize">{displayOrder.cancellationDetails?.refundStatus || displayOrder.refund?.status || 'NOT_APPLICABLE'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Refund Amount</label>
                            <p className="text-green-900 font-semibold text-xl">{formatCurrency(displayOrder.financialDetails?.refundAmount || displayOrder.refund?.amount || 0)}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Refund Percentage</label>
                            <p className="text-green-900">{displayOrder.financialDetails?.refundPercentage || displayOrder.financial?.refundPercentage || 0}%</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Refund ID</label>
                            <p className="text-green-900 font-mono text-sm">{displayOrder.cancellationDetails?.refundId || displayOrder.refund?.refundId || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Net Loss</label>
                            <p className="text-green-900 font-semibold">{formatCurrency(displayOrder.financialDetails?.netLoss || displayOrder.financial?.netLoss || 0)}</p>
                          </div>
                          {displayOrder.refund?.processedAt && (
                            <div>
                              <label className="block text-sm font-medium text-green-700 mb-1">Refund Processed At</label>
                              <p className="text-green-900">{formatDate(displayOrder.refund.processedAt)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    {(displayOrder.note || displayOrder.order?.note) && (
                      <div className="bg-gray-50 rounded-2xl p-6 cursor-default">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FiTag className="w-5 h-5" />
                          Additional Notes
                        </h3>
                        <p className="text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                          {displayOrder.note || displayOrder.order?.note}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scroll to top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 z-40 hover:scale-110 cursor-pointer"
        >
          <FiArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Refunds;