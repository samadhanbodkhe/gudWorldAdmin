// src/pages/Refunds.jsx
import React, { useState, useEffect } from "react";
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
} from "react-icons/fi";
import { useGetCancelledOrdersQuery } from "../redux/api/ordersApi";
import { 
  useGetAllRefundsQuery, 
  useGetRefundAnalyticsQuery, 
  useProcessRefundMutation 
} from "../redux/api/refundApi";

const Refunds = () => {
  // State for filters and modals
  const [page, setPage] = useState(1);
  const [refundsPage, setRefundsPage] = useState(1);
  const [search, setSearch] = useState("");
  const [refundsSearch, setRefundsSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "processed"
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundDetailsModal, setShowRefundDetailsModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // API calls for cancelled orders
  const {
    data: cancelledOrdersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchCancelledOrders,
  } = useGetCancelledOrdersQuery({
    page,
    limit: 10,
    search,
  });

  // API calls for refunds
  const {
    data: refundsData,
    isLoading: refundsLoading,
    error: refundsError,
    refetch: refetchRefunds,
  } = useGetAllRefundsQuery({
    page: refundsPage,
    limit: 10,
    search: refundsSearch,
  });

  const { data: refundAnalyticsData } = useGetRefundAnalyticsQuery();

  const [processRefund, { 
    isLoading: processingOrderRefund,
    isSuccess: refundProcessedSuccess
  }] = useProcessRefundMutation();

  // Real-time updates when refund is processed
  useEffect(() => {
    if (refundProcessedSuccess) {
      // Refetch both queries to get updated data
      refetchCancelledOrders();
      refetchRefunds();
    }
  }, [refundProcessedSuccess, refetchCancelledOrders, refetchRefunds]);

  // Cancelled orders data
  const cancelledOrders = cancelledOrdersData?.cancelledOrders || [];
  const totalPages = cancelledOrdersData?.pagination?.totalPages || 1;
  const totalItems = cancelledOrdersData?.pagination?.total || 0;

  // Refunds data
  const refunds = refundsData?.refunds || [];
  const refundsTotalPages = refundsData?.pagination?.totalPages || 1;
  const refundsTotalItems = refundsData?.pagination?.total || 0;

  // Filter pending refunds (only orders that haven't been refunded yet)
  const pendingRefundsOrders = cancelledOrders.filter(order => 
    order.paymentStatus !== 'REFUNDED' && 
    order.refundStatus !== 'PROCESSED'
  );

  // Status colors
  const orderStatusColors = {
    CANCELLED: "bg-red-50 text-red-800 border border-red-200",
    REFUND_PENDING: "bg-orange-50 text-orange-800 border border-orange-200",
    REFUND_PROCESSED: "bg-green-50 text-green-800 border border-green-200",
    REFUND_INITIATED: "bg-blue-50 text-blue-800 border border-blue-200",
    REFUND_COMPLETED: "bg-green-50 text-green-800 border border-green-200",
    REFUND_FAILED: "bg-red-50 text-red-800 border border-red-200",
    PENDING: "bg-orange-50 text-orange-800 border border-orange-200",
    PROCESSED: "bg-green-50 text-green-800 border border-green-200",
    FAILED: "bg-red-50 text-red-800 border border-red-200",
    CANCELLED: "bg-gray-50 text-gray-800 border border-gray-200",
  };

  // Handler functions
  const handleProcessRefund = async (order) => {
    if (!refundAmount || !refundReason) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const result = await processRefund({
        id: order._id,
        refundAmount: parseFloat(refundAmount),
        refundReason,
      }).unwrap();
      
      toast.success("Refund processed successfully");
      setShowRefundModal(false);
      setRefundAmount("");
      setRefundReason("");
      
      // The useEffect will handle the refetching automatically
    } catch (error) {
      console.error('Refund processing error:', error);
      toast.error(error.data?.error || "Failed to process refund");
    }
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setRefundAmount(order.totalAmount ? order.totalAmount.toString() : order.finalAmount.toString());
    setRefundReason(`Refund for cancelled order #${order.invoiceNumber}`);
    setShowRefundModal(true);
  };

  const handleRefundSelect = (refund) => {
    setSelectedRefund(refund);
    setShowRefundDetailsModal(true);
  };

  // Format date function
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

  // Loading state
  if (ordersLoading && activeTab === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-700">Loading cancelled orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (refundsLoading && activeTab === "processed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-700">Loading refund history...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (ordersError && activeTab === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">😔</div>
            <p className="text-red-600 text-lg mb-2">Failed to load cancelled orders</p>
            <p className="text-red-500 text-sm mb-4">
              {ordersError.data?.error || ordersError.error || 'Please try again'}
            </p>
            <button
              onClick={refetchCancelledOrders}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 cursor-pointer hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (refundsError && activeTab === "processed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">😔</div>
            <p className="text-red-600 text-lg mb-2">Failed to load refund history</p>
            <p className="text-red-500 text-sm mb-4">
              {refundsError.data?.error || refundsError.error || 'Please try again'}
            </p>
            <button
              onClick={refetchRefunds}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 cursor-pointer hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Cancelled Order Card Component
  const MobileCancelledOrderCard = ({ order }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-4 mb-4 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-bold text-orange-900">
            Order #{order.invoiceNumber}
          </div>
          <div className="text-xs text-orange-600 flex items-center mt-1">
            <FiPackage className="w-3 h-3 mr-1" />
            {order.items?.length || 0} items
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${orderStatusColors[order.status]}`}>
            <FiXCircle className="w-3 h-3" />
            {order.status}
          </span>
          <div className="text-xs text-orange-500 mt-1 flex items-center">
            <FiCalendar className="w-3 h-3 mr-1" />
            {formatDate(order.updatedAt)}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="mb-3 p-3 bg-orange-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-orange-200">
            <FiUsers className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-orange-900 text-sm">
              {order.user?.name || 'Customer'}
            </h4>
            <p className="text-orange-600 text-xs">
              {order.user?.email || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Amount & Reason */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-orange-700 text-sm">Order Amount:</span>
          <span className="font-bold text-green-600 text-sm">
            {formatCurrency(order.totalAmount || order.finalAmount)}
          </span>
        </div>
        {order.cancellationReason && (
          <div className="text-orange-600 text-xs">
            <strong>Cancellation Reason:</strong> {order.cancellationReason}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-orange-200">
        <button
          onClick={() => {
            setSelectedOrder(order);
            setShowDetailsModal(true);
          }}
          className="flex items-center gap-1 text-orange-700 hover:text-orange-900 transition-colors p-2 text-xs font-medium cursor-pointer"
        >
          <FiEye className="w-3 h-3" />
          Details
        </button>
        
        <button
          onClick={() => handleOrderSelect(order)}
          disabled={processingOrderRefund}
          className="flex items-center gap-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FiDollarSign className="w-3 h-3" />
          Process Refund
        </button>
      </div>
    </div>
  );

  // Mobile Refund Card Component
  const MobileRefundCard = ({ refund }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-4 mb-4 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-bold text-green-900">
            Refund #{refund.refundId}
          </div>
          <div className="text-xs text-green-600 flex items-center mt-1">
            <FiShoppingBag className="w-3 h-3 mr-1" />
            Order #{refund.order?.invoiceNumber}
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${orderStatusColors[refund.status]}`}>
            {refund.status === 'PROCESSED' || refund.status === 'REFUND_COMPLETED' ? (
              <FiCheckCircle className="w-3 h-3" />
            ) : (
              <FiClock className="w-3 h-3" />
            )}
            {refund.status}
          </span>
          <div className="text-xs text-green-500 mt-1 flex items-center">
            <FiCalendar className="w-3 h-3 mr-1" />
            {formatDate(refund.processedAt || refund.createdAt)}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="mb-3 p-3 bg-green-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-green-200">
            <FiUsers className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 text-sm">
              {refund.user?.name || 'Customer'}
            </h4>
            <p className="text-green-600 text-xs">
              {refund.user?.email || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Amount & Reason */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-green-700 text-sm">Refund Amount:</span>
          <span className="font-bold text-green-600 text-sm">
            {formatCurrency(refund.refundAmount)}
          </span>
        </div>
        {refund.refundReason && (
          <div className="text-green-600 text-xs">
            <strong>Refund Reason:</strong> {refund.refundReason}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-green-200">
        <button
          onClick={() => handleRefundSelect(refund)}
          className="flex items-center gap-1 text-green-700 hover:text-green-900 transition-colors p-2 text-xs font-medium cursor-pointer"
        >
          <FiEye className="w-3 h-3" />
          View Details
        </button>
        
        <div className="text-green-600 text-xs font-medium">
          {refund.paymentMethod || 'Payment Gateway'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Refunds Management</h1>
          <p className="text-blue-700">Manage pending refunds and view refund history</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-2 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "pending"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-blue-700 hover:bg-blue-50"
              }`}
            >
              Pending Refunds ({pendingRefundsOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("processed")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "processed"
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-green-700 hover:bg-green-50"
              }`}
            >
              Refund History ({refunds.length})
            </button>
          </div>
        </div>

        {/* Pending Refunds Tab */}
        {activeTab === "pending" && (
          <>
            {/* Filters Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-3 w-4 h-4 text-blue-500" />
                    <input
                      type="text"
                      placeholder="Search cancelled orders by order ID, customer name, or reason..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50 transition-all duration-200 cursor-text"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
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
                  {pendingRefundsOrders.length} pending refunds found
                </div>
                <div className="text-sm text-blue-600 cursor-default">
                  Page {page} of {totalPages}
                </div>
              </div>
            </div>

            {/* Desktop Table for Cancelled Orders */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-orange-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-orange-900 uppercase tracking-wider cursor-default">
                        Order Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-orange-900 uppercase tracking-wider cursor-default">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-orange-900 uppercase tracking-wider cursor-default">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-orange-900 uppercase tracking-wider cursor-default">
                        Status & Reason
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-orange-900 uppercase tracking-wider cursor-default">
                        Cancelled Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-orange-900 uppercase tracking-wider cursor-default">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {pendingRefundsOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-orange-50 transition-colors duration-200">
                        <td className="px-6 py-4 cursor-default">
                          <div>
                            <div className="font-semibold text-orange-900 text-sm">
                              Order #{order.invoiceNumber}
                            </div>
                            <div className="text-orange-600 text-xs mt-1">
                              {order.items?.length || 0} items
                            </div>
                            <div className="text-orange-500 text-xs flex items-center gap-1 mt-1">
                              <FiPackage className="w-3 h-3" />
                              {order.paymentMethod || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 cursor-default">
                          <div>
                            <div className="font-medium text-orange-900 text-sm">
                              {order.user?.name || 'Customer'}
                            </div>
                            <div className="text-orange-600 text-xs">
                              {order.user?.email || 'N/A'}
                            </div>
                            <div className="text-orange-500 text-xs">
                              {order.user?.phone || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 cursor-default">
                          <div className="font-bold text-green-600 text-sm">
                            {formatCurrency(order.totalAmount || order.finalAmount)}
                          </div>
                          <div className="text-orange-600 text-xs">
                            Paid: {formatCurrency(order.amountPaid || order.finalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 cursor-default">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center gap-1 w-fit ${orderStatusColors[order.status]}`}>
                            <FiXCircle className="w-3 h-3" />
                            {order.status}
                          </span>
                          {order.cancellationReason && (
                            <div className="text-orange-600 text-xs mt-2 max-w-xs">
                              {order.cancellationReason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 cursor-default">
                          <div className="text-orange-900 text-sm">{formatDate(order.updatedAt)}</div>
                          <div className="text-orange-500 text-xs">
                            Created: {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-lg transition-all duration-200 cursor-pointer"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOrderSelect(order)}
                              disabled={processingOrderRefund}
                              className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              title="Process Refund"
                            >
                              <FiDollarSign className="w-4 h-4" />
                              Refund
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* No Cancelled Orders State */}
              {pendingRefundsOrders.length === 0 && (
                <div className="text-center py-12 cursor-default">
                  <FiShoppingBag className="mx-auto w-16 h-16 text-orange-400 mb-4" />
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">No pending refunds found</h3>
                  <p className="text-orange-600 mb-6">
                    {search 
                      ? `No cancelled orders found with current search` 
                      : "No pending refunds at the moment"
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Lists for Pending */}
            <div className="lg:hidden space-y-4">
              {pendingRefundsOrders.map((order) => (
                <MobileCancelledOrderCard key={order._id} order={order} />
              ))}
              
              {pendingRefundsOrders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-orange-200 cursor-default">
                  <FiShoppingBag className="mx-auto w-16 h-16 text-orange-400 mb-4" />
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">No pending refunds found</h3>
                  <p className="text-orange-600 mb-6">
                    {search 
                      ? `No cancelled orders found with current search` 
                      : "No pending refunds at the moment"
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Pagination for Pending */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-blue-600 cursor-default">
                    Showing page {page} of {totalPages} • {pendingRefundsOrders.length} pending refunds
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
          </>
        )}

        {/* Processed Refunds Tab */}
        {activeTab === "processed" && (
          <>
            {/* Filters Section for Refunds */}
            <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-3 w-4 h-4 text-green-500" />
                    <input
                      type="text"
                      placeholder="Search refunds by refund ID, order ID, or customer name..."
                      value={refundsSearch}
                      onChange={(e) => setRefundsSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50 transition-all duration-200 cursor-text"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={refetchRefunds}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-green-600 flex items-center gap-2 cursor-default">
                  <FiFilter className="w-4 h-4" />
                  {refunds.length} refunds found
                </div>
                <div className="text-sm text-green-600 cursor-default">
                  Page {refundsPage} of {refundsTotalPages}
                </div>
              </div>
            </div>

            {/* Desktop Table for Refunds */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider cursor-default">
                        Refund Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider cursor-default">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider cursor-default">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider cursor-default">
                        Status & Reason
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider cursor-default">
                        Processed Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider cursor-default">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {refunds.map((refund) => (
                      <tr key={refund._id} className="hover:bg-green-50 transition-colors duration-200">
                        <td className="px-6 py-4 cursor-default">
                          <div>
                            <div className="font-semibold text-green-900 text-sm">
                              Refund #{refund.refundId}
                            </div>
                            <div className="text-green-600 text-xs mt-1">
                              Order #{refund.order?.invoiceNumber}
                            </div>
                            <div className="text-green-500 text-xs flex items-center gap-1 mt-1">
                              <FiPackage className="w-3 h-3" />
                              {refund.paymentMethod || 'Payment Gateway'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 cursor-default">
                          <div>
                            <div className="font-medium text-green-900 text-sm">
                              {refund.user?.name || 'Customer'}
                            </div>
                            <div className="text-green-600 text-xs">
                              {refund.user?.email || 'N/A'}
                            </div>
                            <div className="text-green-500 text-xs">
                              {refund.user?.phone || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 cursor-default">
                          <div className="font-bold text-green-600 text-sm">
                            {formatCurrency(refund.refundAmount)}
                          </div>
                          <div className="text-green-600 text-xs">
                            Order: {formatCurrency(refund.order?.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 cursor-default">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center gap-1 w-fit ${orderStatusColors[refund.status]}`}>
                            {refund.status === 'PROCESSED' || refund.status === 'REFUND_COMPLETED' ? (
                              <FiCheckCircle className="w-3 h-3" />
                            ) : (
                              <FiClock className="w-3 h-3" />
                            )}
                            {refund.status}
                          </span>
                          {refund.refundReason && (
                            <div className="text-green-600 text-xs mt-2 max-w-xs">
                              {refund.refundReason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 cursor-default">
                          <div className="text-green-900 text-sm">{formatDate(refund.processedAt || refund.createdAt)}</div>
                          <div className="text-green-500 text-xs">
                            Created: {formatDate(refund.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleRefundSelect(refund)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200 cursor-pointer"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* No Refunds State */}
              {refunds.length === 0 && (
                <div className="text-center py-12 cursor-default">
                  <FiCheckCircle className="mx-auto w-16 h-16 text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold text-green-900 mb-2">No refunds found</h3>
                  <p className="text-green-600 mb-6">
                    {refundsSearch 
                      ? `No refunds found with current search` 
                      : "No refunds have been processed yet"
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Lists for Refunds */}
            <div className="lg:hidden space-y-4">
              {refunds.map((refund) => (
                <MobileRefundCard key={refund._id} refund={refund} />
              ))}
              
              {refunds.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-green-200 cursor-default">
                  <FiCheckCircle className="mx-auto w-16 h-16 text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold text-green-900 mb-2">No refunds found</h3>
                  <p className="text-green-600 mb-6">
                    {refundsSearch 
                      ? `No refunds found with current search` 
                      : "No refunds have been processed yet"
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Pagination for Refunds */}
            {refundsTotalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-green-600 cursor-default">
                    Showing page {refundsPage} of {refundsTotalPages} • {refundsTotalItems} total refunds
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRefundsPage(p => Math.max(1, p - 1))}
                      disabled={refundsPage === 1}
                      className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      onClick={() => setRefundsPage(p => Math.min(refundsTotalPages, p + 1))}
                      disabled={refundsPage === refundsTotalPages}
                      className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Process Refund Modal */}
        {showRefundModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-orange-900 cursor-default">Process Refund</h2>
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="text-orange-500 hover:text-orange-700 p-2 rounded-lg hover:bg-orange-50 transition-all duration-200 cursor-pointer"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Order Information */}
                  <div className="bg-orange-50 rounded-xl p-4 cursor-default">
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">Order Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-orange-700">Order ID:</span>
                        <span className="text-orange-900 font-semibold">#{selectedOrder.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-700">Customer:</span>
                        <span className="text-orange-900">{selectedOrder.user?.name || 'Customer'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-700">Total Amount:</span>
                        <span className="text-orange-900 font-semibold">
                          {formatCurrency(selectedOrder.totalAmount || selectedOrder.finalAmount)}
                        </span>
                      </div>
                      {selectedOrder.cancellationReason && (
                        <div>
                          <span className="text-orange-700">Cancellation Reason:</span>
                          <p className="text-orange-900 mt-1">{selectedOrder.cancellationReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Refund Amount */}
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-2 cursor-default">
                      Refund Amount *
                    </label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Enter refund amount"
                      className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-orange-50 transition-all duration-200 cursor-text"
                      max={selectedOrder.totalAmount || selectedOrder.finalAmount}
                    />
                    <p className="text-xs text-orange-600 mt-1 cursor-default">
                      Maximum refundable amount: {formatCurrency(selectedOrder.totalAmount || selectedOrder.finalAmount)}
                    </p>
                  </div>

                  {/* Refund Reason */}
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-2 cursor-default">
                      Refund Reason *
                    </label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Enter reason for refund"
                      rows="3"
                      className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-orange-50 transition-all duration-200 cursor-text"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowRefundModal(false)}
                      className="flex-1 px-4 py-3 border border-orange-300 text-orange-700 rounded-xl hover:bg-orange-50 transition-all duration-200 font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleProcessRefund(selectedOrder)}
                      disabled={processingOrderRefund || !refundAmount || !refundReason}
                      className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      {processingOrderRefund ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiDollarSign className="w-4 h-4" />
                          Process Refund
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-900 cursor-default">Order Details</h2>
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

                {/* Order Details Content */}
                <div className="space-y-6">
                  {/* Order Information */}
                  <div className="bg-orange-50 rounded-2xl p-6 cursor-default">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                      <FiShoppingBag className="w-5 h-5" />
                      Order Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">Order ID</label>
                        <p className="text-orange-900 font-mono text-sm">#{selectedOrder.invoiceNumber}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">Status</label>
                        <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${orderStatusColors[selectedOrder.status]}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">Payment Method</label>
                        <p className="text-orange-900 capitalize">{selectedOrder.paymentMethod || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">Payment Status</label>
                        <p className="text-orange-900 capitalize">{selectedOrder.paymentStatus || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amount Information */}
                  <div className="bg-green-50 rounded-2xl p-6 cursor-default">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Amount Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Total Amount</label>
                        <p className="text-green-900 font-semibold text-lg">
                          {formatCurrency(selectedOrder.totalAmount || selectedOrder.finalAmount)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Amount Paid</label>
                        <p className="text-green-900 font-semibold text-lg">
                          {formatCurrency(selectedOrder.amountPaid || selectedOrder.finalAmount)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Refundable Amount</label>
                        <p className="text-green-900 font-semibold text-lg">
                          {formatCurrency(selectedOrder.totalAmount || selectedOrder.finalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-orange-50 rounded-2xl p-6 cursor-default">
                      <h3 className="text-lg font-semibold text-orange-900 mb-4">Timeline</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-orange-600">Order Created:</span>
                          <span className="text-orange-900">{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-orange-600">Last Updated:</span>
                          <span className="text-orange-900">{formatDate(selectedOrder.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-2xl p-6 cursor-default">
                      <h3 className="text-lg font-semibold text-orange-900 mb-4">Cancellation Info</h3>
                      <div className="space-y-2 text-sm">
                        {selectedOrder.cancelledBy && (
                          <div className="flex justify-between">
                            <span className="text-orange-600">Cancelled By:</span>
                            <span className="text-orange-900">{selectedOrder.cancelledBy?.name || 'Customer'}</span>
                          </div>
                        )}
                        {selectedOrder.cancellationReason && (
                          <div className="bg-orange-100 p-3 rounded-lg border border-orange-200">
                            <label className="block text-sm font-medium text-orange-700 mb-1">Cancellation Reason</label>
                            <p className="text-orange-800 text-sm">{selectedOrder.cancellationReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-orange-50 rounded-2xl p-6 cursor-default">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">Name</label>
                        <p className="text-orange-900">{selectedOrder.user?.name || 'Customer'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">Email</label>
                        <p className="text-orange-900 break-all">{selectedOrder.user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">Phone</label>
                        <p className="text-orange-900">{selectedOrder.user?.phone || "N/A"}</p>
                      </div>
                      {selectedOrder.user?.address && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-orange-700 mb-1">Address</label>
                          <p className="text-orange-900">{selectedOrder.user.address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="text-center pt-6">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleOrderSelect(selectedOrder);
                      }}
                      className="bg-orange-600 text-white px-8 py-3 rounded-xl hover:bg-orange-700 transition-all duration-200 font-medium flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      <FiDollarSign className="w-5 h-5" />
                      Process Refund for this Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Details Modal */}
        {showRefundDetailsModal && selectedRefund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-green-900 cursor-default">Refund Details</h2>
                  <button
                    onClick={() => {
                      setShowRefundDetailsModal(false);
                      setSelectedRefund(null);
                    }}
                    className="text-green-500 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 transition-all duration-200 cursor-pointer"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Refund Details Content */}
                <div className="space-y-6">
                  {/* Refund Information */}
                  <div className="bg-green-50 rounded-2xl p-6 cursor-default">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <FiDollarSign className="w-5 h-5" />
                      Refund Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Refund ID</label>
                        <p className="text-green-900 font-mono text-sm">#{selectedRefund.refundId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Status</label>
                        <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${orderStatusColors[selectedRefund.status]}`}>
                          {selectedRefund.status === 'PROCESSED' || selectedRefund.status === 'REFUND_COMPLETED' ? (
                            <FiCheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <FiClock className="w-3 h-3 mr-1" />
                          )}
                          {selectedRefund.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Payment Method</label>
                        <p className="text-green-900 capitalize">{selectedRefund.paymentMethod || 'Payment Gateway'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Refund Method</label>
                        <p className="text-green-900 capitalize">{selectedRefund.refundMethod || 'Automatic'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amount Information */}
                  <div className="bg-blue-50 rounded-2xl p-6 cursor-default">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Amount Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Refund Amount</label>
                        <p className="text-blue-900 font-semibold text-lg">
                          {formatCurrency(selectedRefund.refundAmount)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Order Amount</label>
                        <p className="text-blue-900 font-semibold text-lg">
                          {formatCurrency(selectedRefund.order?.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Refund Percentage</label>
                        <p className="text-blue-900 font-semibold text-lg">
                          {((selectedRefund.refundAmount / (selectedRefund.order?.totalAmount || 1)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-2xl p-6 cursor-default">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">Timeline</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-600">Refund Created:</span>
                          <span className="text-green-900">{formatDate(selectedRefund.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">Refund Processed:</span>
                          <span className="text-green-900">{formatDate(selectedRefund.processedAt || selectedRefund.updatedAt)}</span>
                        </div>
                        {selectedRefund.completedAt && (
                          <div className="flex justify-between">
                            <span className="text-green-600">Refund Completed:</span>
                            <span className="text-green-900">{formatDate(selectedRefund.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-6 cursor-default">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">Refund Info</h3>
                      <div className="space-y-2 text-sm">
                        {selectedRefund.refundReason && (
                          <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                            <label className="block text-sm font-medium text-green-700 mb-1">Refund Reason</label>
                            <p className="text-green-800 text-sm">{selectedRefund.refundReason}</p>
                          </div>
                        )}
                        {selectedRefund.transactionId && (
                          <div className="flex justify-between">
                            <span className="text-green-600">Transaction ID:</span>
                            <span className="text-green-900 font-mono">{selectedRefund.transactionId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-green-50 rounded-2xl p-6 cursor-default">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Name</label>
                        <p className="text-green-900">{selectedRefund.user?.name || 'Customer'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Email</label>
                        <p className="text-green-900 break-all">{selectedRefund.user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Phone</label>
                        <p className="text-green-900">{selectedRefund.user?.phone || "N/A"}</p>
                      </div>
                      {selectedRefund.user?.address && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-green-700 mb-1">Address</label>
                          <p className="text-green-900">{selectedRefund.user.address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="bg-green-50 rounded-2xl p-6 cursor-default">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Order Information</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Order ID</label>
                          <p className="text-green-900 font-mono">#{selectedRefund.order?.invoiceNumber}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Order Status</label>
                          <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${orderStatusColors[selectedRefund.order?.status]}`}>
                            {selectedRefund.order?.status}
                          </span>
                        </div>
                      </div>
                      {selectedRefund.order?.cancellationReason && (
                        <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                          <label className="block text-sm font-medium text-green-700 mb-1">Cancellation Reason</label>
                          <p className="text-green-800 text-sm">{selectedRefund.order.cancellationReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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