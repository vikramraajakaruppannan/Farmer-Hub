import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/AuthContext"; // Import useAuth
import { ProductProvider } from "@/components/ProductContext";
import Index from "./pages/Index";
import AICropDiseasePrediction from "./pages/AICropDiseasePrediction.jsx";
import FarmerExchangeNetwork from "./pages/FarmerExchangeNetwork";
import ExpertConsultationPlatform from "./pages/ExpertConsultationPlatform";
import UrbanToFarmerInvestment from "./pages/UrbanToFarmerInvestment";
import SupplyChainBulkBuyers from "./pages/SupplyChainBulkBuyers";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerificationCode from "./pages/VerificationCode";
import ResetPassword from "./pages/ResetPassword";
import ResetSuccess from "./pages/ResetSuccess";
import Dashboard from "./pages/Dashboard";
import DiseaseDetection from "./pages/module1/DiseaseDetection";
import ScanResults from "./pages/module1/ScanResults";
import Feedback from "./pages/module1/Feedback";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import MarketHome from "./pages/module2/MarketHome";
import Market from "./pages/module2/Market";
import ProductDetails from "./pages/module2/ProductDetails";
import Delivery from "./pages/module2/Delivery";
import Billing from "./pages/module2/Billing";
import OrderConfirmation from "./pages/module2/OrderConfirmation";
import TrackOrders from "./pages/module2/TrackOrders";
import ManageProducts from "./pages/module2/ManageProducts";
import ExpertConsultation from "./pages/module3/ExpertConsultation";
import ExpertNotifications from "./pages/module3/ExpertNotifications";
import ExpertRequestAction from "./pages/module3/ExpertRequestAction";
import ExpertApproveDecline from "./pages/module3/ExpertApproveDecline";
import Index1 from "./pages/module5/Index";
import LoginPage from "./pages/buyer/LoginPage";
import OtpVerificationPage from "./pages/buyer/OtpVerificationPage";
import CompleteProfilePage from "./pages/buyer/CompleteProfilePage";
import WantedProductsPage from "./pages/buyer/WantedProductsPage.jsx";
import AddProductPage from "./pages/buyer/AddProductPage.jsx";
import ProductDetailPage from "./pages/buyer/ProductDetailPage.jsx";
import NotificationsPage from "./pages/buyer/NotificationsPage.jsx";

import Index2 from "./pages/investor/Index";
import Properties from "./pages/investor/Properties"
import DocumentReview from "./pages/investor/DocumentReview"

import InvestorProperties from "./pages/investment/InvestorProperties";
import PropertyDetails from "./pages/investment/PropertyDetails";
import PropertyDetailsForm from "./pages/investment/apply/PropertyDetailsForm";
import FarmingPlanForm from "./pages/investment/apply/FarmingPlanForm";
import FinancialInfoForm from "./pages/investment/apply/FinancialInfoForm";
import DocumentsUploadForm from "./pages/investment/apply/DocumentsUploadForm";
import ReviewForm from "./pages/investment/apply/ReviewForm";
import SuccessPage from "./pages/investment/apply/SuccessPage";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import AppliedDetail from "./pages/investment/AppliedDetail.jsx";

import AdminDashboardFarmer from "./pages/investment/AdminDashboardFarmer.jsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ element }) => {
  const { user, sessionId } = useAuth();
  return user && sessionId ? element : <LoginPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <ProductProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verification-code" element={<VerificationCode />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-success" element={<ResetSuccess />} />
              <Route path="/ai-crop-disease-prediction" element={<AICropDiseasePrediction />} />
              <Route path="/farmer-exchange-network" element={<FarmerExchangeNetwork />} />
              <Route path="/expert-consultation-platform" element={<ExpertConsultationPlatform />} />
              <Route path="/urban-to-farmer-investment" element={<UrbanToFarmerInvestment />} />
              <Route path="/Supply-Chain-Bulk-Buyers" element={<SupplyChainBulkBuyers />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

              {/* Dashboard and Profile Route */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* Disease Detection Routes */}
              <Route path="/disease-detection" element={<DiseaseDetection />} />
              <Route path="/scan-results" element={<ScanResults />} />
              <Route path="/feedback" element={<Feedback />} />

              {/* Market & Sales Routes */}
              <Route path="/market-home" element={<MarketHome />} />
              <Route path="/market" element={<Market />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
              <Route path="/track-orders" element={<TrackOrders />} />
              <Route path="/manage-products" element={<ManageProducts />} />

              {/* Expert Consultation Routes */}
              <Route path="/expert-consultation" element={<ExpertConsultation />} />
              <Route path="/expert-notifications" element={<ExpertNotifications />} />
              <Route path="/consultation-request/:requestId" element={<ExpertRequestAction />} />
              <Route path="/expert/approve-decline/:token" element={<ExpertApproveDecline />} />

              {/* Admin for investor */}
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Investor Routes */}
              <Route path="/invest" element={<Index2 />} />
              <Route path="/properties" element={<Properties/>} />
              <Route path="/document-review" element={<DocumentReview/>} /> 

              {/* Investment Routes */}
              <Route path="/investment" element={<InvestorProperties />} />
              <Route path="/investment/property/:id" element={<PropertyDetails />} />
              <Route path="/investment/apply/property-details" element={<PropertyDetailsForm />} />
              <Route path="/investment/apply/farming-plan" element={<FarmingPlanForm />} />
              <Route path="/investment/apply/financial-info" element={<FinancialInfoForm />} />
              <Route path="/investment/apply/documents" element={<DocumentsUploadForm />} />
              <Route path="/investment/apply/review" element={<ReviewForm />} />
              <Route path="/investment/apply/success" element={<SuccessPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardFarmer />} />
              <Route path="/investment/applied/:id" element={<AppliedDetail />} />


              {/* Farmer to Bulkbuyer */}
              <Route path="/farmer-requests" element={<Index1 />} />

              {/* Bulk Buyer Routes */}
              <Route path="/buyer/login" element={<LoginPage />} />
              <Route path="/buyer/otp-verification" element={<OtpVerificationPage />} />
              <Route path="/buyer/complete-profile" element={<CompleteProfilePage />} />
              <Route path="/buyer/dashboard" element={<ProtectedRoute element={<WantedProductsPage />} />} />
              <Route path="/buyer/add-product" element={<ProtectedRoute element={<AddProductPage />} />} />
              <Route path="/buyer/product/:id" element={<ProtectedRoute element={<ProductDetailPage />} />} />
              <Route path="/buyer/notifications" element={<ProtectedRoute element={<NotificationsPage />} />} />

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProductProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;