import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-agritech-paleGreen flex flex-col items-center py-10 px-4">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">Privacy Policy</h1>
        <p className="text-gray-700 mb-4 text-center">Effective Date: April 22, 2025</p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">1. Introduction</h2>
          <p className="text-gray-700">
            Welcome to AgriTech, a platform designed to empower farmers and investors with tools for plant disease detection, profile management, and agricultural insights. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">2. Information We Collect</h2>
          <p className="text-gray-700">We collect the following types of information:</p>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Personal Information</strong>: When you sign up or update your profile, we collect your email, first name, last name, mobile number, and user category (Farmer or Investor).</li>
            <li><strong>Farmer Details</strong>: Farmers may provide additional information such as address, farm size, main crops, experience, and profile photos.</li>
            <li><strong>Usage Data</strong>: We collect data on how you interact with our platform, including disease scan results, feedback, and event views.</li>
            <li><strong>Images</strong>: Images uploaded for plant disease detection are processed and stored temporarily.</li>
            <li><strong>Technical Data</strong>: We collect device information, IP addresses, and browser details to improve our services.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">3. How We Use Your Information</h2>
          <p className="text-gray-700">We use your information to:</p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Provide and improve our services, such as user authentication, profile management, and disease detection.</li>
            <li>Personalize your experience with daily tips and event recommendations.</li>
            <li>Communicate with you, including sending password reset codes and service updates.</li>
            <li>Analyze usage patterns to enhance platform performance.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">4. Data Storage and Security</h2>
          <p className="text-gray-700">
            Your data is stored securely using Supabase, a cloud-based database service. Profile photos are stored in Supabase Storage. We implement industry-standard security measures, including encryption and access controls, to protect your data. However, no system is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">5. Third-Party Services</h2>
          <p className="text-gray-700">
            We use third-party services to enhance our platform:
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Supabase</strong>: For user data storage and authentication.</li>
            <li><strong>Plant.id</strong>: For plant disease detection and identification.</li>
            <li><strong>Groq API</strong>: For generating prevention methods for plant diseases.</li>
            <li><strong>SMTP Services</strong>: For sending email notifications (e.g., password reset codes).</li>
          </ul>
          <p className="text-gray-700">
            These services have their own privacy policies, and we encourage you to review them.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">6. Data Sharing</h2>
          <p className="text-gray-700">
            We do not sell or share your personal information with third parties except:
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>With your consent.</li>
            <li>To comply with legal requirements or protect our rights.</li>
            <li>With service providers (e.g., Supabase, Plant.id) acting on our behalf.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">7. Your Rights</h2>
          <p className="text-gray-700">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Access, update, or delete your personal information via your profile settings.</li>
            <li>Request a copy of your data.</li>
            <li>Opt out of non-essential communications.</li>
          </ul>
          <p className="text-gray-700">
            To exercise these rights, contact us at <a href="mailto:support@agritech.com" className="text-green-600 hover:underline">support@agritech.com</a>.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">8. Cookies</h2>
          <p className="text-gray-700">
            We use cookies to manage sessions and improve your experience. You can disable cookies in your browser settings, but this may affect functionality.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">9. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or platform announcements.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">10. Contact Us</h2>
          <p className="text-gray-700">
            If you have questions about this Privacy Policy, contact us at:
          </p>
          <p className="text-gray-700">
            AgriTech Support<br />
            Email: <a href="mailto:support@agritech.com" className="text-green-600 hover:underline">support@agritech.com</a><br />
            Address: 123 Farm Lane, AgriCity, AG 12345
          </p>
        </section>

        <div className="text-center">
          <Link to="/" className="text-green-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
