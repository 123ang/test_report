import React from 'react';
import { motion } from 'framer-motion';
import { LegalLayout, TableOfContents, LegalSection } from '../components/legal';
import { useActiveSection } from '../hooks/useActiveSection';

const TOC_ITEMS = [
  { id: 'information-we-collect', label: '1. Information We Collect' },
  { id: 'how-we-use', label: '2. How We Use Your Information' },
  { id: 'data-storage-security', label: '3. Data Storage & Security' },
  { id: 'data-sharing', label: '4. Data Sharing' },
  { id: 'cookies', label: '5. Cookies' },
  { id: 'data-retention', label: '6. Data Retention' },
  { id: 'childrens-privacy', label: "7. Children's Privacy" },
  { id: 'your-rights', label: '8. Your Rights' },
  { id: 'changes-to-policy', label: '9. Changes to This Policy' },
  { id: 'contact', label: '10. Contact' },
];

const SECTION_IDS = TOC_ITEMS.map((item) => item.id);

const PrivacyPolicyPage = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const activeId = useActiveSection(SECTION_IDS);

  return (
    <LegalLayout title="Privacy Policy" lastUpdated={lastUpdated}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <TableOfContents items={TOC_ITEMS} activeId={activeId} />

        <div className="space-y-0 text-brand-navy/90 leading-7">
          <p className="text-lg leading-8 mb-6">
            Test Report (the &ldquo;Service&rdquo;) is operated by Sun Tzu Technologies (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).
            We respect your privacy and are committed to protecting your personal information.
          </p>
          <p className="text-lg leading-8 mb-10">
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and application.
          </p>

          <LegalSection id="information-we-collect">
            <h2 className="text-xl font-bold text-brand-navy mb-4">1. Information We Collect</h2>
            <h3 className="text-base font-semibold text-brand-navy mt-6 mb-2">a) Account Information</h3>
            <p className="mb-2">When you create an account, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Organization name (optional)</li>
              <li>Login credentials (encrypted)</li>
            </ul>
            <h3 className="text-base font-semibold text-brand-navy mt-6 mb-2">b) Usage Data</h3>
            <p className="mb-2">We automatically collect limited technical information such as:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Browser type</li>
              <li>Device type</li>
              <li>IP address</li>
              <li>Pages visited</li>
              <li>Actions within the application (e.g., creating test cases, generating reports)</li>
            </ul>
            <p className="mb-4">This data is used only for improving service performance and reliability.</p>
            <h3 className="text-base font-semibold text-brand-navy mt-6 mb-2">c) User Content</h3>
            <p className="mb-2">You may upload or create content including:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Test cases</li>
              <li>Project information</li>
              <li>Attachments or screenshots</li>
              <li>Reports</li>
            </ul>
            <p>You retain full ownership of your content.</p>
          </LegalSection>

          <LegalSection id="how-we-use">
            <h2 className="text-xl font-bold text-brand-navy mb-4">2. How We Use Your Information</h2>
            <p className="mb-2">We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Provide and operate the Service</li>
              <li>Maintain system security and prevent abuse</li>
              <li>Improve performance and user experience</li>
              <li>Respond to support requests</li>
              <li>Notify users about important updates</li>
            </ul>
            <p>We do not sell your personal data.</p>
          </LegalSection>

          <LegalSection id="data-storage-security">
            <h2 className="text-xl font-bold text-brand-navy mb-4">3. Data Storage &amp; Security</h2>
            <p className="mb-2">We implement reasonable technical safeguards to protect your information.</p>
            <p className="mb-2">However, no internet transmission is 100% secure. By using the Service, you acknowledge this risk.</p>
            <p>We only store data necessary to operate the platform.</p>
          </LegalSection>

          <LegalSection id="data-sharing">
            <h2 className="text-xl font-bold text-brand-navy mb-4">4. Data Sharing</h2>
            <p className="mb-2">We do not sell or rent your personal data.</p>
            <p className="mb-2">We may share data only when required:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>To comply with legal obligations</li>
              <li>To protect service integrity and prevent fraud</li>
              <li>With trusted infrastructure providers strictly for hosting the service</li>
            </ul>
          </LegalSection>

          <LegalSection id="cookies">
            <h2 className="text-xl font-bold text-brand-navy mb-4">5. Cookies</h2>
            <p className="mb-2">We may use minimal cookies or local storage for:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Authentication sessions</li>
              <li>Remembering preferences</li>
              <li>Basic analytics</li>
            </ul>
            <p>You may disable cookies in your browser, but some features may not function properly.</p>
          </LegalSection>

          <LegalSection id="data-retention">
            <h2 className="text-xl font-bold text-brand-navy mb-4">6. Data Retention</h2>
            <p className="mb-2">We retain user data while your account remains active.</p>
            <p>You may request deletion at any time by contacting us. Deleted accounts will have associated data permanently removed within a reasonable timeframe.</p>
          </LegalSection>

          <LegalSection id="childrens-privacy">
            <h2 className="text-xl font-bold text-brand-navy mb-4">7. Children&rsquo;s Privacy</h2>
            <p>The Service is not intended for individuals under 13 years old. We do not knowingly collect data from children.</p>
          </LegalSection>

          <LegalSection id="your-rights">
            <h2 className="text-xl font-bold text-brand-navy mb-4">8. Your Rights</h2>
            <p className="mb-2">You may request to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Access your stored data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
            </ul>
            <p>Contact us using the email below.</p>
          </LegalSection>

          <LegalSection id="changes-to-policy">
            <h2 className="text-xl font-bold text-brand-navy mb-4">9. Changes to This Policy</h2>
            <p className="mb-2">We may update this Privacy Policy occasionally. Changes will be posted on this page with an updated date.</p>
            <p>Continued use of the Service indicates acceptance of the updated policy.</p>
          </LegalSection>

          <LegalSection id="contact">
            <h2 className="text-xl font-bold text-brand-navy mb-4">10. Contact</h2>
            <p className="mb-2">If you have any questions about this Privacy Policy, please contact:</p>
            <p>
              Email:{' '}
              <a href="mailto:suntzutechnologies@gmail.com" className="text-brand-accent hover:underline">
                suntzutechnologies@gmail.com
              </a>
            </p>
          </LegalSection>
        </div>
      </motion.div>
    </LegalLayout>
  );
};

export default PrivacyPolicyPage;
