import React from 'react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-agritech-paleGreen flex flex-col items-center py-10 px-4">
      <div className="max-w-4xl w-full bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-agritech-green mb-6 text-center">Terms and Conditions</h1>
        <p className="text-gray-700 mb-4">Effective Date: April 22, 2025</p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-agritech-darkGreen mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing or using the AgriTech platform, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree, you may not use our services. These Terms apply to all users, including Farmers and Investors.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-agritech-darkGreen mb-3">2. Description of Services</h2>
          <p className="text-gray-700">
            AgriTech provides a platform for:
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>User authentication and profile management.</li>
            <li>Plant disease detection using image uploads.</li>
            <li>Daily agricultural tips and event listings.</li>
            <li>Feedback submission and investor insights.</li>
          </ul>
          <p className="text-gray-700">
            We reserve the right to modify or discontinue services at any time without notice.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-agritech-darkGreen mb-3">3. User Responsibilities</h2>
          <p className="text-gray-700">You agree to:</p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Provide accurate and complete information during signup and profile updates.</li>
            <li>Use the platform lawfully and not engage in harmful activities (e.g., uploading malicious content).</li>
            <li>Protect your account credentials and notify us of unauthorized access.</li>
            <li>Ensure uploaded images for disease detection comply with our guidelines (e.g., no copyrighted material).</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-agritech-darkGreen mb-3">4. Intellectual Property</h2>
          <p className="text-gray-700">
            All content on the AgriTech platform, including text, images, and code, is owned by AgriTech or its licensors and protected by intellectual property laws. You may not reproduce, distribute, or modify our content without permission.
          </p>
          <p className="text-gray-700">
            User-uploaded content (e.g., profile photos, disease scan images) remains your property, but you grant AgriTech a non-exclusive, royalty-free license to use, store, and process it for providing services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-agritech-darkGreen mb-3">5. Third-Party Services</h2>
          <p className="text-gray-700">
            Our platform uses third-party services (e.g., Supabase, Plant.id, Groq API). Your use of these services is subject to their respective terms and conditions. We are not responsible for their performance or availability.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-agritech-darkGreen mb-3">6. Limitation of Liability</h2>
          <p className="text-gray-700">
            AgriTech provides disease detection and agricultural tips as informational tools. We do not guarantee their accuracy or suitability for your needs. You use our services at your own risk. AgriTech is not liable for:
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Losses arising from inaccurate disease detection results.</li>
            <li>Data breaches beyond our reasonable control.</li>
            <li>Damages from service interruptions or third-party actions.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-agritech-darkGreen mb-3">7. Termination</h2>
          <p className="text-gray-700">
            We may suspend or terminate your account if you violate these Terms, engage in unlawful activities, or misuse the platform. You may delete your account via profile settings, subject to our Privacy Policy.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-agritech-darkGreen mb-3">8. Governing Law</h2>
          <p className="text-gray-700">
            These Terms are governed by the laws of [Your Jurisdiction, e.g., Delaware, USA]. Any disputes will be resolved in the courts of [Your Jurisdiction].
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-agritech-darkGreen mb-3">9. Changes to Terms</h2>
          <p className="text-gray-700">
            We may update these Terms to reflect changes in our services or legal requirements. We will notify you of significant changes via email or platform announcements. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-agritech-darkGreen mb-3">10. Contact Us</h2>
          <p className="text-gray-700">
            For questions about these Terms, contact us at:
          </p>
          <p className="text-gray-700">
            AgriTech Support<br />
            Email: <a href="mailto:support@agritech.com" className="text-agritech-green hover:underline">support@agritech.com</a><br />
            Address: 123 Farm Lane, AgriCity, AG 12345
          </p>
        </section>

        <div className="text-center mt-6">
          <Link to="/" className="text-agritech-green hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
