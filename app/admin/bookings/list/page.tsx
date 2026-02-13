'use client';

import { useState, useEffect } from 'react';
import { Booking } from '@/lib/booking/types';

export default function AdminBookingsListPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'pending'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/bookings/list');
      const data = await res.json() as { success?: boolean; bookings?: Booking[]; error?: string };

      if (data.success && data.bookings) {
        setBookings(data.bookings);
      } else {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30',
      pending: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30',
      cancelled: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      consultation: 'bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/30',
      assessment: 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30',
    };

    const labels = {
      consultation: 'Consultation',
      assessment: 'Assessment',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${styles[type as keyof typeof styles] || styles.consultation}`}>
        {labels[type as keyof typeof labels] || type}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                All Bookings
              </h1>
              <p className="text-white/60">
                View and manage all booking records
              </p>
            </div>
            <a
              href="/admin/bookings"
              className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-medium rounded-lg transition-colors"
            >
              Create New Booking
            </a>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-[#0EA5E9] text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'all' && ` (${bookings.length})`}
                {status !== 'all' && ` (${bookings.filter(b => b.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-lg text-[#EF4444]">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="glass p-12 text-center">
            <div className="w-12 h-12 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading bookings...</p>
          </div>
        )}

        {/* Bookings Table */}
        {!loading && (
          <div className="glass overflow-hidden">
            {filteredBookings.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-white/60">No bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Date & Time</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Guest</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking, idx) => (
                      <tr
                        key={booking.id}
                        className={`${
                          idx !== filteredBookings.length - 1 ? 'border-b border-white/5' : ''
                        } hover:bg-white/5 transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm text-white font-medium">
                            {formatDate(booking.booking_date)}
                          </div>
                          <div className="text-xs text-white/60">
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </div>
                          <div className="text-xs text-white/40 mt-1">
                            {booking.timezone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white font-medium">
                            {booking.guest_name}
                          </div>
                          <div className="text-xs text-white/60">
                            {booking.guest_email}
                          </div>
                          {booking.guest_phone && (
                            <div className="text-xs text-white/40">
                              {booking.guest_phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {booking.company_name ? (
                            <>
                              <div className="text-sm text-white">
                                {booking.company_name}
                              </div>
                              {booking.industry && (
                                <div className="text-xs text-white/60">
                                  {booking.industry}
                                </div>
                              )}
                              {booking.employee_count && (
                                <div className="text-xs text-white/40">
                                  {booking.employee_count} employees
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-white/40">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getTypeBadge(booking.booking_type)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <a
                              href={`mailto:${booking.guest_email}`}
                              className="text-xs text-[#0EA5E9] hover:underline"
                            >
                              Email
                            </a>
                            {booking.meeting_link && (
                              <a
                                href={booking.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#0EA5E9] hover:underline"
                              >
                                Meeting Link
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && bookings.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass p-4">
              <div className="text-2xl font-bold text-white">{bookings.length}</div>
              <div className="text-sm text-white/60">Total Bookings</div>
            </div>
            <div className="glass p-4">
              <div className="text-2xl font-bold text-[#22C55E]">
                {bookings.filter(b => b.status === 'confirmed').length}
              </div>
              <div className="text-sm text-white/60">Confirmed</div>
            </div>
            <div className="glass p-4">
              <div className="text-2xl font-bold text-[#F59E0B]">
                {bookings.filter(b => b.status === 'pending').length}
              </div>
              <div className="text-sm text-white/60">Pending</div>
            </div>
            <div className="glass p-4">
              <div className="text-2xl font-bold text-[#EF4444]">
                {bookings.filter(b => b.status === 'cancelled').length}
              </div>
              <div className="text-sm text-white/60">Cancelled</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
