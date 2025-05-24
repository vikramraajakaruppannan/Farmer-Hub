import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BackNav = ({ to, className = "" }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      aria-label="Go back"
      className={`flex items-center text-urban-green-700 hover:bg-urban-green-50 rounded-full p-2 transition-colors absolute top-4 left-4 z-20 ${className}`}
      onClick={() => (to ? navigate(to) : navigate(-1))}
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  );
};

export default BackNav;