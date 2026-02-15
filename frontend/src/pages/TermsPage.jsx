import React from 'react';
import { motion } from 'framer-motion';
import { LegalLayout, TableOfContents, LegalSection } from '../components/legal';
import { useActiveSection } from '../hooks/useActiveSection';

const TOC_ITEMS = [
  { id: 'use-of-service', label: '1. Use of the Service' },
  { id: 'accounts', label: '2. Accounts' },
  { id: 'user-content', label: '3. User Content' },
  { id: 'service-availability', label: '4. Service Availability' },
  { id: 'data-backup', label: '5. Data Backup & Responsibility' },
  { id: 'termination', label: '6. Termination' },
  { id: 'intellectual-property', label: '7. Intellectual Property' },
  { id: 'limitation-of-liability', label: '8. Limitation of Liability' },
  { id: 'changes-to-terms', label: '9. Changes to Terms' },
  { id: 'contact', label: '10. Contact' },
];

const SECTION_IDS = TOC_ITEMS.map((item) => item.id);

const TermsPage = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const activeId = useActiveSection(SECTION_IDS);

  return (
    <LegalLayout title="Terms and Conditions" lastUpdated={lastUpdated}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <TableOfContents items={TOC_ITEMS} activeId={activeId} />

        <div className="space-y-0 text-brand-navy/90 leading-7">
          <p className="text-lg leading-8 mb-6">
            These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of Test Report (the &ldquo;Service&rdquo;) operated by Sun Tzu Technologies (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).
          </p>
          <p className="text-lg leading-8 mb-10">
            By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
          </p>

          <LegalSection id="use-of-service">
            <h2 className="text-xl font-bold text-brand-navy mb-4">1. Use of the Service</h2>
            <p className="mb-2">The Service provides a platform for managing test cases, collaboration, and generating reports.</p>
            <p className="mb-2">You agree to use the Service only for lawful purposes and in a manner that does not harm, disrupt, or interfere with other users or system operations.</p>
            <p className="mb-2">You must not:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Attempt to gain unauthorized access to the system</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Abuse system resources or exploit vulnerabilities</li>
              <li>Use the Service for illegal activities</li>
            </ul>
          </LegalSection>

          <LegalSection id="accounts">
            <h2 className="text-xl font-bold text-brand-navy mb-4">2. Accounts</h2>
            <p className="mb-2">To use certain features, you must create an account.</p>
            <p className="mb-2">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Keeping your login credentials secure</li>
              <li>All activities occurring under your account</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
          </LegalSection>

          <LegalSection id="user-content">
            <h2 className="text-xl font-bold text-brand-navy mb-4">3. User Content</h2>
            <p className="mb-2">You retain ownership of any content you upload or create in the Service, including:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Test cases</li>
              <li>Reports</li>
              <li>Attachments</li>
              <li>Project data</li>
            </ul>
            <p className="mb-2">By using the Service, you grant us a limited license to store and process this data solely for providing the Service functionality.</p>
            <p>We do not claim ownership of your data.</p>
          </LegalSection>

          <LegalSection id="service-availability">
            <h2 className="text-xl font-bold text-brand-navy mb-4">4. Service Availability</h2>
            <p className="mb-2">We aim to keep the Service available at all times but do not guarantee uninterrupted access.</p>
            <p className="mb-2">The Service may be:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Updated</li>
              <li>Modified</li>
              <li>Temporarily unavailable for maintenance</li>
            </ul>
            <p>We are not liable for any downtime or data loss beyond reasonable control.</p>
          </LegalSection>

          <LegalSection id="data-backup">
            <h2 className="text-xl font-bold text-brand-navy mb-4">5. Data Backup &amp; Responsibility</h2>
            <p className="mb-2">While we implement reasonable safeguards, users are responsible for maintaining their own backups of critical data.</p>
            <p className="mb-2">We are not liable for loss of data due to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>User actions</li>
              <li>System failure</li>
              <li>External factors beyond our control</li>
            </ul>
          </LegalSection>

          <LegalSection id="termination">
            <h2 className="text-xl font-bold text-brand-navy mb-4">6. Termination</h2>
            <p className="mb-2">We may suspend or terminate access if:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Terms are violated</li>
              <li>The Service is abused</li>
              <li>Security risks are detected</li>
            </ul>
            <p>Users may stop using the Service at any time.</p>
          </LegalSection>

          <LegalSection id="intellectual-property">
            <h2 className="text-xl font-bold text-brand-navy mb-4">7. Intellectual Property</h2>
            <p className="mb-2">All software, design, branding, and platform features belong to Sun Tzu Technologies.</p>
            <p className="mb-2">You may not:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Copy</li>
              <li>Modify</li>
              <li>Reverse engineer</li>
              <li>Redistribute</li>
            </ul>
            <p>any part of the Service without permission.</p>
          </LegalSection>

          <LegalSection id="limitation-of-liability">
            <h2 className="text-xl font-bold text-brand-navy mb-4">8. Limitation of Liability</h2>
            <p className="mb-2">The Service is provided &ldquo;as is&rdquo; without warranties of any kind.</p>
            <p className="mb-2">To the maximum extent permitted by law, we are not liable for:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Indirect damages</li>
              <li>Data loss</li>
              <li>Business interruption</li>
              <li>Profit loss</li>
            </ul>
            <p>resulting from use of the Service.</p>
          </LegalSection>

          <LegalSection id="changes-to-terms">
            <h2 className="text-xl font-bold text-brand-navy mb-4">9. Changes to Terms</h2>
            <p className="mb-2">We may update these Terms at any time.</p>
            <p>Continued use of the Service after updates means you accept the revised Terms.</p>
          </LegalSection>

          <LegalSection id="contact">
            <h2 className="text-xl font-bold text-brand-navy mb-4">10. Contact</h2>
            <p className="mb-2">For questions regarding these Terms, contact:</p>
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

export default TermsPage;
