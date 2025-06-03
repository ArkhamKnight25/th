let API_URL: string;

if (import.meta.env.MODE === "development") {
  API_URL = "http://localhost:5000/api";
} else {
  // Use your EC2 public IP
  API_URL = "https://xlhsauhi76.execute-api.ap-south-1.amazonaws.com/v1";
}

export default API_URL;
