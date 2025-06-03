import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  requiredUserType?: "user" | "doctor";
}

const ProtectedRoute = ({ requiredUserType }: ProtectedRouteProps) => {
  const { isAuthenticated, userType } = useAuth();

  // Not authenticated at all - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific user type is required, check for it
  if (requiredUserType && userType !== requiredUserType) {
    // Redirect to the appropriate dashboard based on actual user type
    if (userType === "user") {
      return <Navigate to="/patient-dashboard" replace />;
    } else if (userType === "doctor") {
      return <Navigate to="/doctor-dashboard" replace />;
    } else {
      // Fallback to login if user type is unexpected
      return <Navigate to="/login" replace />;
    }
  }

  // User is authenticated with the correct type
  return <Outlet />;
};

export default ProtectedRoute;