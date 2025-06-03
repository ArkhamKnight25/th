import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../services/api';

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
              <p className="text-gray-600">You don't have any appointments yet.</p>
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

export default PatientDashboard;