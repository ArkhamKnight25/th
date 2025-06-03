import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Pricing from "./components/Pricing";
import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import BookingForm from './components/BookingForm';
import { AuthProvider } from "./context/AuthContext";

// Define type for ProtectedRoute props
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: "user" | "doctor";
}

// Protected route component
const ProtectedRoute = ({ children, requiredUserType }: ProtectedRouteProps) => {
  // Check if user is authenticated
  const userType = localStorage.getItem("userType");
  const userId = localStorage.getItem("userId");

  console.log("ProtectedRoute - checking access with:", 
    "userType:", userType, 
    "requiredType:", requiredUserType
  );

  if (!userId) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Very explicit type checking
  if (requiredUserType === "user" && userType !== "user") {
    console.log("Wrong user type, redirecting doctor to doctor dashboard");
    return <Navigate to="/doctor-dashboard" replace />;
  }

  if (requiredUserType === "doctor" && userType !== "doctor") {
    console.log("Wrong user type, redirecting patient to patient dashboard");
    return <Navigate to="/patient-dashboard" replace />;
  }

  // User is authenticated with correct type
  return <>{children}</>;
};

// Initial redirect based on auth status
const InitialRedirect = () => {
  const userType = localStorage.getItem("userType");
  const userId = localStorage.getItem("userId");

  console.log("InitialRedirect - userType:", userType, "userId:", userId);

  if (!userId) {
    return <Navigate to="/home" replace />;
  }

  // Very explicit check to ensure proper routing
  if (userType === "user") {
    return <Navigate to="/patient-dashboard" replace />;
  } else if (userType === "doctor") {
    return <Navigate to="/doctor-dashboard" replace />;
  } else {
    // Fallback if something is wrong with the userType
    console.error("Invalid userType found:", userType);
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<InitialRedirect />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected routes */}
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute requiredUserType="user">
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute requiredUserType="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/booking"
              element={
                <ProtectedRoute requiredUserType="user">
                  <BookingForm />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
