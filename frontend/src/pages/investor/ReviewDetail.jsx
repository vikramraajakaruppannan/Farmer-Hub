// src/pages/investor/ReviewDetail.jsx
import Navbar from "@/components/investor/Navbar";
import ReviewItem from "@/components/investor/ReviewItem";
import { useParams } from "react-router-dom";
import BackNav from "@/components/investor/BackNav";
import Footer from "@/components/investor/Footer";

const ReviewDetail = () => {
  const { id } = useParams();
  // Fetch review from backend
  const [review, setReview] = useState(null);

  useEffect(() => {
    fetch(`/investor/reviews/${id}`)
      .then(res => res.json())
      .then(setReview)
      .catch(() => alert("Failed to load review"));
  }, [id]);

  if (!review) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col bg-agritech-paleGreen relative">
      <Navbar />
      <BackNav />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-4xl mx-auto border border-agritech-green/10">
          <ReviewItem
            name={review.name}
            location={review.location}
            documents={review.documents}
            paymentAmount={review.paymentAmount}
            paymentDue={review.paymentDue}
            expanded={true}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewDetail;