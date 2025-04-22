
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Invest from "./pages/Invest";
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
import ExpertApproveDecline from './pages/module3/ExpertApproveDecline';



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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

          {/*Invester Routes */}
          <Route path="/invest" element={<Invest />} />



          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
