import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransferById } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function TransferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransfer = async () => {
      try {
        const res = await getTransferById(id);
        setTransfer(res.data.data);
      } catch (err) {
        setError('Failed to load transfer details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTransfer();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="card p-8 animate-pulse">
          <div className="h-8 bg-gray-100 rounded mb-6 w-1/3" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6"/>
              <path d="m9 9 6 6"/>
            </svg>
          </div>
          <h2 className="text-[24px] font-bold text-gray-800 mb-2">Transfer Not Found</h2>
          <p className="font-monda text-gray-500 mb-6">{error || 'The transfer request could not be found.'}</p>
          <button onClick={() => navigate('/transfer')} className="btn-filled">
            Back to Transfers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 page-enter">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/transfer')}
          className="flex items-center gap-2 font-monda text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Transfers
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-[48px] leading-none tracking-wide"
              style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}
            >
              Transfer Details
            </h1>
            <p className="font-monda text-gray-500 mt-1">
              Patient: {transfer.patientInfo?.name} · ID: {transfer._id.slice(-8)}
            </p>
          </div>
          <StatusBadge status={transfer.status?.toLowerCase()} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <div className="card p-6">
            <h2 className="text-[24px] mb-5" style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}>
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="font-monda text-sm text-gray-400 block">Name</span>
                <span className="font-roboto font-bold text-gray-800">{transfer.patientInfo?.name}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="font-monda text-sm text-gray-400 block">Age</span>
                <span className="font-roboto font-bold text-gray-800">{transfer.patientInfo?.age} years</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="font-monda text-sm text-gray-400 block">Condition</span>
                <span className="font-roboto font-bold text-gray-800">{transfer.patientInfo?.condition}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="font-monda text-sm text-gray-400 block">Medical History</span>
                <span className="font-roboto font-bold text-gray-800">{transfer.patientInfo?.medicalHistory || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="card p-6">
            <h2 className="text-[24px] mb-5" style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}>
              Transfer Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-monda text-sm text-gray-500">From Hospital</span>
                <span className="font-roboto font-bold text-gray-800">{transfer.fromHospitalId?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-monda text-sm text-gray-500">To Hospital</span>
                <span className="font-roboto font-bold text-gray-800">{transfer.toHospitalId?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-monda text-sm text-gray-500">Requested By</span>
                <span className="font-roboto font-bold text-gray-800">{transfer.requestedBy?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-monda text-sm text-gray-500">Created</span>
                <span className="font-roboto font-bold text-gray-800">
                  {new Date(transfer.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {transfer.estimatedETA && (
                <div className="flex items-center justify-between">
                  <span className="font-monda text-sm text-gray-500">Estimated ETA</span>
                  <span className="font-roboto font-bold text-[#EB5E28]">{transfer.estimatedETA}</span>
                </div>
              )}
            </div>
          </div>

          {/* Medical Notes */}
          {transfer.medicalNotes && (
            <div className="card p-6">
              <h2 className="text-[24px] mb-5" style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}>
                Medical Notes
              </h2>
              <p className="font-monda text-gray-700 leading-relaxed">{transfer.medicalNotes}</p>
            </div>
          )}

          {/* Notes */}
          {transfer.notes && (
            <div className="card p-6">
              <h2 className="text-[24px] mb-5" style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}>
                Additional Notes
              </h2>
              <p className="font-monda text-gray-700 leading-relaxed">{transfer.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card p-6">
            <h3 className="font-roboto font-bold text-gray-800 mb-4">Status</h3>
            <div className="flex items-center justify-center">
              <StatusBadge status={transfer.status?.toLowerCase()} size="large" />
            </div>
          </div>

          {/* Attachments */}
          {transfer.attachments && transfer.attachments.length > 0 && (
            <div className="card p-6">
              <h3 className="font-roboto font-bold text-gray-800 mb-4">Attachments</h3>
              <div className="space-y-3">
                {transfer.attachments.map((att, index) => (
                  <a
                    key={index}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EB5E28]/10 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EB5E28" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-monda text-sm font-bold text-gray-800 truncate">{att.filename}</p>
                      <p className="font-monda text-xs text-gray-400">{(att.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15,3 21,3 21,9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Hospital Contacts */}
          <div className="card p-6">
            <h3 className="font-roboto font-bold text-gray-800 mb-4">Hospital Contacts</h3>
            <div className="space-y-4">
              <div>
                <p className="font-monda text-xs text-gray-400 mb-1">From Hospital</p>
                <p className="font-roboto font-bold text-gray-800 text-sm">{transfer.fromHospitalId?.name}</p>
                <p className="font-monda text-xs text-gray-500">{transfer.fromHospitalId?.contact?.email}</p>
              </div>
              <div>
                <p className="font-monda text-xs text-gray-400 mb-1">To Hospital</p>
                <p className="font-roboto font-bold text-gray-800 text-sm">{transfer.toHospitalId?.name}</p>
                <p className="font-monda text-xs text-gray-500">{transfer.toHospitalId?.contact?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}