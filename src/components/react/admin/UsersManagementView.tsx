import React, { useState, useEffect, useCallback } from "react";
import type { PricingPlan, User, PaymentTransaction } from "@/domain/entities";

import { useTranslate } from "@/infrastructure/i18n/context";
import type { AvailableLanguages } from "@/infrastructure/i18n/locales";
import { Modal } from "../shared/Modals";
import { Icon } from "../shared/Icon";

interface UserWithSubscription extends User {
  subscription: {
    id: number;
    plan_name: string;
    plan_slug: string;
    status: string;
  } | null;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsersManagementViewProps {
  availablePlans: PricingPlan[];
  initialLocale?: AvailableLanguages;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  availablePlans,
  initialLocale,
}) => {
  const t = useTranslate(initialLocale);
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Payment states
  const [selectedUserForPayments, setSelectedUserForPayments] = useState<UserWithSubscription | null>(null);
  const [userPayments, setUserPayments] = useState<PaymentTransaction[]>([]);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/users?page=${pagination.page}&limit=${pagination.limit}&search=${encodeURIComponent(debouncedSearch)}`
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      setMessage({ text: "Error loading users", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAssignPlan = async (userId: number, planSlug: string) => {
    if (!planSlug) return;
    
    setActionLoading(userId);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign plan");
      }

      setMessage({ text: "Plan assigned successfully", type: "success" });
      await fetchUsers(); // Refresh data
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewPayments = async (user: UserWithSubscription) => {
    setSelectedUserForPayments(user);
    setUserPayments([]);
    setIsPaymentsModalOpen(true);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/payments`);
      if (!response.ok) throw new Error("Failed to fetch payments");
      const data = await response.json();
      setUserPayments(data.payments);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPayments = async () => {
    if (!selectedUserForPayments) return;
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUserForPayments.id}/payments`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to sync payments");
      const data = await response.json();
      setUserPayments(data.payments);
      // Refresh user list in case subscription status changed
      await fetchUsers();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white">{t("admin.usersTitle")}</h1>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder={t("admin.searchPlaceholder")}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex-shrink-0 ${message.type === "success" ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-800">
              <tr className="text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium border-b border-slate-700">{t("admin.tableId")}</th>
                <th className="px-6 py-4 font-medium border-b border-slate-700">{t("admin.tableUser")}</th>
                <th className="px-6 py-4 font-medium border-b border-slate-700">{t("admin.tableEmail")}</th>
                <th className="px-6 py-4 font-medium border-b border-slate-700">{t("admin.tableSubscription")}</th>
                <th className="px-6 py-4 font-medium border-b border-slate-700">{t("admin.tableActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    {t("admin.noUsersFound")}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-400 text-sm">{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.username}</div>
                      <div className="text-xs text-slate-500">Created: {new Date(user.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.subscription ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400 border border-blue-800 w-fit">
                            {user.subscription.plan_name}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">
                            Status: {user.subscription.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm italic">{t("admin.noSubscription")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewPayments(user)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded hover:bg-slate-700 hover:text-white transition-all group"
                          title={t("admin.tablePayments")}
                        >
                          <Icon name="CreditCard" size={14} className="group-hover:text-cyan-400" />
                          <span>{t("admin.tablePayments")}</span>
                        </button>

                        <select
                          className="bg-slate-800 border border-slate-700 text-white text-xs rounded py-1 px-2 focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50"
                          defaultValue=""
                          disabled={actionLoading === user.id}
                          onChange={(e) => handleAssignPlan(user.id, e.target.value)}
                        >
                          <option value="" disabled>{t("admin.changePlan")}</option>
                          {availablePlans.map((plan) => (
                            <option key={plan.id} value={plan.slug}>
                              {plan.name} {user.subscription?.plan_slug === plan.slug ? t("admin.planCurrent") : ""}
                            </option>
                          ))}
                          {user.subscription && (
                            <option value="none">— Remove Subscription —</option>
                          )}
                        </select>
                        {actionLoading === user.id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer - Fixed at bottom of table container */}
        <div className="px-6 py-4 bg-slate-800 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-slate-500">
            {t("admin.showingUsers")
              .replace("{start}", String((pagination.page - 1) * pagination.limit + 1))
              .replace("{end}", String(Math.min(pagination.page * pagination.limit, pagination.total)))
              .replace("{total}", String(pagination.total))}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-slate-800 border border-slate-700 text-white rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              {t("admin.prev")}
            </button>
            <div className="flex items-center px-3 text-sm text-slate-400">
              {t("admin.pageOf")
                .replace("{current}", String(pagination.page))
                .replace("{total}", String(pagination.totalPages))}
            </div>
            <button
              className="px-3 py-1 bg-slate-800 border border-slate-700 text-white rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              {t("admin.next")}
            </button>
          </div>
        </div>
      </div>

      {/* Payment History Modal */}
      <Modal
        id="payment-history-modal"
        isOpen={isPaymentsModalOpen}
        onClose={() => setIsPaymentsModalOpen(false)}
        title={t("admin.paymentsTitle")}
        initialLocale={initialLocale}
      >
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="text-slate-500">{t("admin.tableUser")}: </span>
              <span className="text-white font-bold">{selectedUserForPayments?.username}</span>
            </div>
            <button
              onClick={handleSyncPayments}
              disabled={isSyncing || userPayments.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSyncing ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-cyan-400"></div>
              ) : (
                <Icon name="RefreshCw" size={14} />
              )}
              {t("admin.syncPayments")}
            </button>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] bg-white/5">
                  <th className="px-4 py-3 font-bold">{t("admin.paymentDate")}</th>
                  <th className="px-4 py-3 font-bold">{t("admin.paymentAmount")}</th>
                  <th className="px-4 py-3 font-bold">{t("admin.paymentStatus")}</th>
                  <th className="px-4 py-3 font-bold">{t("admin.paymentReference")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {userPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                      {loading ? t("common.loading") : t("admin.noPayments")}
                    </td>
                  </tr>
                ) : (
                  userPayments.map((payment) => (
                    <tr key={payment.id} className="text-xs hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(payment.created_at || "").toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-white font-mono">
                        {payment.amount} {payment.currency}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${
                          payment.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          payment.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          payment.status === 'DECLINED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">
                        {payment.reference}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};
