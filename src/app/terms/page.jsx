import LegalPageLayout from "../../components/app/LegalPageLayout";
import { APP_NAME, SUPPORT_EMAIL } from "../../lib/appConstants";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata = buildSeoMetadata({
  title: "Terms of Service",
  description: `Review the terms that govern your use of ${APP_NAME}.`,
  path: "/terms",
});

const sections = [
  {
    title: "Acceptance of terms",
    paragraphs: [
      `By accessing or using ${APP_NAME}, you agree to these Terms of Service. If you do not agree, you should not use the product.`,
    ],
  },
  {
    title: "Using the service",
    paragraphs: [
      `${APP_NAME} helps users turn source content into platform-native assets, organize generated work, and manage related publishing workflows.`,
      "You agree to use the product lawfully, responsibly, and only for content and workflows you have the right to use.",
    ],
    items: [
      "Provide accurate registration and billing information",
      "Maintain the security of your account credentials",
      "Use only content, transcripts, videos, and source materials you own or are authorized to process",
      "Avoid misuse that harms the product, other users, or third-party services",
    ],
  },
  {
    title: "User content and responsibility",
    paragraphs: [
      "You retain responsibility for the content you upload, generate, edit, schedule, or publish through the platform.",
      "You are responsible for reviewing outputs before publication and for ensuring they comply with platform rules, laws, contracts, and applicable disclosure requirements.",
    ],
  },
  {
    title: "Intellectual property",
    paragraphs: [
      `The ${APP_NAME} product, software, branding, and related materials remain the property of the company or its licensors.`,
      "Except for the limited rights needed to operate the service, these terms do not transfer ownership of our software or brand assets to you.",
    ],
  },
  {
    title: "Billing and paid plans",
    paragraphs: [
      "Paid features may require an active subscription or successful checkout. Pricing, plan limits, and features may change over time.",
      "If billing is handled through a third-party payment provider, your purchase may also be subject to that provider's terms and policies.",
    ],
  },
  {
    title: "Availability and changes",
    paragraphs: [
      "We may update, improve, suspend, or remove features at any time. We do not guarantee uninterrupted availability, error-free performance, or that every generated output will meet your expectations.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "We may suspend or terminate access if you violate these terms, create risk for the product or other users, or use the service in a fraudulent, abusive, or unlawful way.",
      "You may stop using the service at any time.",
    ],
  },
  {
    title: "Disclaimers and limitation of liability",
    paragraphs: [
      "The service is provided on an as-is and as-available basis to the fullest extent permitted by law.",
      "To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, data, goodwill, or business opportunities resulting from your use of the product.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      `If you have questions about these terms, contact the ${APP_NAME} team at ${SUPPORT_EMAIL} or through the support page on the website.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Terms of Service"
      title="The rules for using the product"
      summary="These terms explain the responsibilities, limits, and expectations that apply when you use the product."
      effectiveDate="June 18, 2026"
      sections={sections}
    />
  );
}
