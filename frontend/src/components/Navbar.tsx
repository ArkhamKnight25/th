import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, userType, logout } = useAuth();
  const navigate = useNavigate();
  
  // const handleLogout = () => {
  //   logout();
  //   navigate("/login");
  // };
  
  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Telehealth Companion</Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/home" className="hover:text-blue-200">Home</Link>
          <Link to="/about" className="hover:text-blue-200">About</Link>
          <Link to="/pricing" className="hover:text-blue-200">Pricing</Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to={userType === "user" ? "/patient-dashboard" : "/doctor-dashboard"} 
                className="hover:text-blue-200"
              >
                Dashboard
              </Link>
              {/* <button 
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
              >
                Logout
              </button> */}
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link 
                to="/signup" 
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
