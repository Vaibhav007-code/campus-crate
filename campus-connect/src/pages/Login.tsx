
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForms } from "@/components/AuthForms";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-echo-blue">CampusCrate</h1>
        <p className="text-gray-600 mt-2">Your College Community Hub</p>
      </div>
      
      <AuthForms />
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Connect • Communicate • Collaborate</p>
      </footer>
    </div>
  );
};

export default Login;
