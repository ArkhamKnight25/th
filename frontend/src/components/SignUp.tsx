import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_URL from "../services/api"; // Keep using API_URL from your service

type UserType = "user" | "doctor";

// Enhanced email check debugging
const checkEmailExists = async (email: string): Promise<{ exists: boolean; type?: string }> => {
  try {
    console.log("Checking if email exists:", email);
    
    const response = await fetch(`${API_URL}/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    
    console.log("Email check response status:", response.status);
    
    const text = await response.text();
    console.log("Email check raw response:", text);
    
    let data;
    try {
      data = JSON.parse(text);
      console.log("Email check result:", data);
    } catch (e) {
      console.error("Failed to parse email check response:", e);
      return { exists: false };
    }
    
    return data;
  } catch (error) {
    console.error("Error checking email:", error);
    return { exists: false };
  }
};

// Doctor signup function (keep as is)
const doctorSignUp = async (
  name: string,
  email: string,
  phone: string,
  specialisation: string,
  password: string
) => {
  try {
    const response = await fetch(`${API_URL}/doctors/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, phone, specialisation, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    return data;
  } catch (error) {
    console.error("Error signing up doctor:", error);
    throw error;
  }
};

// User/Patient signup function (keep as is)
const userSignUp = async (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    const response = await fetch(`${API_URL}/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    return data;
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error;
  }
};

const SignUp = () => {
  // Your existing state variables
  const [userType, setUserType] = useState<UserType>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [specialisation, setSpecialisation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUserType: setAuthUserType } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First, check if this email already exists
      const emailCheck = await checkEmailExists(email);
      
      if (emailCheck.exists) {
        setError(`This email is already registered as a ${emailCheck.type}. Please use a different email or login.`);
        return;
      }

      // Proceed with signup if email is unique (keep existing code)
      if (userType === "user") {
        const newUser = await userSignUp(name, email, phone, password);

        // Set user context data
        setAuthUserType("user");
        localStorage.setItem("userId", String(newUser.id)); // Ensure id is a string
        localStorage.setItem("userEmail", newUser.email);
        localStorage.setItem("userName", newUser.name);
        localStorage.setItem("userType", "user"); // Add this for better session tracking
      } else {
        const newDoctor = await doctorSignUp(
          name,
          email,
          phone,
          specialisation,
          password
        );

        // Set user context data
        setAuthUserType("doctor");
        localStorage.setItem("userId", String(newDoctor.id)); // Ensure id is a string
        localStorage.setItem("userEmail", newDoctor.email);
        localStorage.setItem("userName", newDoctor.name);
        localStorage.setItem("userType", "doctor"); // Add this for better session tracking
      }

      // Redirect to appropriate dashboard
      navigate(
        userType === "user" ? "/patient-dashboard" : "/doctor-dashboard"
      );
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains unchanged
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Sign Up
        </h1>

        {/* User Type Toggle */}
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

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Name field - was missing */}
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Email field */}
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

          {/* Phone number field - fixed label */}
          <div>
            <label
              htmlFor="phone"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {userType === "doctor" && (
            <div>
              <label
                htmlFor="specialisation"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Specialisation
              </label>
              <input
                id="specialisation"
                type="text"
                value={specialisation}
                onChange={(e) => setSpecialisation(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          )}

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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
