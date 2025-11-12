import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 flex items-center gap-2"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">MMORTAL Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: May 10, 2025
        </p>

        <div className="prose prose-sm max-w-none">
          <p>
            At MMortal Ltd., your privacy is important to us. This Privacy
            Policy explains how we collect, use, store, and share your personal
            information through our website (www.mindmortal.com) and related
            services. Your use of MMORTAL is also governed by our Terms of Use,
            which incorporate this Privacy Policy. Any undefined terms used here
            have the same meaning as in the Terms of Use.
          </p>

          <p>
            This policy outlines what personal information we collect, how we
            use and share that information, your choices and rights regarding
            your data, and how we protect it. It applies whenever you interact
            with MMORTAL, whether through browsing, account creation, uploading
            content, or making a purchase.
          </p>

          <p>
            We collect personal information in two main ways: information you
            provide to us directly and information we collect automatically. You
            may share data when you create an account, upload a legacy, share an
            idea, or send a message. This includes your name, email, photos,
            videos, written stories, billing details, subscription preferences,
            and any other information you submit. Automatically, we may collect
            details like your IP address, browser, device type, usage patterns,
            and interaction history using cookies and similar tracking tools.
          </p>

          <p>
            We use your data to help you manage your account, legacy entries,
            messages, and ideas. It enables mentor matching, notifications, and
            improvements to our platform experience. We collect data only when
            we have a lawful reason—such as your consent, the need to deliver a
            service you've requested, or legal compliance.
          </p>

          <p>
            We do not sell your data. However, we may share it with MMORTAL
            affiliates, mentors (if you've subscribed to their content), and
            service providers who assist in operating our platform, such as
            payment processors, hosting services, and analytics tools. If you
            use an integrated platform like YouTube, your data will also be
            governed by that third party's privacy policy. In the case of
            mergers, acquisitions, or legal requests, your data may be shared or
            transferred. We may also use anonymized data for research or
            platform improvement.
          </p>

          <p>
            Cookies help us remember your preferences, keep you logged in, and
            improve platform usage understanding. You can disable them in your
            browser, but some platform features may be limited as a result.
          </p>

          <p>
            We retain your data for as long as your account is active or
            necessary to provide services. If you delete your account, we will
            remove your data unless it's required for legal or operational
            purposes.
          </p>

          <p>
            We take steps to secure your data using encryption, access controls,
            and secure infrastructure. Your MMORTAL account is
            password-protected, and you are responsible for protecting your
            credentials. While we strive to keep your information safe, no
            system is entirely immune to risk.
          </p>

          <p>
            Depending on your location, you may have rights to access, correct,
            delete, or transfer your personal data, or to withdraw consent for
            its use. To exercise any of these rights, contact us at
            privacy@mindmortal.com and we will respond as required by applicable
            law.
          </p>

          <p>
            We may update this policy from time to time. When we do, the revised
            date will be posted here. If changes are significant, we may notify
            you directly through email or the platform. Continued use of MMORTAL
            means you accept the updated terms.
          </p>

          <p>
            If you have any questions about this policy or your personal data,
            contact us at privacy@mindmortal.com or by mail at MMortal Ltd.,
            Melbourne Street, Garth Heads, Newcastle NE1 2JE, United Kingdom.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
