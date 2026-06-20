import LegalPageLayout from "../../components/app/LegalPageLayout";
import { APP_NAME, SUPPORT_EMAIL } from "../../lib/appConstants";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata = buildSeoMetadata({
  title: "Privacy Policy",
  description: `Learn how ${APP_NAME} collects, uses, and protects your information.`,
  path: "/privacy",
});

const sections = [
  {
    title: "Information we collect",
    paragraphs: [
      `${APP_NAME} collects the information you provide when you create an account, connect tools, upload source material, save a voice profile, or contact support.`,
      "This may include your name, email address, billing details, uploaded videos, transcripts, prompts, generated assets, and usage activity inside the product.",
    ],
  },
  {
    title: "How we use your information",
    paragraphs: [
      "We use your information to operate the product, generate content, personalize your workspace, process billing, improve reliability, and respond to support requests.",
    ],
    items: [
      "Provide account access and secure authentication",
      "Generate platform-native content from your source material",
      "Save workspace history, voice settings, and publishing preferences",
      "Monitor product performance, prevent abuse, and investigate incidents",
      "Communicate product updates, service notices, and support responses",
    ],
  },
  {
    title: "How your content is handled",
    paragraphs: [
      "Your uploaded materials and generated outputs are processed so the service can create, store, and organize assets for you.",
      "If third-party model or infrastructure providers are used to deliver the service, relevant content may be sent to those subprocessors strictly to power generation, storage, analytics, or billing workflows.",
    ],
  },
  {
    title: "Sharing and disclosure",
    paragraphs: [
      "We do not sell your personal information. We only share data with service providers and partners who help us run the product, such as hosting, analytics, authentication, and payment providers.",
      "We may also disclose information if required by law, to enforce our terms, or to protect the security of the platform and its users.",
    ],
  },
  {
    title: "Data retention",
    paragraphs: [
      "We retain account information, workspace content, and billing records for as long as needed to provide the service, comply with legal obligations, resolve disputes, and enforce agreements.",
      "You can request deletion of your account and associated data, subject to any records we must keep for legal, security, or financial reasons.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use reasonable administrative, technical, and organizational safeguards to protect your information. No system can guarantee absolute security, so you should also protect your account credentials and use strong passwords.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: [
      "You can update account details, remove connected services, and stop using the product at any time. Depending on your location, you may also have rights to access, correct, delete, or object to certain processing of your personal information.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      `If you have privacy questions or requests related to ${APP_NAME}, email ${SUPPORT_EMAIL} or use the support page on the website.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacy Policy"
      title="How we handle your data"
      summary="This policy explains what information we collect, how we use it, and the choices you have when using the product."
      effectiveDate="June 18, 2026"
      sections={sections}
    />
  );
}
