import React from 'react';
import { X } from 'lucide-react';

export default function PrivacyModal({ onClose }) {
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
            Privacy Policy
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>1. Introduction</h2>
            <p>DateMaker ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>2. Information We Collect</h2>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>2.1 Information You Provide</h3>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li><strong>Account Information:</strong> Email address, password (encrypted), profile photo</li>
              <li><strong>Profile Data:</strong> Name, preferences, hobbies, activities of interest</li>
              <li><strong>Payment Information:</strong> Billing details processed through Stripe (we do not store complete credit card numbers)</li>
              <li><strong>Content:</strong> Photos, date memories, saved locations, and itineraries</li>
              <li><strong>Communications:</strong> Messages sent through our platform, support inquiries</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>2.2 Automatically Collected Information</h3>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li><strong>Location Data:</strong> Approximate location based on IP address or precise location if you grant permission</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>3. How We Use Your Information</h2>
            <p>We use collected information for the following purposes:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li><strong>Provide the Service:</strong> Generate date itineraries, show nearby venues and events</li>
              <li><strong>Process Payments:</strong> Handle subscription billing through Stripe</li>
              <li><strong>Personalization:</strong> Customize recommendations based on your preferences</li>
              <li><strong>Communication:</strong> Send service updates, promotional emails, and support responses</li>
              <li><strong>Analytics:</strong> Understand usage patterns and improve the Service</li>
              <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>4. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share information in the following circumstances:</p>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>4.1 Third-Party Service Providers</h3>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li><strong>Firebase:</strong> Authentication, database, and cloud storage</li>
              <li><strong>Stripe:</strong> Payment processing and subscription management</li>
              <li><strong>Google Maps:</strong> Location services and venue information</li>
              <li><strong>Ticketmaster:</strong> Event discovery and ticketing information</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>4.2 Legal Requirements</h3>
            <p>We may disclose your information if required by law, court order, or government request, or to protect our rights, property, or safety.</p>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>4.3 Business Transfers</h3>
            <p>If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>5. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Encrypted storage of sensitive information</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure payment processing through PCI-compliant providers</li>
            </ul>
            <p style={{ marginTop: '1rem' }}>However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>6. Your Rights and Choices</h2>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>6.1 Access and Control</h3>
            <p>You have the right to:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Object to processing of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>6.2 California Privacy Rights (CCPA)</h3>
            <p>California residents have additional rights including the right to know what personal information is collected, whether it is sold or disclosed, to opt-out of sales, to deletion, and to non-discrimination.</p>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>6.3 European Privacy Rights (GDPR)</h3>
            <p>EU/EEA residents have rights under GDPR including access, rectification, erasure, restriction of processing, data portability, objection to processing, and withdrawal of consent.</p>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>6.4 Australian Privacy Rights</h3>
            <p>Australian residents have rights under the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs), including the right to access and correct personal information, and to make complaints to the Office of the Australian Information Commissioner (OAIC).</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>7. Data Retention</h2>
            <p>We retain your personal information for as long as necessary to provide the Service. When you delete your account, we will delete or anonymize your personal information within 30 days, except where required for legal purposes.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>8. International Data Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your own, including the United States and Australia. We ensure appropriate safeguards are in place to protect your information in compliance with applicable data protection laws.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>9. Age Policy</h2>
            <p>Our Service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>11. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our privacy practices, please contact us at:</p>
            <p style={{ marginTop: '1rem', fontWeight: '600' }}>
              Email: thedatemakerapp@outlook.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}