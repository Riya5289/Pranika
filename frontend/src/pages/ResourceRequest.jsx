import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospitalAuth } from '../context/HospitalAuthContext';
import {
  searchHospitalsWithResources,
  createResourceRequest,
  getPendingResourceRequests,
  getMyResourceRequests,
  approveResourceRequest,
  rejectResourceRequest,
  completeResourceRequest
} from '../services/api';

export default function ResourceRequest() {
  const navigate = useNavigate();
  const { hospital, loading: authLoading } = useHospitalAuth();
  const [activeTab, setActiveTab] = useState('request');
  const [searchParams, setSearchParams] = useState({
    resourceType: 'icuBeds',
    quantity: 1
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Check if hospital is logged in
  useEffect(() => {
    if (!authLoading && !hospital) {
      navigate('/hospital/login');
    }
  }, [hospital, authLoading, navigate]);

  const resourceOptions = [
    { value: 'icuBeds', label: 'ICU Beds' },
    { value: 'generalBeds', label: 'General Beds' },
    { value: 'ventilators', label: 'Ventilators' },
    { value: 'oxygen', label: 'Oxygen' }
  ];

  const urgencyOptions = ['Low', 'Medium', 'High', 'Critical'];

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await searchHospitalsWithResources({
        ...searchParams,
        excludeHospitalId: hospital.hospitalId
      });
      setSearchResults(res.data.data || []);
      if (!res.data.data || res.data.data.length === 0) {
        setError('No hospitals with available resources found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResource = async (fromHospitalId, formData) => {
    setError('');
    setLoading(true);

    try {
      await createResourceRequest({
        requestedFromHospitalId: fromHospitalId,
        resourceType: searchParams.resourceType,
        quantity: parseInt(searchParams.quantity),
        urgency: formData.urgency || 'Medium',
        reason: formData.reason,
        expectedDeliveryDate: formData.expectedDeliveryDate
      });

      setSuccess('Resource request sent successfully!');
      setSearchResults([]);
      setSearchParams({ resourceType: 'icuBeds', quantity: 1 });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await getPendingResourceRequests();
      setPendingRequests(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  const loadMyRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await getMyResourceRequests();
      setMyRequests(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId, approvedQty) => {
    setLoading(true);
    try {
      await approveResourceRequest(requestId, { approvedQuantity: approvedQty });
      setSuccess('Request approved successfully!');
      loadPendingRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    setLoading(true);
    try {
      await rejectResourceRequest(requestId, { rejectionReason: reason });
      setSuccess('Request rejected successfully!');
      loadPendingRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRequest = async (requestId) => {
    setLoading(true);
    try {
      await completeResourceRequest(requestId);
      setSuccess('Request marked as completed!');
      loadMyRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') loadPendingRequests();
    if (activeTab === 'my-requests') loadMyRequests();
  }, [activeTab]);

  const RequestForm = ({ hospital: targetHospital, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
      urgency: 'Medium',
      reason: '',
      expectedDeliveryDate: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(targetHospital.hospitalId._id, formData);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div>
          <label className="font-monda text-sm font-bold text-gray-700">Urgency</label>
          <select
            value={formData.urgency}
            onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            className="input-field"
          >
            {urgencyOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-monda text-sm font-bold text-gray-700">Reason</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Why do you need these resources?"
            className="input-field resize-none"
            rows="3"
          />
        </div>

        <div>
          <label className="font-monda text-sm font-bold text-gray-700">Expected Delivery Date</label>
          <input
            type="date"
            value={formData.expectedDeliveryDate}
            onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg py-2 font-monda font-bold text-white bg-[#EB5E28] hover:bg-[#D94A1F] disabled:opacity-60 transition-all"
        >
          {isLoading ? 'Sending Request...' : 'Send Request'}
        </button>
      </form>
    );
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-[#EFA7A7] border-t-[#EB5E28] rounded-full animate-spin" />
      </div>
    );
  }

  if (!hospital) {
    return null;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <h1 className="text-[36px] leading-tight mb-8" style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}>
        Hospital Resource Sharing
      </h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-monda text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-monda text-sm">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('request')}
          className={`pb-3 font-monda font-bold transition-colors ${
            activeTab === 'request'
              ? 'text-[#EB5E28] border-b-2 border-[#EB5E28]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Request Resources
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 font-monda font-bold transition-colors ${
            activeTab === 'pending'
              ? 'text-[#EB5E28] border-b-2 border-[#EB5E28]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Requests from Others ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`pb-3 font-monda font-bold transition-colors ${
            activeTab === 'my-requests'
              ? 'text-[#EB5E28] border-b-2 border-[#EB5E28]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Requests ({myRequests.length})
        </button>
      </div>

      {/* Request Resources Tab */}
      {activeTab === 'request' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 card p-6">
            <h3 className="font-monda font-bold text-gray-800 mb-4">Search Resources</h3>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="font-monda text-sm font-bold text-gray-700">Resource Type</label>
                <select
                  value={searchParams.resourceType}
                  onChange={(e) => setSearchParams({ ...searchParams, resourceType: e.target.value })}
                  className="input-field"
                >
                  {resourceOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-monda text-sm font-bold text-gray-700">Quantity Needed</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={searchParams.quantity}
                  onChange={(e) => setSearchParams({ ...searchParams, quantity: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-2 font-monda font-bold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #EB5E28 0%, #EFA7A7 100%)' }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {searchResults.length > 0 && (
              <>
                <h3 className="font-monda font-bold text-gray-800">Available Hospitals</h3>
                {searchResults.map((result) => (
                  <div key={result.hospitalId._id} className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-roboto font-bold text-gray-800">{result.hospitalId.name}</h4>
                        <p className="font-monda text-sm text-gray-500">{result.hospitalId.address}</p>
                        {result.distance && (
                          <p className="font-monda text-sm text-[#EB5E28] mt-1">{result.distance.toFixed(1)} km away</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-monda font-bold text-lg text-green-600">
                          {searchParams.resourceType === 'oxygen'
                            ? result.oxygen
                            : result[searchParams.resourceType]?.available || 0}
                        </p>
                        <p className="font-monda text-xs text-gray-500">Available</p>
                      </div>
                    </div>

                    {searchParams.resourceType !== 'oxygen' && (
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#EB5E28] h-full"
                            style={{
                              width: `${(result[searchParams.resourceType]?.available / result[searchParams.resourceType]?.total) * 100}%`
                            }}
                          />
                        </div>
                        <p className="font-monda text-xs text-gray-500 mt-2">
                          {result[searchParams.resourceType]?.available} of {result[searchParams.resourceType]?.total}
                        </p>
                      </div>
                    )}

                    <RequestForm
                      hospital={result}
                      onSubmit={handleRequestResource}
                      isLoading={loading}
                    />
                  </div>
                ))}
              </>
            )}
            {searchResults.length === 0 && !loading && (
              <div className="text-center py-12 card">
                <p className="font-monda text-gray-500">Click "Search" to find available resources</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {requestsLoading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-[#EFA7A7] border-t-[#EB5E28] rounded-full animate-spin mx-auto" />
            </div>
          ) : pendingRequests.length > 0 ? (
            pendingRequests.map(req => (
              <div key={req._id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-roboto font-bold text-gray-800">{req.requestingHospitalId.name}</h4>
                    <p className="font-monda text-sm text-gray-500">{req.requestingHospitalId.address}</p>
                  </div>
                  <span className={`font-monda text-xs font-bold px-3 py-1 rounded-full ${
                    req.urgency === 'Critical' ? 'bg-red-100 text-red-700' :
                    req.urgency === 'High' ? 'bg-orange-100 text-orange-700' :
                    req.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {req.urgency}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-monda text-xs text-gray-500 uppercase">Resource Type</p>
                    <p className="font-monda font-bold text-gray-800">{req.resourceType}</p>
                  </div>
                  <div>
                    <p className="font-monda text-xs text-gray-500 uppercase">Quantity</p>
                    <p className="font-monda font-bold text-gray-800">{req.quantity}</p>
                  </div>
                </div>

                {req.reason && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="font-monda text-sm text-gray-600">{req.reason}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproveRequest(req._id, req.quantity)}
                    disabled={loading}
                    className="flex-1 rounded-lg py-2 font-monda font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 transition-all"
                  >
                    {loading ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) handleRejectRequest(req._id, reason);
                    }}
                    disabled={loading}
                    className="flex-1 rounded-lg py-2 font-monda font-bold text-red-600 border-2 border-red-600 hover:bg-red-50 disabled:opacity-60 transition-all"
                  >
                    {loading ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 card">
              <p className="font-monda text-gray-500">No pending requests from other hospitals</p>
            </div>
          )}
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === 'my-requests' && (
        <div className="space-y-4">
          {requestsLoading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-[#EFA7A7] border-t-[#EB5E28] rounded-full animate-spin mx-auto" />
            </div>
          ) : myRequests.length > 0 ? (
            myRequests.map(req => (
              <div key={req._id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-roboto font-bold text-gray-800">{req.requestedFromHospitalId.name}</h4>
                    <p className="font-monda text-sm text-gray-500">{req.requestedFromHospitalId.address}</p>
                  </div>
                  <span className={`font-monda text-xs font-bold px-3 py-1 rounded-full ${
                    req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    req.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="font-monda text-xs text-gray-500 uppercase">Resource</p>
                    <p className="font-monda font-bold text-gray-800">{req.resourceType}</p>
                  </div>
                  <div>
                    <p className="font-monda text-xs text-gray-500 uppercase">Requested</p>
                    <p className="font-monda font-bold text-gray-800">{req.quantity}</p>
                  </div>
                  <div>
                    <p className="font-monda text-xs text-gray-500 uppercase">Approved</p>
                    <p className="font-monda font-bold text-gray-800">{req.approvedQuantity || '-'}</p>
                  </div>
                </div>

                {req.status === 'Rejected' && req.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-monda text-xs text-red-600 uppercase font-bold mb-1">Rejection Reason</p>
                    <p className="font-monda text-sm text-red-700">{req.rejectionReason}</p>
                  </div>
                )}

                {req.status === 'Approved' && req.status !== 'Completed' && (
                  <button
                    onClick={() => handleCompleteRequest(req._id)}
                    disabled={loading}
                    className="w-full mt-4 rounded-lg py-2 font-monda font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all"
                  >
                    {loading ? 'Processing...' : 'Mark as Completed'}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 card">
              <p className="font-monda text-gray-500">You haven't made any requests yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
