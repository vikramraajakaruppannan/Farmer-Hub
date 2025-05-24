import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ReviewItem = ({
  name,
  location,
  documents,
  paymentAmount,
  paymentDue,
  onViewDetails,
  expanded = false,
}) => {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleApproveDocument = (docTitle) => {
    toast.success(`Document "${docTitle}" approved!`);
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    toast.success("Message sent successfully");
    setMessage("");
  };

  const handleApproveAll = () => {
    toast.success("All documents approved!");
  };

  if (!isExpanded) {
    return (
      <div className="py-4 px-6 border-b flex items-center justify-between">
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-gray-500">{location}</p>
        </div>
        <Button 
          variant="ghost" 
          className="text-urban-green-600 hover:text-urban-green-700 hover:bg-urban-green-50" 
          onClick={() => {
            if (onViewDetails) {
              onViewDetails();
            } else {
              setIsExpanded(true);
            }
          }}
        >
          View Details
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-gray-500">{location}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsExpanded(false)} 
            className="text-urban-green-600 border-urban-green-300"
          >
            Back
          </Button>
        </div>
      </div>

      <div className="p-6 bg-gray-50">
        <h3 className="font-medium mb-4">Submitted Documents</h3>
        
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div key={index} className="bg-white p-4 rounded border flex justify-between items-center">
              <div>
                <p className="font-medium">{doc.title}</p>
                <div className="flex space-x-4">
                  <span className="text-xs text-gray-500">{doc.date}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Pending Review</span>
                <Button
                  size="sm"
                  className="bg-urban-green-500 hover:bg-urban-green-600"
                  onClick={() => handleApproveDocument(doc.title)}
                >
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {paymentAmount && (
        <div className="p-6 border-t">
          <h3 className="font-medium mb-4">Payment Details</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Amount Due</p>
            <p className="text-2xl font-semibold">₹{paymentAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{paymentDue}</p>
            <p className="text-xs text-blue-600 mt-2">*Approve all documents to enable payment</p>
          </div>
        </div>
      )}

      <div className="p-6 border-t">
        <h3 className="font-medium mb-4">Communication</h3>
        <div className="bg-gray-50 p-4 rounded">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-[100px] mb-3"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSendMessage}
              className="bg-urban-green-500 hover:bg-urban-green-600"
            >
              Send Message
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="p-6 flex justify-center">
        <Button
          onClick={handleApproveAll}
          className="w-3/4 bg-urban-green-500 hover:bg-urban-green-600 py-6 text-lg"
        >
          Approve
        </Button>
      </div>
    </div>
  );
};

export default ReviewItem;