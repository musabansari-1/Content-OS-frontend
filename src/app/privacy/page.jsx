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
    title: "What we collect",
    paragraphs: [
      `${APP_NAME} collects the information you choose to give us when you create an account, connect tools, upload source material, save a voice profile, or contact support.`,
      "That may include your name, email address, billing details, uploaded videos, transcripts, prompts, generated assets, and activity inside the product.",
    ],
  },
  {
    title: "How we use it",
    paragraphs: [
      "We use your information to run the product, sign you in, generate content, personalize your workspace, process billing, and reply to support requests.",
    ],
    items: [
      "Create and manage your account",
      "Generate platform-native content from your source material",
      "Save workspace history, voice settings, and publishing preferences",
      "Keep the product working and help us fix issues",
      "Communicate product updates, service notices, and support responses",
    ],
  },
  {
    title: "How your content is handled",
    paragraphs: [
      "Your uploaded materials and generated outputs are processed so the service can create, store, and organize assets for you.",
      "If we use outside providers for generation, storage, analytics, or billing, we send only the content needed for that task.",
    ],
  },
  {
    title: "When we share data",
    paragraphs: [
      "We do not sell your personal information. We share data only with service providers that help us run the product, like hosting, authentication, payment, and model providers, or when the law requires it.",
      "We may also share information when we need to enforce our terms.",
    ],
  },
  {
    title: "How long we keep it",
    paragraphs: [
      "We keep account information, workspace content, and billing records for as long as we need them to provide the service, meet legal requirements, resolve disputes, and enforce agreements.",
      "You can ask us to delete your account and related data, except for records we must keep for legal, security, or financial reasons.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use password hashing, signed access tokens, protected session cookies, and origin restrictions to help protect your account and data.",
      "No system can guarantee perfect security, so please protect your account credentials and use a strong password.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: [
      "You can update account details, remove connected services, and stop using the product at any time.",
      "Depending on where you live, you may also have rights to access, correct, delete, or object to certain uses of your personal information.",
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
      summary="This policy explains what we collect, how we use it, and the choices you have while using the product."
      effectiveDate="June 18, 2026"
      sections={sections}
    />
  );
}
