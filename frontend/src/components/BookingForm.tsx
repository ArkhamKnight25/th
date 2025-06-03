import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../services/api';
import ReCaptcha, { ReCaptchaRef } from './ReCaptcha';
import CalendarActions from './CalendarActions'; // Add this import

interface Doctor {
  id: number;
  name: string;
  specialisation: string;
}

interface Booking {
  id: number;
  appointment_time: string;
  address: string;
  test_type: string;
  doctor_id: number | null;
  Doctors?: {
    id: number;
    name: string;
    specialisation: string;
  } | null;
}

const PatientDashboard = () => {
  const { userName, logout } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const navigate = useNavigate();

  // Set the display name from localStorage or context
  useEffect(() => {
    // First try to get the name from localStorage directly
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setDisplayName(storedName);
    }
    // Then update from context if/when it becomes available
    if (userName) {
      setDisplayName(userName);
    }
  }, [userName]); // Re-run when userName from context changes

  // Fetch user's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      setLoadingBookings(true);
      try {
        // Fetch bookings from API
        const response = await fetch(`${API_URL}/bookings/user/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await response.json();
        console.log("User bookings:", data);
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, []);

  // Navigate to booking page
  const handleBookAppointment = () => {
    navigate('/booking');
  };

  // Format date for display
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {displayName || 'Patient'}</span>
            <button 
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Add Book Appointment Button */}
        <div className="mb-6 text-center">
          <button
            onClick={handleBookAppointment}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
          >
            Book New Appointment
          </button>
        </div>
        
        {/* Bookings Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
          {loadingBookings ? (
            <div className="flex justify-center p-4">
              <p>Loading your appointments...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Date & Time</th>
                    <th className="py-2 px-4 border-b text-left">Test/Service</th>
                    <th className="py-2 px-4 border-b text-left">Doctor</th>
                    <th className="py-2 px-4 border-b text-left">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="py-2 px-4 border-b">{formatDateTime(booking.appointment_time)}</td>
                      <td className="py-2 px-4 border-b">{booking.test_type}</td>
                      <td className="py-2 px-4 border-b">
                        {booking.Doctors
                          ? `Dr. ${booking.Doctors.name} (${booking.Doctors.specialisation})` 
                          : 'No specific doctor'}
                      </td>
                      <td className="py-2 px-4 border-b">{booking.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p>You don't have any appointments yet.</p>
              <button
                onClick={handleBookAppointment}
                className="mt-4 text-blue-600 hover:underline"
              >
                Book your first appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BookingForm = () => {
  // Form state
  const [address, setAddress] = useState('');
  const [testType, setTestType] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  
  // Data loading state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [testTypes, setTestTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null); // Store booking details
  
  // ADD RECAPTCHA REF
  const recaptchaRef = useRef<ReCaptchaRef>(null);
  
  const navigate = useNavigate();
  
  // Check if user is authenticated
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.log("User not authenticated, redirecting to login");
      navigate('/login');
    }
  }, [navigate]);
  
  // Fetch test types
  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        // FIXED: Use the correct API URL without duplicate /api/
        const testTypesUrl = `${API_URL}/test-types`;
        console.log("Fetching test types from:", testTypesUrl);
        
        const response = await fetch(testTypesUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch test types: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Test types loaded:", data);
        setTestTypes(data);
        
        // Set default test type
        if (data.length > 0) {
          setTestType(data[0]);
        }
      } catch (error) {
        console.error('Error fetching test types:', error);
        // Fallback to hardcoded values
        const fallbackTypes = [
          "Urine", "Blood", "Blood pressure", 
          "Vaccination", "General consultation", "General checkup"
        ];
        setTestTypes(fallbackTypes);
        setTestType(fallbackTypes[0]);
      }
    };
    
    fetchTestTypes();
  }, []);
  
  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setDoctorsLoading(true);
      try {
        // FIXED: Use the correct API URL without duplicate /api/
        const doctorsUrl = `${API_URL}/doctors`;
        console.log("Fetching doctors from:", doctorsUrl);
        
        const response = await fetch(doctorsUrl);
        console.log("Doctor API response status:", response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch doctors: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Doctors loaded:", data);
        setDoctors(data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);
  
  // Submit booking - UPDATED
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // VERIFY RECAPTCHA FIRST
      const recaptchaValue = recaptchaRef.current?.getValue();
      if (!recaptchaValue) {
        setError('Please complete the reCAPTCHA verification');
        return;
      }

      if (!appointmentDate || !appointmentTime) {
        throw new Error('Please select both date and time for your appointment');
      }
      
      // Combine date and time into a single ISO string
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const bookingData = {
        user_id: parseInt(userId),
        doctor_id: selectedDoctorId,
        address,
        test_type: testType,
        appointment_time: appointmentDateTime.toISOString(),
        recaptchaToken: recaptchaValue // Add this
      };
      
      console.log("Submitting booking:", bookingData);
      
      const bookingUrl = `${API_URL}/bookings`;
      console.log("Submitting booking to:", bookingUrl);
      
      const response = await fetch(bookingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        // Get the error as text first
        const errorText = await response.text();
        let errorMessage = 'Failed to create booking';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e, "Response:", errorText);
          errorMessage = errorText || `Error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const bookingResult = await response.json();
      
      // Store booking details for calendar integration
      const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
      setBookingSuccess({
        id: bookingResult.id,
        test_type: testType,
        appointment_time: appointmentDateTime.toISOString(),
        address: address,
        doctor_name: selectedDoctor?.name || 'Healthcare Provider',
        patient_name: localStorage.getItem('userName'),
        user_type: 'patient'
      });
      
      setSuccess(true);
      
      // Don't redirect immediately - let user add to calendar first
      // setTimeout(() => {
      //   navigate('/patient-dashboard');
      // }, 3000);
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      // RESET RECAPTCHA ON ERROR
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form function
  const resetForm = () => {
    setAddress('');
    setTestType(testTypes[0] || '');
    setAppointmentDate('');
    setAppointmentTime('');
    setSelectedDoctorId(null);
    setSuccess(false);
    setBookingSuccess(null);
  };

  const goToDashboard = () => {
    navigate('/patient-dashboard');
  };
  
  // Get tomorrow's date for min date in the date picker
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Book an Appointment</h1>
        
        {success && bookingSuccess ? (
          // SUCCESS STATE - Show calendar options
          <div className="space-y-6">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✅ <strong>Booking Successful!</strong> Your appointment has been scheduled.
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Details</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Test Type:</strong> {bookingSuccess.test_type}</p>
                <p><strong>Date & Time:</strong> {new Date(bookingSuccess.appointment_time).toLocaleString()}</p>
                <p><strong>Doctor:</strong> {bookingSuccess.doctor_name}</p>
                <p><strong>Address:</strong> {bookingSuccess.address}</p>
              </div>
            </div>
            
            {/* Calendar Actions */}
            <CalendarActions appointment={bookingSuccess} />
            
            <div className="flex space-x-4">
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Book Another Appointment
              </button>
              <button
                onClick={goToDashboard}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          // BOOKING FORM
          <>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Address Field */}
              <div>
                <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                  required
                  placeholder="Enter your full address"
                />
              </div>
              
              {/* Test Type Dropdown */}
              <div>
                <label htmlFor="testType" className="block text-gray-700 text-sm font-bold mb-2">
                  Test Type
                </label>
                <select
                  id="testType"
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">-- Select a test type --</option>
                  {testTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date and Time Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="appointmentDate" className="block text-gray-700 text-sm font-bold mb-2">
                    Appointment Date
                  </label>
                  <input
                    id="appointmentDate"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={getTomorrow()}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="appointmentTime" className="block text-gray-700 text-sm font-bold mb-2">
                    Appointment Time
                  </label>
                  <input
                    id="appointmentTime"
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>
              
              {/* Doctor Selection */}
              <div>
                <label htmlFor="doctor" className="block text-gray-700 text-sm font-bold mb-2">
                  Preferred Doctor (Optional)
                </label>
                {doctorsLoading ? (
                  <p className="text-gray-500">Loading doctors...</p>
                ) : (
                  <select
                    id="doctor"
                    value={selectedDoctorId || ''}
                    onChange={(e) => setSelectedDoctorId(e.target.value ? parseInt(e.target.value) : null)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">-- No specific doctor --</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialisation}
                      </option>
                    ))}
                  </select>
                )}
                {!doctorsLoading && doctors.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    No doctors available. You can continue without selecting a doctor.
                  </p>
                )}
              </div>
              
              {/* reCAPTCHA */}
              <ReCaptcha ref={recaptchaRef} />
              
              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingForm;