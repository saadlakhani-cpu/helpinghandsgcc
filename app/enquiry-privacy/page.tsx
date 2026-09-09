import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Training and Solutions Enquiry Privacy",
  alternates: { canonical: "/enquiry-privacy" },
};
export default function EnquiryPrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-12 leading-7">
        <h1 className="text-3xl font-bold">Enquiry Privacy Notice</h1>
        <p>
          This notice covers training and AI solutions enquiries submitted to
          Helping Hands GCC.
        </p>
        <h2 className="text-xl font-semibold">Information you provide</h2>
        <p>
          We collect your name, email, selected service, company if provided,
          message and the time of your consent. We use this information to
          respond to your enquiry and manage follow-up.
        </p>
        <h2 className="text-xl font-semibold">Storage and access</h2>
        <p>
          Enquiries are stored in our Supabase database and accessed through the
          administrator area. They are not published on the website. Please do
          not include CVs, financial records or confidential company documents
          in your message.
        </p>
        <h2 className="text-xl font-semibold">Website measurement</h2>
        <p>
          Where Google Analytics is active, a successful enquiry records the
          service type and topic. The enquiry form does not send your name,
          email, company or message to Analytics.
        </p>
        <h2 className="text-xl font-semibold">Contact and deletion</h2>
        <p>
          To request a correction or deletion of your enquiry, contact{" "}
          <a
            className="break-all text-finance underline"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <Link
          href="/ai-training"
          className="inline-block text-finance underline"
        >
          Back to AI Training
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
