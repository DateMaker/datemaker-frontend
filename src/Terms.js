import React from 'react';
import { X } from 'lucide-react';

export default function TermsModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      zIndex: 2000,
      overflow: 'auto'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative'
      }}>
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'white',
          padding: '2rem',
          borderBottom: '2px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: 0,
            background: 'linear-gradient(to right, #ec4899, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Terms of Service
          </h1>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '2rem 3rem 3rem 3rem', lineHeight: '1.8', color: '#374151' }}>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Last Updated: November 27, 2025</p>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>1. Acceptance of Terms</h2>
            <p>By accessing and using DateMaker ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>2. Description of Service</h2>
            <p>DateMaker is a date itinerary planning platform that helps users discover and plan date activities. The Service includes both free and premium subscription tiers with different feature access levels.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>3. Account Registration</h2>
            <p>To use certain features of the Service, you must register for an account. You agree to:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Immediately notify us of any unauthorized use of your account</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>4. Subscription and Billing</h2>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>4.1 Free Trial</h3>
            <p>New users are eligible for a 7-day free trial of the Premium subscription. You will not be charged during the trial period. At the end of the trial, you will be automatically charged $9.99/month unless you cancel before the trial ends.</p>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>4.2 Premium Subscription</h3>
            <p>Premium subscriptions are billed monthly at $9.99/month. By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel.</p>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>4.3 Cancellation</h3>
            <p>You may cancel your subscription at any time through your account settings. Cancellations take effect at the end of the current billing period. No refunds are provided for partial subscription periods.</p>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>4.4 Payment Processing</h3>
            <p>All payments are processed securely by Stripe, Inc. We do not store your complete credit card information. By providing payment information, you represent that you are authorized to use the payment method provided.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>5. User Conduct</h2>
            <p>You agree not to use the Service to:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Upload or transmit viruses or malicious code</li>
              <li>Spam, phish, or engage in other fraudulent activities</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Collect or harvest personal data of other users</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>6. Content and Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are owned by DateMaker and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>6.1 User Content</h3>
            <p>You retain ownership of content you submit to the Service (photos, preferences, etc.). By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content solely for the purpose of operating and improving the Service.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>7. Third-Party Services</h2>
            <p>The Service integrates with third-party services including Google Maps, Ticketmaster, and Stripe. Your use of these services is subject to their respective terms of service and privacy policies. We are not responsible for the availability, accuracy, or content of third-party services.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>8. Disclaimers and Limitation of Liability</h2>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>8.1 Service Provided "As Is"</h3>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>8.2 Limitation of Liability</h3>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, DATEMAKER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>9. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless DateMaker and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from your use of the Service or violation of these Terms.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>10. Termination</h2>
            <p>We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>11. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use of the Service after changes constitutes acceptance of the modified Terms.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>12. Governing Law and Dispute Resolution</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of Australia. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of Australia.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>13. Contact Information</h2>
            <p>If you have questions about these Terms, please contact us at:</p>
            <p style={{ marginTop: '1rem', fontWeight: '600' }}>
              Email: thedatemakerapp@outlook.com
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>14. Severability</h2>
            <p>If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.</p>
          </section>
        </div>
      </div>
    </div>
  );
}