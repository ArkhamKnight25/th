import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_URL from "../services/api";

type UserType = "user" | "doctor";

// Define types for response data
type User = {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  created_at?: string;
};

type Doctor = {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  specialisation: string;
  created_at?: string;
};

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUserType: setAuthUserType, setIsAuthenticated } = useAuth();

  // User login function
  const userLogin = async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    return data;
  };

  // Doctor login function with debugging
  const doctorLogin = async (email: string, password: string): Promise<Doctor> => {
    try {
      console.log("Sending doctor login request for email:", email);
      
      const response = await fetch(`${API_URL}/doctors/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      console.log("Raw doctor login response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse response as JSON:", text);
        throw new Error("Server returned invalid JSON. Please contact support.");
      }

      if (!response.ok) {
        console.error("Doctor login error response:", data);
        throw new Error(data.error || "Login failed. Please try again.");
      }
      
      if (!data.id || !data.email) {
        console.error("Doctor login response missing required fields:", data);
        throw new Error("Invalid response from server. Please contact support.");
      }
      
      return data;
    } catch (error) {
      console.error("Doctor login error:", error);
      throw error;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (userType === "user") {
        console.log("Attempting user login...");
        const user = await userLogin(email, password);

        // Set auth context and localStorage
        setAuthUserType("user");
        setIsAuthenticated(true);
        localStorage.setItem("userId", String(user.id));
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userName", user.name);
        localStorage.setItem("userType", "user"); // Important - must match exactly!

        // Important: log what we're storing
        console.log("Logged in as user:", user.name, "with type:", "user");
        
        // Navigate to the patient dashboard
        navigate("/patient-dashboard");
      } else {
        console.log("Attempting doctor login...");
        const doctor = await doctorLogin(email, password);

        // Set auth context and localStorage
        setAuthUserType("doctor");
        setIsAuthenticated(true);
        localStorage.setItem("userId", String(doctor.id));
        localStorage.setItem("userEmail", doctor.email);
        localStorage.setItem("userName", doctor.name);
        localStorage.setItem("userType", "doctor"); // Important - must match exactly!

        // Important: log what we're storing
        console.log("Logged in as doctor:", doctor.name, "with type:", "doctor");
        
        // Navigate to the doctor dashboard
        navigate("/doctor-dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Log In
        </h1>

        <div className="flex justify-center mb-6">
          <div className="bg-gray-200 rounded-full p-1 inline-flex">
            <button
              type="button"
              onClick={() => setUserType("user")}
              className={`py-2 px-4 rounded-full ${
                userType === "user"
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-700"
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setUserType("doctor")}
              className={`py-2 px-4 rounded-full ${
                userType === "doctor"
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-700"
              }`}
            >
              Doctor
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LogIn;
