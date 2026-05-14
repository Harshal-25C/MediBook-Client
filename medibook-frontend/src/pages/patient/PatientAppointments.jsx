import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientSidebar, Topbar, StatusBadge, Loader } from '../../components/Layout';
import { appointmentAPI, reviewAPI, paymentAPI, notifAPI, slotAPI, getUser, formatDate, formatTime, providerAPI } from '../../utils/api';

// Helper to get doctor name from various field names
const getDoctorName = (provider) => {
  if (!provider) return 'Doctor';
  if (provider.fullName && !provider.fullName.includes('Provider')) return provider.fullName;
  if (provider.name && !provider.name.includes('Provider')) return provider.name;
  if (provider.firstName && !provider.firstName.includes('Provider')) return provider.firstName;
  if (provider.doctorName && !provider.doctorName.includes('Provider')) return provider.doctorName;
  return 'Doctor';
};

function ReviewModal({ appointment, onClose, onSubmit }) {
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    try {
      const user = getUser();
      await reviewAPI.submit({
        appointmentId: appointment.appointmentId,
        patientId: user.userId,
        providerId: appointment.providerId,
        rating: form.rating,
        comment: form.comment,
        anonymous: false 
      });
      onSubmit();
    } catch (e) {
      alert(e.response?.data?.message || 'Already reviewed or error occurred.');
    } finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Rate Your Experience</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
            How was your appointment #{appointment.appointmentId}?
          </p>
          <div className="form-group">
            <label className="form-label">Rating</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setForm(p => ({ ...p, rating: n }))}
                  style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', opacity: n <= form.rating ? 1 : 0.3 }}>★</button>
              ))}
            </div>
          </div>
          <div className="form-group mt-4">
            <label className="form-label">Comment (optional)</label>
            <textarea className="form-textarea" placeholder="Share your experience..."
              value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RescheduleModal({ appointment, onClose, onDone }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    slotAPI.getAvailable(appointment.providerId, selectedDate)
      .then(r => setSlots(r.data || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate]);

  const submit = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      await appointmentAPI.reschedule(appointment.appointmentId, {
        newSlotId: String(selectedSlot.slotId),
        newDate: selectedDate,
        newStartTime: selectedSlot.startTime,
        newEndTime: selectedSlot.endTime,
      });
      onDone();
    } catch (e) { alert(e.response?.data?.message || 'Reschedule failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Reschedule Appointment #{appointment.appointmentId}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="alert alert-info" style={{ fontSize: 13 }}>
            Current: {formatDate(appointment.appointmentDate)} at {formatTime(appointment.startTime)}
          </div>
          <div className="form-group">
            <label className="form-label">New Date</label>
            <input className="form-input" type="date" min={minDate}
              value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>

          {selectedDate && (
            <div className="form-group">
              <label className="form-label">Select New Time Slot</label>
              {slotsLoading ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading slots...</p>
              ) : slots.length === 0 ? (
                <div className="alert alert-warning" style={{ fontSize: 13 }}>
                  No available slots for this date. Try another date.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                  {slots.map(s => (
                    <button key={s.slotId}
                      disabled={s.isBooked}
                      onClick={() => setSelectedSlot(s)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 8,
                        border: s.isBooked ? '2px solid #ccc'
                          : selectedSlot?.slotId === s.slotId ? '2px solid var(--primary)'
                          : '2px solid var(--secondary)',
                        background: s.isBooked ? '#f5f5f5'
                          : selectedSlot?.slotId === s.slotId ? 'var(--primary)'
                          : 'var(--secondary)',
                        color: s.isBooked ? '#999' : '#fff',
                        cursor: s.isBooked ? 'not-allowed' : 'pointer',
                        fontWeight: 700, fontSize: 12,
                        opacity: s.isBooked ? 0.5 : 1,
                      }}>
                      {formatTime(s.startTime)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}
            disabled={loading || !selectedSlot}>
            {loading ? <span className="spinner" /> : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientAppointments() {
  const user = getUser();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [reviewAppt, setReviewAppt] = useState(null);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getByPatient(user.userId);
      const appts = res.data || [];
      setAppointments(appts);

      // Fetch provider details for all unique provider IDs
      const uniqueProviderIds = [...new Set(appts.map(a => a.providerId))];
      const providerMap = {};
      for (const providerId of uniqueProviderIds) {
        try {
          const provRes = await providerAPI.getById(providerId);
          providerMap[providerId] = provRes.data;
        } catch (err) {
          console.warn(`Failed to fetch provider ${providerId}`);
          providerMap[providerId] = { providerId, fullName: `Doctor #${providerId}` };
        }
      }
      setProviders(providerMap);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment? If you paid online, a refund will be initiated automatically.')) return;
    setActionLoading(id);
    try {
      // Step 1: Cancel the appointment
      await appointmentAPI.cancel(id);

      // Find the appointment in local state to get patientId and providerId
      const appt = appointments.find(a => a.appointmentId === id);

      // Notify patient via APP (bell) and EMAIL
      notifAPI.send({
        recipientId: user.userId,
        type: 'CANCELLATION',
        title: 'Appointment Cancelled',
        message: `Your appointment #${id} scheduled for ${appt?.appointmentDate || ''} has been cancelled successfully.`,
        channel: 'APP',
        relatedId: id,
        relatedType: 'APPOINTMENT'
      }).catch(() => {});

      notifAPI.send({
        recipientId: user.userId,
        type: 'CANCELLATION',
        title: 'Appointment Cancelled - MediBook',
        message: `Your appointment #${id} scheduled for ${appt?.appointmentDate || ''} has been cancelled. If you need to reschedule, please visit MediBook.`,
        channel: 'EMAIL',
        email: user.email,
        relatedId: id,
        relatedType: 'APPOINTMENT'
      }).catch(() => {});

      // Notify provider via APP (bell) — need their userId from provider table
      if (appt?.providerId) {
        providerAPI.getById(appt.providerId).then(r => {
          const providerUserId = r.data.userId;
          if (providerUserId) {
            notifAPI.send({
              recipientId: providerUserId,
              type: 'CANCELLATION',
              title: 'Appointment Cancelled by Patient',
              message: `An appointment #${id} scheduled for ${appt?.appointmentDate || ''} has been cancelled by the patient.`,
              channel: 'APP',
              relatedId: id,
              relatedType: 'APPOINTMENT'
            }).catch(() => {});
          }
        }).catch(() => {});
      }

      // Step 2: Find if there's a payment for this appointment and refund it
      try {
        const payRes = await paymentAPI.getByAppointment(id);
        const payment = payRes.data;
        if (payment && payment.paymentId && payment.status === 'SUCCESS') {
          await paymentAPI.refund(payment.paymentId);
          alert('✅ Appointment cancelled and refund initiated! Amount will be credited in 5-7 business days.');
        } else {
          alert('✅ Appointment cancelled successfully.');
        }
      } catch (refundErr) {
        // Appointment was cancelled but refund lookup failed
        alert('✅ Appointment cancelled. If you paid online, please contact support for refund.');
      }

      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Cancel failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = tab === 'all' ? appointments
    : tab === 'SCHEDULED'
      ? appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'PENDING_PAYMENT')
      : appointments.filter(a => a.status === tab);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'SCHEDULED', label: 'Upcoming' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      <div className="dashboard-main">
        <Topbar title="My Appointments" />
        <div className="page-content fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <p className="page-title">My Appointments</p>
              <p className="page-subtitle">{appointments.length} total appointments</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/find-doctors')}>+ Book New</button>
          </div>

          <div className="tabs">
            {tabs.map(t => (
              <div key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label} {tab === t.key && `(${filtered.length})`}
              </div>
            ))}
          </div>

          {loading ? <Loader /> : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-title">No appointments found</div>
              <button className="btn btn-primary mt-2" onClick={() => navigate('/find-doctors')}>Find a Doctor</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(a => {
                const d = new Date(a.appointmentDate);
                return (
                  <div key={a.appointmentId} className="card">
                    <div style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div className="appt-date-box">
                        <div className="appt-day">{d.getDate()}</div>
                        <div className="appt-month">{d.toLocaleString('en', { month: 'short' })}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>Appointment #{a.appointmentId}</span>
                          <StatusBadge status={a.status} />
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, marginBottom: 6 }}>
                          👨‍⚕️ {getDoctorName(providers[a.providerId])}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span>⏰ {formatTime(a.startTime)} – {formatTime(a.endTime)}</span>
                          <span>📍 {a.modeOfConsultation}</span>
                          <span>🩺 {a.serviceType}</span>
                        </div>
                        {a.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Note: {a.notes}</div>}
                      </div>
                      <div className="appt-actions">
                        {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'PENDING_PAYMENT') && (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={() => setRescheduleAppt(a)}>Reschedule</button>
                            <button className="btn btn-danger btn-sm" disabled={actionLoading === a.appointmentId}
                              onClick={() => cancel(a.appointmentId)}>
                              {actionLoading === a.appointmentId ? <span className="spinner" /> : 'Cancel'}
                            </button>
                          </>
                        )}
                        {a.status === 'COMPLETED' && (
                          <button className="btn btn-outline btn-sm" onClick={() => setReviewAppt(a)}>
                            ⭐ Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {reviewAppt && (
        <ReviewModal appointment={reviewAppt} onClose={() => setReviewAppt(null)}
          onSubmit={() => { setReviewAppt(null); alert('Review submitted!'); load();}} />
      )}
      {rescheduleAppt && (
        <RescheduleModal appointment={rescheduleAppt} onClose={() => setRescheduleAppt(null)}
          onDone={() => { setRescheduleAppt(null); load(); }} />
      )}
    </div>
  );
}
