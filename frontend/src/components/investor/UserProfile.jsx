const UserProfile = ({ onClose }) => {
    return (
      <div className="absolute top-16 right-4 bg-white rounded-2xl shadow-md p-6 w-64">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Profile</h3>
          {onClose && (
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              ✕
            </button>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">Welcome,</span> nithish123@gmail.com
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Category:</span> Investor
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Phone:</span> 1234567890
          </p>
        </div>
      </div>
    );
  };
  
  export default UserProfile;