import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addPatient,
  getHospitalPatients,
  updatePatient,
} from '../services/api';

export default function PatientManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchStatus, setSearchStatus] = useState('admitted');
  const [editingPatient, setEditingPatient] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    medicalCondition: '',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'admitted',
    notes: '',
  });

  // Load patients on mount and when status filter changes
  useEffect(() => {
    loadPatients();
  }, [searchStatus]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getHospitalPatients({ status: searchStatus });
      setPatients(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.medicalCondition) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await addPatient({
        ...formData,
        age: parseInt(formData.age),
      });
      
      setSuccess('Patient added successfully!');
      setFormData({
        name: '',
        age: '',
        gender: '',
        medicalCondition: '',
        admissionDate: new Date().toISOString().split('T')[0],
        status: 'admitted',
        notes: '',
      });
      
      setTimeout(() => {
        setSuccess('');
        setActiveTab('list');
        loadPatients();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    if (!editingPatient) return;

    try {
      setLoading(true);
      setError('');
      
      await updatePatient(editingPatient._id, {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        medicalCondition: formData.medicalCondition,
        status: formData.status,
        notes: formData.notes,
      });
      
      setSuccess('Patient updated successfully!');
      setEditingPatient(null);
      
      setTimeout(() => {
        setSuccess('');
        loadPatients();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update patient');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      medicalCondition: patient.medicalCondition,
      admissionDate: patient.admissionDate.split('T')[0],
      status: patient.status,
      notes: patient.notes || '',
    });
    setActiveTab('edit');
  };

  const handleCancelEdit = () => {
    setEditingPatient(null);
    setFormData({
      name: '',
      age: '',
      gender: '',
      medicalCondition: '',
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'admitted',
      notes: '',
    });
    setActiveTab('list');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted':
        return 'text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm';
      case 'ready-for-transfer':
        return 'text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm';
      case 'transferred':
        return 'text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm';
      default:
        return 'text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Patient Management</h1>
            <p className="text-gray-600 mt-1">Add and manage admitted patients</p>
          </div>
          <button
            onClick={() => navigate('/hospital-dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'list'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Patient List
          </button>
          <button
            onClick={() => {
              setEditingPatient(null);
              setFormData({
                name: '',
                age: '',
                gender: '',
                medicalCondition: '',
                admissionDate: new Date().toISOString().split('T')[0],
                status: 'admitted',
                notes: '',
              });
              setActiveTab('add');
            }}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'add'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Add Patient
          </button>
        </div>

        {/* Patient List Tab */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Filter */}
            <div className="mb-6 flex gap-4">
              <select
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admitted">Admitted</option>
                <option value="ready-for-transfer">Ready for Transfer</option>
                <option value="transferred">Transferred</option>
                <option value="">All Status</option>
              </select>
            </div>

            {/* Patients Table */}
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No patients found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Age/Gender</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Condition</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Admission Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{patient.name}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {patient.age} yrs / {patient.gender}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{patient.medicalCondition}</td>
                        <td className="px-4 py-3">
                          <span className={getStatusColor(patient.status)}>
                            {patient.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(patient.admissionDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEditClick(patient)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Patient Tab */}
        {(activeTab === 'add' || activeTab === 'edit') && (
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingPatient ? 'Edit Patient' : 'Add New Patient'}
            </h2>

            <form onSubmit={editingPatient ? handleUpdatePatient : handleAddPatient}>
              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient name"
                  required
                />
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Age"
                    min="0"
                    max="150"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Medical Condition */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medical Condition *
                </label>
                <input
                  type="text"
                  value={formData.medicalCondition}
                  onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Cardiac Issue, Orthopedic Injury"
                  required
                />
              </div>

              {/* Admission Date */}
              {!editingPatient && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admission Date
                  </label>
                  <input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admitted">Admitted</option>
                  <option value="ready-for-transfer">Ready for Transfer</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about the patient"
                  rows="4"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                >
                  {loading ? 'Processing...' : editingPatient ? 'Update Patient' : 'Add Patient'}
                </button>
                <button
                  type="button"
                  onClick={editingPatient ? handleCancelEdit : () => setActiveTab('list')}
                  className="flex-1 px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
