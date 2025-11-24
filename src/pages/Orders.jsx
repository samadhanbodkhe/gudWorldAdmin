// src/pages/Orders.jsx
import React, { useState, useEffect } from "react";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useCompleteOrderMutation,
  useCancelOrderMutation,
  useProcessRefundMutation,
} from "../redux/api/ordersApi";
import { toast } from "react-toastify";
import {
  FiEye,
  FiEdit,
  FiX,
  FiSearch,
  FiFilter,
  FiPackage,
  FiCheckCircle,
  FiTruck,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiMail,
  FiPhoneCall,
  FiHome,
  FiCreditCard,
  FiShield,
  FiArrowUp,
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import { FaIndianRupeeSign } from "react-icons/fa6";

const Orders = () => {
  // State for filters and modals
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("");

  // API calls with proper parameters
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetOrdersQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
    paymentStatus: paymentStatusFilter || undefined,
    search: search || undefined,
  });

  const [updateOrderStatus, { isLoading: updatingStatus }] = useUpdateOrderStatusMutation();
  const [completeOrder, { isLoading: completing }] = useCompleteOrderMutation();
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const [processRefund, { isLoading: processingRefund }] = useProcessRefundMutation();

  // Orders data with proper fallbacks
  const orders = data?.bookings || data?.orders || data?.data || [];
  const totalPages = data?.totalPages || data?.lastPage || 1;
  const totalOrders = data?.total || data?.count || 0;

  // FIXED: Get statistics from API response or calculate from all data
  const orderStats = data?.stats || data?.analytics || {
    total: totalOrders,
    pending: data?.pendingCount || 0,
    confirmed: data?.confirmedCount || 0,
    processing: data?.processingCount || 0,
    shipped: data?.shippedCount || 0,
    delivered: data?.deliveredCount || 0,
    completed: data?.completedCount || 0,
    cancelled: data?.cancelledCount || 0,
  };

  // If stats not available in API, calculate from current data (fallback)
  const calculatedStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  };

  // Use API stats if available, otherwise use calculated stats
  const finalOrderStats = orderStats.total > calculatedStats.total ? orderStats : calculatedStats;

  // Status options and colors
  const statusOptions = [
    "PENDING",
    "CONFIRMED", 
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED"
  ];

  const paymentStatusOptions = [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
    "PARTIALLY_REFUNDED"
  ];

  const statusColors = {
    PENDING: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    CONFIRMED: "bg-blue-50 text-blue-800 border border-blue-200",
    PROCESSING: "bg-purple-50 text-purple-800 border border-purple-200",
    SHIPPED: "bg-indigo-50 text-indigo-800 border border-indigo-200",
    DELIVERED: "bg-green-50 text-green-800 border border-green-200",
    COMPLETED: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    CANCELLED: "bg-red-50 text-red-800 border border-red-200",
  };

  const paymentStatusColors = {
    PENDING: "bg-gray-50 text-gray-800 border border-gray-200",
    PAID: "bg-green-50 text-green-800 border border-green-200",
    FAILED: "bg-red-50 text-red-800 border border-red-200",
    REFUNDED: "bg-orange-50 text-orange-800 border border-orange-200",
    PARTIALLY_REFUNDED: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, paymentStatusFilter, search]);

  // Handler functions
  const handleStatusUpdate = async (order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || "");
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateOrderStatus({
        id: editingOrder._id,
        status: newStatus,
        trackingNumber: trackingNumber || undefined
      }).unwrap();
      
      toast.success("Order status updated successfully");
      setShowStatusModal(false);
      setEditingOrder(null);
      setNewStatus("");
      setTrackingNumber("");
      refetch();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.data?.error || error.data?.message || "Failed to update order status");
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await completeOrder(orderId).unwrap();
      toast.success("Order completed successfully");
      refetch();
    } catch (error) {
      console.error('Complete order error:', error);
      toast.error(error.data?.error || error.data?.message || "Failed to complete order");
    }
  };

  const handleCancelOrder = async (order) => {
    setEditingOrder(order);
    setCancellationReason("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    
    if (!cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      await cancelOrder({
        id: editingOrder._id,
        cancellationReason
      }).unwrap();
      
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      setEditingOrder(null);
      setCancellationReason("");
      refetch();
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error(error.data?.error || error.data?.message || "Failed to cancel order");
    }
  };

  const handleProcessRefund = async (order) => {
    setEditingOrder(order);
    setRefundAmount(getRefundableAmount(order));
    setRefundReason("");
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    
    if (!refundReason.trim() || refundAmount <= 0) {
      toast.error("Please provide valid refund details");
      return;
    }

    const maxRefundable = getRefundableAmount(editingOrder);
    if (refundAmount > maxRefundable) {
      toast.error(`Refund amount cannot exceed maximum refundable amount of ${formatCurrency(maxRefundable)}`);
      return;
    }

    try {
      await processRefund({
        id: editingOrder._id,
        refundAmount,
        refundReason
      }).unwrap();
      
      toast.success("Refund processed successfully");
      setShowRefundModal(false);
      setEditingOrder(null);
      setRefundAmount(0);
      setRefundReason("");
      refetch();
    } catch (error) {
      console.error('Refund processing error:', error);
      toast.error(error.data?.error || error.data?.message || "Failed to process refund");
    }
  };

  const resetFilters = () => {
    setStatusFilter("");
    setPaymentStatusFilter("");
    setSearch("");
    setPage(1);
  };

  // Filter orders by search and payment status - FIXED LOGIC
  const filteredOrders = orders.filter(order => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      order.user?.name?.toLowerCase().includes(searchLower) ||
      order._id?.toLowerCase().includes(searchLower) ||
      order.product?.name?.toLowerCase().includes(searchLower) ||
      order.invoiceNumber?.toLowerCase().includes(searchLower) ||
      order.trackingNumber?.toLowerCase().includes(searchLower) ||
      order.paymentId?.toLowerCase().includes(searchLower);

    // If no payment status filter is applied, only apply search filter
    if (!paymentStatusFilter) {
      return matchesSearch;
    }

    // Apply both payment status filter and search filter
    return order.paymentStatus === paymentStatusFilter && matchesSearch;
  });

  // FIXED: Calculate payment statistics properly
  const paymentStats = data?.paymentStats || {
    totalRevenue: orders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((sum, order) => sum + (order.finalAmount || 0), 0),
    pendingPayments: orders.filter(o => o.paymentStatus === 'PENDING').length,
    failedPayments: orders.filter(o => o.paymentStatus === 'FAILED').length,
    refundedAmount: orders
      .filter(o => o.paymentStatus === 'REFUNDED' || o.paymentStatus === 'PARTIALLY_REFUNDED')
      .reduce((sum, order) => sum + (order.refundAmount || 0), 0),
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time function
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate refundable amount
  const getRefundableAmount = (order) => {
    if (order.paymentStatus !== 'PAID') return 0;
    const alreadyRefunded = order.refundAmount || 0;
    return Math.max(0, (order.finalAmount || 0) - alreadyRefunded);
  };

  // Safe data access helpers
  const getProductName = (order) => order.product?.name || 'Product';
  const getProductImage = (order) => order.product?.images?.[0];
  const getCustomerName = (order) => order.user?.name || "N/A";
  const getCustomerEmail = (order) => order.user?.email || "N/A";
  const getCustomerPhone = (order) => order.user?.phone || "N/A";

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-700">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">😔</div>
            <p className="text-red-600 text-lg mb-2">Failed to load orders</p>
            <p className="text-red-500 text-sm mb-4">
              {error.data?.error || error.data?.message || error.error || 'Please try again'}
            </p>
            <button
              onClick={refetch}
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-all duration-200 cursor-pointer hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Order Card Component
  const MobileOrderCard = ({ order }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 mb-4 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-bold text-amber-900">
            #{order.invoiceNumber || order._id?.slice(-8).toUpperCase() || 'N/A'}
          </div>
          <div className="text-xs text-amber-600 flex items-center mt-1">
            <FiUser className="w-3 h-3 mr-1" />
            {getCustomerName(order)}
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
            {order.status}
          </span>
          <div className="text-xs text-amber-500 mt-1 flex items-center">
            <FiCalendar className="w-3 h-3 mr-1" />
            {formatDate(order.createdAt)}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="mb-3 p-3 bg-amber-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-amber-200">
            {getProductImage(order) ? (
              <img
                src={getProductImage(order)}
                alt={getProductName(order)}
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <FiPackage className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 text-sm">
              {getProductName(order)}
            </h4>
            <p className="text-amber-600 text-xs">
              {order.qty || 1} {order.product?.unit || 'unit'} • {formatCurrency(order.finalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col gap-1">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
            {order.paymentStatus}
          </span>
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <FiCreditCard className="w-3 h-3" />
            {order.paymentMethod?.toUpperCase() || 'N/A'}
          </span>
        </div>
        {order.refundAmount > 0 && (
          <span className="text-xs text-orange-600 font-medium">
            Refund: {formatCurrency(order.refundAmount)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-amber-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedOrder(order)}
            className="flex items-center gap-1 text-amber-700 hover:text-amber-900 transition-colors p-2 text-xs font-medium"
          >
            <FiEye className="w-3 h-3" />
            Details
          </button>
          <button
            onClick={() => handleStatusUpdate(order)}
            className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors p-2 text-xs font-medium"
          >
            <FiEdit className="w-3 h-3" />
            Status
          </button>
        </div>
        
        <div className="flex space-x-2">
          {order.status === "DELIVERED" && (
            <button
              onClick={() => handleCompleteOrder(order._id)}
              disabled={completing}
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 transition-colors p-2 text-xs font-medium disabled:opacity-50"
            >
              <FiCheckCircle className="w-3 h-3" />
              Complete
            </button>
          )}
          {order.paymentStatus === 'PAID' && getRefundableAmount(order) > 0 && (
            <button
              onClick={() => handleProcessRefund(order)}
              className="flex items-center gap-1 text-orange-600 hover:text-orange-800 transition-colors p-2 text-xs font-medium"
            >
              <FaIndianRupeeSign className="w-3 h-3" />
              Refund
            </button>
          )}
          {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
            <button
              onClick={() => handleCancelOrder(order)}
              className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors p-2 text-xs font-medium"
            >
              <FiX className="w-3 h-3" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-6 px-0.5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Orders Management</h1>
          <p className="text-amber-700">Manage and track all customer orders with payment processing</p>
        </div>

        {/* Revenue & Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-amber-900">{formatCurrency(paymentStats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Pending Payments</p>
                <p className="text-2xl font-bold text-amber-900">{paymentStats.pendingPayments}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Failed Payments</p>
                <p className="text-2xl font-bold text-amber-900">{paymentStats.failedPayments}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Total Refunded</p>
                <p className="text-2xl font-bold text-amber-900">{formatCurrency(paymentStats.refundedAmount)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FaIndianRupeeSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Order Stats Grid - FIXED: Using proper statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          {[
            { label: 'Total', value: finalOrderStats.total, color: 'bg-white text-amber-900' },
            { label: 'Pending', value: finalOrderStats.pending, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Confirmed', value: finalOrderStats.confirmed, color: 'bg-blue-50 text-blue-700' },
            { label: 'Processing', value: finalOrderStats.processing, color: 'bg-purple-50 text-purple-700' },
            { label: 'Shipped', value: finalOrderStats.shipped, color: 'bg-indigo-50 text-indigo-700' },
            { label: 'Delivered', value: finalOrderStats.delivered, color: 'bg-green-50 text-green-700' },
            { label: 'Completed', value: finalOrderStats.completed, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Cancelled', value: finalOrderStats.cancelled, color: 'bg-red-50 text-red-700' },
          ].map((stat, index) => (
            <div key={stat.label} className={`rounded-2xl p-4 text-center transition-all duration-300 hover:scale-105 cursor-default ${stat.color} border border-amber-200`}>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs font-medium opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Rest of the component remains exactly the same */}
        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 w-4 h-4 text-amber-500" />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer, product, payment ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1 lg:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 transition-all duration-200"
              >
                <option value="">All Order Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="flex-1 lg:flex-none">
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 transition-all duration-200"
              >
                <option value="">All Payment Status</option>
                {paymentStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="px-6 py-3 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={refetch}
                className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-amber-600 flex items-center gap-2">
              <FiFilter className="w-4 h-4" />
              {filteredOrders.length} orders found
              {(statusFilter || paymentStatusFilter) && (
                <span className="text-amber-500 text-xs">
                  (Filtered: {statusFilter ? `Status: ${statusFilter}` : ''} 
                  {statusFilter && paymentStatusFilter ? ', ' : ''}
                  {paymentStatusFilter ? `Payment: ${paymentStatusFilter}` : ''})
                </span>
              )}
            </div>
            <div className="text-sm text-amber-600">
              Page {page} of {totalPages}
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-amber-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-amber-900 text-sm">
                          #{order.invoiceNumber || order._id?.slice(-8).toUpperCase() || 'N/A'}
                        </div>
                        <div className="text-amber-600 text-xs flex items-center gap-1 mt-1">
                          <FiUser className="w-3 h-3" />
                          {getCustomerName(order)}
                        </div>
                        {order.paymentId && (
                          <div className="text-amber-500 text-xs flex items-center gap-1 mt-1">
                            <FiCreditCard className="w-3 h-3" />
                            {order.paymentId.slice(-8)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200">
                          {getProductImage(order) ? (
                            <img
                              src={getProductImage(order)}
                              alt={getProductName(order)}
                              className="w-8 h-8 object-cover rounded"
                            />
                          ) : (
                            <FiPackage className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-amber-900 text-sm">
                            {getProductName(order)}
                          </div>
                          <div className="text-amber-600 text-xs">
                            {order.qty || 1} {order.product?.unit || 'unit'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-amber-900 text-sm">{formatCurrency(order.finalAmount)}</div>
                      {order.refundAmount > 0 && (
                        <div className="text-orange-600 text-xs">
                          Refund: {formatCurrency(order.refundAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                      {order.trackingNumber && (
                        <div className="text-amber-500 text-xs mt-1 flex items-center gap-1">
                          <FiTruck className="w-3 h-3" />
                          {order.trackingNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
                        {order.paymentStatus}
                      </span>
                      {order.paymentId && (
                        <div className="text-amber-500 text-xs mt-1">
                          ID: {order.paymentId.slice(-12)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-amber-900 text-sm capitalize">{order.paymentMethod || 'N/A'}</div>
                      {order.paymentOrderId && (
                        <div className="text-amber-500 text-xs">
                          Order: {order.paymentOrderId.slice(-8)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-amber-900 text-sm">{formatDate(order.createdAt)}</div>
                      <div className="text-amber-500 text-xs">{formatTime(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title="Update Status"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        {order.paymentStatus === 'PAID' && getRefundableAmount(order) > 0 && (
                          <button
                            onClick={() => handleProcessRefund(order)}
                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-all duration-200"
                            title="Process Refund"
                          >
                            <FiDollarSign className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === "DELIVERED" && (
                          <button
                            onClick={() => handleCompleteOrder(order._id)}
                            disabled={completing}
                            className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Complete Order"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Cancel Order"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No Orders State */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <FiPackage className="mx-auto w-16 h-16 text-amber-400 mb-4" />
              <h3 className="text-lg font-semibold text-amber-900 mb-2">No orders found</h3>
              <p className="text-amber-600 mb-6">
                {statusFilter || paymentStatusFilter || search
                  ? `No orders found with current filters` 
                  : "No orders available"
                }
              </p>
              <button
                onClick={resetFilters}
                className="bg-amber-600 text-white px-6 py-2 rounded-xl hover:bg-amber-700 transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Mobile Orders List */}
        <div className="lg:hidden space-y-4">
          {filteredOrders.map((order) => (
            <MobileOrderCard key={order._id} order={order} />
          ))}
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-amber-200">
              <FiPackage className="mx-auto w-16 h-16 text-amber-400 mb-4" />
              <h3 className="text-lg font-semibold text-amber-900 mb-2">No orders found</h3>
              <p className="text-amber-600 mb-6">
                {statusFilter || paymentStatusFilter || search
                  ? `No orders found with current filters` 
                  : "No orders available"
                }
              </p>
              <button
                onClick={resetFilters}
                className="bg-amber-600 text-white px-6 py-2 rounded-xl hover:bg-amber-700 transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-amber-600">
                Showing page {page} of {totalPages} • {filteredOrders.length} orders on this page
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-4 py-2 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-amber-900">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-amber-500 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-all duration-200"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Information */}
                  <div className="bg-amber-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <FiPackage className="w-5 h-5" />
                      Order Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-amber-700 mb-1">Order ID</label>
                        <p className="text-amber-900 font-mono text-sm">{selectedOrder._id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-700 mb-1">Invoice Number</label>
                        <p className="text-amber-900 font-semibold">{selectedOrder.invoiceNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-700 mb-1">Date & Time</label>
                        <p className="text-amber-900">
                          {formatDate(selectedOrder.createdAt)} at {formatTime(selectedOrder.createdAt)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-700 mb-1">Payment Method</label>
                        <p className="text-amber-900 capitalize">{selectedOrder.paymentMethod || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-amber-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <FiCreditCard className="w-5 h-5" />
                      Payment Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-amber-700 mb-1">Payment Status</label>
                        <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${paymentStatusColors[selectedOrder.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-700 mb-1">Payment Amount</label>
                        <p className="text-amber-900 font-semibold">{formatCurrency(selectedOrder.finalAmount)}</p>
                      </div>
                      {selectedOrder.paymentId && (
                        <div>
                          <label className="block text-sm font-medium text-amber-700 mb-1">Payment ID</label>
                          <p className="text-amber-900 font-mono text-sm">{selectedOrder.paymentId}</p>
                        </div>
                      )}
                      {selectedOrder.paymentOrderId && (
                        <div>
                          <label className="block text-sm font-medium text-amber-700 mb-1">Razorpay Order ID</label>
                          <p className="text-amber-900 font-mono text-sm">{selectedOrder.paymentOrderId}</p>
                        </div>
                      )}
                      {selectedOrder.refundAmount > 0 && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-amber-700 mb-1">Refund Details</label>
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                            <p className="text-orange-800 font-semibold">
                              Refunded: {formatCurrency(selectedOrder.refundAmount)}
                            </p>
                            {selectedOrder.refundReason && (
                              <p className="text-orange-700 text-sm mt-1">
                                Reason: {selectedOrder.refundReason}
                              </p>
                            )}
                            {selectedOrder.refundedAt && (
                              <p className="text-orange-600 text-xs mt-1">
                                Refunded on: {formatDate(selectedOrder.refundedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-amber-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-amber-900 mb-4">Order Status</h3>
                      <span className={`inline-block px-4 py-2 text-sm rounded-full font-medium ${statusColors[selectedOrder.status] || 'bg-gray-100 text-gray-800'}`}>
                        {selectedOrder.status}
                      </span>
                      {selectedOrder.trackingNumber && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-amber-700 mb-1">Tracking Number</label>
                          <p className="text-amber-900 font-mono">{selectedOrder.trackingNumber}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-amber-900 mb-4">Timeline</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-amber-600">Created:</span>
                          <span className="text-amber-900">{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                        {selectedOrder.confirmedAt && (
                          <div className="flex justify-between">
                            <span className="text-amber-600">Confirmed:</span>
                            <span className="text-amber-900">{formatDate(selectedOrder.confirmedAt)}</span>
                          </div>
                        )}
                        {selectedOrder.cancelledAt && (
                          <div className="flex justify-between">
                            <span className="text-amber-600">Cancelled:</span>
                            <span className="text-amber-900">{formatDate(selectedOrder.cancelledAt)}</span>
                          </div>
                        )}
                        {selectedOrder.completedAt && (
                          <div className="flex justify-between">
                            <span className="text-amber-600">Completed:</span>
                            <span className="text-amber-900">{formatDate(selectedOrder.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-amber-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <FiUser className="w-5 h-5" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-amber-700 mb-1">Name</label>
                        <p className="text-amber-900">{getCustomerName(selectedOrder)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-700 mb-1">Email</label>
                        <p className="text-amber-900 break-all">{getCustomerEmail(selectedOrder)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-700 mb-1">Phone</label>
                        <p className="text-amber-900 flex items-center gap-2">
                          <FiPhoneCall className="w-4 h-4" />
                          {getCustomerPhone(selectedOrder)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div className="bg-amber-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                        <FiHome className="w-5 h-5" />
                        Shipping Address
                      </h3>
                      <div className="space-y-2">
                        <p className="text-amber-900 font-semibold">{selectedOrder.shippingAddress.name}</p>
                        <p className="text-amber-700">{selectedOrder.shippingAddress.address}</p>
                        <p className="text-amber-700">
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                        </p>
                        <p className="text-amber-700 flex items-center gap-2">
                          <FiPhone className="w-4 h-4" />
                          {selectedOrder.shippingAddress.phone}
                        </p>
                        <p className="text-amber-600 text-sm capitalize">Type: {selectedOrder.shippingAddress.type}</p>
                      </div>
                    </div>
                  )}

                  {/* Product Information */}
                  <div className="bg-amber-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4">Product Information</h3>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-amber-200">
                      <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200">
                        {getProductImage(selectedOrder) ? (
                          <img
                            src={getProductImage(selectedOrder)}
                            alt={getProductName(selectedOrder)}
                            className="w-14 h-14 object-cover rounded"
                          />
                        ) : (
                          <FiPackage className="w-6 h-6 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900">{getProductName(selectedOrder)}</h4>
                        <div className="text-amber-600 text-sm mt-1">
                          <span>SKU: {selectedOrder.product?.sku || "N/A"}</span>
                          <span className="mx-2">•</span>
                          <span>Category: {selectedOrder.product?.category || "N/A"}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-900">{formatCurrency(selectedOrder.finalAmount)}</div>
                        <div className="text-amber-600 text-sm">
                          {selectedOrder.qty || 1} {selectedOrder.product?.unit || "unit"} × {formatCurrency(selectedOrder.unitPrice || selectedOrder.finalAmount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-amber-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-700">Subtotal</span>
                        <span className="text-amber-900 font-semibold">{formatCurrency(selectedOrder.totalAmount || selectedOrder.finalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-700">Discount</span>
                        <span className="text-green-600 font-semibold">
                          -{formatCurrency((selectedOrder.totalAmount || selectedOrder.finalAmount) - selectedOrder.finalAmount)}
                        </span>
                      </div>
                      {selectedOrder.refundAmount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-amber-700">Refunded</span>
                          <span className="text-orange-600 font-semibold">
                            -{formatCurrency(selectedOrder.refundAmount)}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-amber-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-amber-900">Net Amount</span>
                          <span className="text-lg font-bold text-amber-900">
                            {formatCurrency(selectedOrder.finalAmount - (selectedOrder.refundAmount || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {selectedOrder.note && (
                    <div className="bg-amber-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-amber-900 mb-4">Order Note</h3>
                      <p className="text-amber-700 bg-white p-4 rounded-xl border border-amber-200">{selectedOrder.note}</p>
                    </div>
                  )}

                  {selectedOrder.cancellationReason && (
                    <div className="bg-red-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-4">Cancellation Details</h3>
                      <p className="text-red-700 bg-white p-4 rounded-xl border border-red-200">{selectedOrder.cancellationReason}</p>
                      <p className="text-red-600 text-sm mt-2">
                        Cancelled by: {selectedOrder.cancelledBy} • {formatDate(selectedOrder.cancelledAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal - FIXED RESPONSIVE DESIGN */}
        {showStatusModal && editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col">
              <div className="p-6 flex-shrink-0 border-b border-amber-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-amber-900">Update Order Status</h2>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-amber-500 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-all duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleStatusSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">
                      Order Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 transition-all duration-200"
                      required
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(newStatus === "SHIPPED" || newStatus === "DELIVERED") && (
                    <div>
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                        className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 transition-all duration-200"
                      />
                    </div>
                  )}
                </div>

                <div className="p-6 flex-shrink-0 border-t border-amber-200 bg-amber-50 rounded-b-2xl">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowStatusModal(false)}
                      className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-100 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingStatus}
                      className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStatus ? "Updating..." : "Update Status"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Order Modal - FIXED RESPONSIVE DESIGN */}
        {showCancelModal && editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col">
              <div className="p-6 flex-shrink-0 border-b border-amber-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-amber-900">Cancel Order</h2>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="text-amber-500 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-all duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCancelSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">
                      Cancellation Reason *
                    </label>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Please provide a reason for cancellation..."
                      rows="4"
                      className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 transition-all duration-200 resize-none"
                      required
                    />
                  </div>

                  {editingOrder.paymentStatus === 'PAID' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800">
                        💰 This order was paid online. A refund of {formatCurrency(editingOrder.finalAmount)} will be processed automatically after cancellation.
                      </p>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This action cannot be undone. The order will be cancelled and stock will be returned to inventory.
                    </p>
                  </div>
                </div>

                <div className="p-6 flex-shrink-0 border-t border-amber-200 bg-amber-50 rounded-b-2xl">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-100 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={cancelling}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Process Refund Modal - FIXED RESPONSIVE DESIGN */}
        {showRefundModal && editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col">
              <div className="p-6 flex-shrink-0 border-b border-amber-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-amber-900">Process Refund</h2>
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="text-amber-500 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-all duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleRefundSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="text-sm text-amber-700 space-y-2">
                      <p><strong>Order:</strong> #{editingOrder.invoiceNumber || editingOrder._id?.slice(-8).toUpperCase()}</p>
                      <p><strong>Customer:</strong> {getCustomerName(editingOrder)}</p>
                      <p><strong>Paid Amount:</strong> {formatCurrency(editingOrder.finalAmount)}</p>
                      <p><strong>Already Refunded:</strong> {formatCurrency(editingOrder.refundAmount || 0)}</p>
                      <p className="font-semibold text-green-600 mt-2">
                        Max Refundable: {formatCurrency(getRefundableAmount(editingOrder))}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">
                      Refund Amount *
                    </label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                      min="0"
                      max={getRefundableAmount(editingOrder)}
                      step="0.01"
                      className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 transition-all duration-200"
                      required
                    />
                    <p className="text-xs text-amber-500 mt-1">
                      Maximum refundable amount: {formatCurrency(getRefundableAmount(editingOrder))}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">
                      Refund Reason *
                    </label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Please provide a reason for refund..."
                      rows="3"
                      className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 transition-all duration-200 resize-none"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      💳 This refund will be processed through Razorpay and credited back to the customer's original payment method.
                      A 2% processing fee may be deducted by the payment gateway.
                    </p>
                  </div>
                </div>

                <div className="p-6 flex-shrink-0 border-t border-amber-200 bg-amber-50 rounded-b-2xl">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowRefundModal(false)}
                      className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-100 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processingRefund || refundAmount > getRefundableAmount(editingOrder) || refundAmount <= 0}
                      className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingRefund ? "Processing..." : "Process Refund"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Scroll to top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-amber-600 text-white p-3 rounded-full shadow-lg hover:bg-amber-700 transition-all duration-200 z-40 hover:scale-110"
        >
          <FiArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Orders;