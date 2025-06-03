let API_URL: string;

if (import.meta.env.MODE === "development") {
  API_URL = "http://localhost:5000/api";
} else {
  // Use your EC2 backend instead of Lambda
  API_URL = "http://15.206.174.62:5000/api";
}

export default API_URL;
