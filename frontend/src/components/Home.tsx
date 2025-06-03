import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    // Check if user is logged in by checking localStorage
    const userId = localStorage.getItem("userId");
    if (userId) {
      navigate('/booking');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          Order Any Tests and Appointments
        </h1>
        
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 mb-6">
            Book medical tests, consultations, and health checkups with our experienced healthcare professionals.
          </p>
          
          <button
            onClick={handleBookingClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition duration-200 hover:scale-105"
          >
            Book an Appointment
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Laboratory Tests</h2>
            <p className="text-gray-600 mb-4">
              Get accurate results with our comprehensive testing services.
            </p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Blood Tests</li>
              <li>Urine Tests</li>
              <li>Blood Pressure Checks</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Consultations</h2>
            <p className="text-gray-600 mb-4">
              Consult with our specialists for personalized care.
            </p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>General Consultations</li>
              <li>Specialist Consultations</li>
              <li>Follow-up Visits</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Preventive Care</h2>
            <p className="text-gray-600 mb-4">
              Stay healthy with our preventive healthcare services.
            </p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Vaccinations</li>
              <li>General Checkups</li>
              <li>Health Screenings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;