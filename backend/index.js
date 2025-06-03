const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

// Configure dotenv - only need to do this once
const result = dotenv.config();
if (result.error) {
  console.error("Error loading .env file:", result.error);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://telehealthcompanionlive.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Debug log for environment variables
// console.log("Environment variables loaded:");
// console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
// console.log(
//   "SUPABASE_SERVICE_KEY:",
//   process.env.SUPABASE_SERVICE_KEY ? "[REDACTED]" : "undefined"
// );

// Validate required environment variables
// if (!process.env.SUPABASE_URL) {
//   throw new Error("SUPABASE_URL is required but not defined in .env file");
// }

// if (!process.env.SUPABASE_SERVICE_KEY) {
//   throw new Error(
//     "SUPABASE_SERVICE_KEY is required but not defined in .env file"
//   );
// }

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const verifyRecaptcha = async (token) => {
  if (!token) {
    console.log('No reCAPTCHA token provided');
    return false;
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not found in environment variables');
      return false;
    }
    
    console.log('Verifying reCAPTCHA token...');
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`
    });
    
    const data = await response.json();
    console.log('reCAPTCHA verification result:', data);
    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};

try {
  console.log("Supabase client initialized successfully");

  // Doctor Authentication
  app.post("/api/doctors/signup", async (req, res) => {
    try {
      const { name, email, phone, specialisation, password, recaptchaToken } = req.body;

      // VERIFY RECAPTCHA FIRST
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
      }

      // Insert into Doctors table
      const { data, error } = await supabase
        .from("Doctors")
        .insert([{ name, email, phone, specialisation, password }])
        .select();

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/doctors/login", async (req, res) => {
    try {
      const { email, password, recaptchaToken } = req.body;
      
      // VERIFY RECAPTCHA FIRST
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
      }
      
      // Find doctor by email in Doctors table (note capital D)
      const { data: doctor, error } = await supabase
        .from("Doctors")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!doctor) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // In a real app, you'd verify the password hash here
      // For this example, assuming direct comparison (not secure!)
      if (doctor.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Remove password from response
      delete doctor.password;
      
      return res.status(200).json(doctor);
    } catch (error) {
      console.error("Doctor login error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Patient (User) Authentication
  app.post("/api/users/signup", async (req, res) => {
    try {
      const { name, email, phone, password, recaptchaToken } = req.body;

      // VERIFY RECAPTCHA FIRST
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
      }

      // Insert into Users table
      const { data, error } = await supabase
        .from("Users")
        .insert([{ name, email, phone, password }])
        .select();

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/users/login", async (req, res) => {
    try {
      const { email, password, recaptchaToken } = req.body;
      
      // VERIFY RECAPTCHA FIRST
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
      }
      
      // Find user by email in Users table (note capital U)
      const { data: user, error } = await supabase
        .from("Users")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // In a real app, you'd verify the password hash here
      // For this example, assuming direct comparison (not secure!)
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Remove password from response
      delete user.password;
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("User login error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Get all doctors
  app.get("/api/doctors", async (req, res) => {
    try {
      console.log("Doctors API endpoint called");
      
      // Query all doctors from Supabase
      const { data, error } = await supabase
        .from("Doctors")
        .select("id, name, specialisation");
      
      if (error) {
        console.error("Supabase error fetching doctors:", error);
        return res.status(400).json({ error: error.message });
      }
      
      // Log the result
      console.log(`Found ${data ? data.length : 0} doctors`);
      
      // Set proper headers
      res.setHeader('Content-Type', 'application/json');
      
      // Return doctors or empty array
      return res.status(200).json(data || []);
    } catch (err) {
      console.error("Server error in /api/doctors:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Get doctor by ID
  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from("Doctors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Get user profile
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from("Users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Add this to your Express backend
  app.post('/api/check-email', async (req, res) => {
    try {
      const { email } = req.body;
      console.log("Checking email:", email); // Debug log
      
      // Check in Users table - note the capital U
      const { data: users, error: userError } = await supabase
        .from('Users') // Changed from 'users' to 'Users'
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (userError) {
        console.error("User check error:", userError);
        throw userError;
      }
      
      console.log("Users check result:", users); // Debug log
      
      if (users) {
        return res.json({ exists: true, type: "patient" });
      }
      
      // Check in Doctors table - note the capital D
      const { data: doctors, error: doctorError } = await supabase
        .from('Doctors') // Changed from 'doctors' to 'Doctors'
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (doctorError) {
        console.error("Doctor check error:", doctorError);
        throw doctorError;
      }
      
      console.log("Doctors check result:", doctors); // Debug log
      
      if (doctors) {
        return res.json({ exists: true, type: "doctor" });
      }
      
      // Email doesn't exist in either table
      return res.json({ exists: false });
    } catch (error) {
      console.error("Error checking email:", error);
      return res.status(500).json({ error: "Server error checking email" });
    }
  });

  // Get test types
  app.get("/api/test-types", async (req, res) => {
    try {
      // Return the test types defined in your enum
      const testTypes = [
        "Urine", "Blood", "Blood pressure", 
        "Vaccination", "General consultation", "General checkup"
      ];
      return res.status(200).json(testTypes);
    } catch (err) {
      console.error("Error fetching test types:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Create a new booking endpoint
  app.post("/api/bookings", async (req, res) => {
    try {
      const { user_id, doctor_id, address, test_type, appointment_time, recaptchaToken } = req.body;
      
      // VERIFY RECAPTCHA FIRST
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
      }
      
      console.log("Creating booking:", {
        user_id,
        doctor_id,
        address,
        test_type,
        appointment_time
      });
      
      // Validate required fields
      if (!user_id || !address || !test_type || !appointment_time) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Insert booking into Supabase
      const { data, error } = await supabase
        .from("Bookings")
        .insert({
          user_id,
          doctor_id: doctor_id || null,
          address,
          test_type,
          appointment_time
        })
        .select();
        
      if (error) {
        console.error("Error creating booking:", error);
        return res.status(400).json({ error: error.message });
      }
      
      console.log("Booking created successfully:", data[0]);
      return res.status(201).json(data[0]);
    } catch (err) {
      console.error("Exception in booking creation:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Get bookings for a user
  app.get("/api/bookings/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const { data, error } = await supabase
        .from("Bookings")
        .select(`
          *,
          Doctors:doctor_id (id, name, specialisation)
        `)
        .eq("user_id", userId)
        .order("appointment_time", { ascending: true });
        
      if (error) {
        console.error("Error fetching user bookings:", error);
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json(data);
    } catch (err) {
      console.error("Exception in fetching user bookings:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Get bookings for a doctor (with patient details)
  app.get("/api/bookings/doctor/:doctorId", async (req, res) => {
    try {
      const { doctorId } = req.params;
      console.log(`Fetching bookings for doctor ID: ${doctorId}`);
      
      const { data, error } = await supabase
        .from("Bookings")
        .select(`
          *,
          Users:user_id (id, name, email, phone)
        `)
        .eq("doctor_id", doctorId)
        .order("appointment_time", { ascending: true });
        
      if (error) {
        console.error("Error fetching doctor bookings:", error);
        return res.status(400).json({ error: error.message });
      }
      
      console.log(`Found ${data.length} bookings for doctor ${doctorId}`);
      return res.status(200).json(data || []);
    } catch (err) {
      console.error("Error in /api/bookings/doctor/:doctorId endpoint:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Non-prefixed version for consistency (choose one approach)
  app.get("/bookings/doctor/:doctorId", async (req, res) => {
    try {
      const { doctorId } = req.params;
      
      const { data, error } = await supabase
        .from("Bookings")
        .select(`
          *,
          Users:user_id (id, name, email, phone)
        `)
        .eq("doctor_id", doctorId)
        .order("appointment_time", { ascending: true });
        
      if (error) {
        console.error("Error fetching doctor bookings:", error);
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json(data || []);
    } catch (err) {
      console.error("Error in /bookings/doctor/:doctorId endpoint:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // For doctors
  app.get("/doctors", async (req, res) => {
    try {
      console.log("Doctors API called");
      
      // Query all doctors from Supabase
      const { data, error } = await supabase
        .from("Doctors")
        .select("id, name, specialisation");
      
      if (error) {
        console.error("Supabase error fetching doctors:", error);
        return res.status(400).json({ error: error.message });
      }
      
      console.log(`Found ${data.length} doctors`);
      return res.status(200).json(data || []);
    } catch (err) {
      console.error("Server error fetching doctors:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // For test types
  app.get("/test-types", async (req, res) => {
    try {
      // Return the test types defined in your enum
      const testTypes = [
        "Urine", "Blood", "Blood pressure", 
        "Vaccination", "General consultation", "General checkup"
      ];
      return res.status(200).json(testTypes);
    } catch (err) {
      console.error("Error fetching test types:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // For creating bookings
  app.post("/bookings", async (req, res) => {
    try {
      const { user_id, doctor_id, address, test_type, appointment_time, recaptchaToken } = req.body;
      
      // VERIFY RECAPTCHA FIRST
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
      }
      
      console.log("Creating booking:", {
        user_id,
        doctor_id,
        address,
        test_type,
        appointment_time
      });
      
      // Validate required fields
      if (!user_id || !address || !test_type || !appointment_time) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Insert booking into Supabase
      const { data, error } = await supabase
        .from("Bookings")
        .insert({
          user_id,
          doctor_id: doctor_id || null,
          address,
          test_type,
          appointment_time
        })
        .select();
        
      if (error) {
        console.error("Supabase error creating booking:", error);
        return res.status(400).json({ error: error.message });
      }
      
      console.log("Booking created successfully:", data[0]);
      return res.status(201).json(data[0]);
    } catch (err) {
      console.error("Server error creating booking:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // For fetching user bookings
  app.get("/bookings/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const { data, error } = await supabase
        .from("Bookings")
        .select(`
          *,
          Doctors:doctor_id (id, name, specialisation)
        `)
        .eq("user_id", userId)
        .order("appointment_time", { ascending: true });
        
      if (error) {
        console.error("Error fetching user bookings:", error);
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json(data);
    } catch (err) {
      console.error("Error in /bookings/user/:userId endpoint:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("Error initializing Supabase client:", error);
}

