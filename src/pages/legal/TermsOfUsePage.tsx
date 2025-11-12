import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfUsePage = () => {
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
        <h1 className="text-3xl font-bold mb-8">MMORTAL Terms of Use</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Effective Date: May 10, 2025
        </p>

        <div className="prose prose-sm max-w-none">
          <p>
            Welcome to MMORTAL. These Terms of Use form a binding legal
            agreement between you and MMortal Ltd. They govern your access to
            and use of our services, platform, website, and all related
            features. By accessing or using MMORTAL, you agree to be bound by
            these Terms, along with our Privacy Policy, Community Guidelines,
            and Copyright Policy.
          </p>

          <p>
            You must be at least 16 years old to use MMORTAL. If you are under
            18, you must have consent from a parent or guardian. If you are
            using MMORTAL on behalf of an organization, you confirm that you are
            authorized to bind that organization to these Terms. MMORTAL does
            not knowingly collect personal data from users under the age of 16.
            If we become aware of such data being collected, we will promptly
            delete it. Any concerns can be sent to privacy@mindmortal.com.
          </p>

          <p>
            MMORTAL offers several core services: the Legacy Vault for storing
            and preserving personal stories and values, the Idea Vault for
            developing and funding innovative ideas, Timeless Messages for
            scheduling messages to be sent in the future, and the Wisdom
            Exchange for connecting mentors and mentees. Each of these features
            is designed to help users share their knowledge, preserve their
            legacy, and foster meaningful collaboration.
          </p>

          <p>
            To use certain features, you may need to create an account. You
            agree to provide accurate information and to keep it updated. You
            are responsible for safeguarding your login credentials and all
            activity under your account. MMORTAL reserves the right to refuse or
            reclaim usernames that are misleading or infringe on another
            person's rights.
          </p>

          <p>
            As a user, you may act as both a Mentor and a Mentee. Mentors may
            publish content and interact with communities. Mentees may follow
            and engage with mentor content and sessions. All interactions must
            be respectful and aligned with our community expectations.
          </p>

          <p>
            You retain ownership of any content you upload to MMORTAL. By
            submitting content, you grant us a non-exclusive, royalty-free,
            global license to store, display, and use it to operate the
            platform. You can delete your content at any time, except in cases
            where it has been publicly shared or collaboratively created.
          </p>

          <p>
            We take your privacy seriously. MMORTAL uses strong encryption and
            complies with data protection regulations, including the UK GDPR, EU
            GDPR, and U.S. privacy laws. For more details, please review our
            Privacy Policy.
          </p>

          <p>
            Timeless Messages are designed to be delivered at a scheduled time
            or after certain events. While we make every effort to ensure
            delivery, we cannot guarantee message delivery in the event of
            technical issues or force majeure.
          </p>

          <p>
            You agree not to use MMORTAL for illegal activities, to post harmful
            or misleading content, infringe on intellectual property rights, or
            tamper with other users' data. Unauthorized commercial use,
            spamming, or harassment will lead to enforcement actions.
          </p>

          <p>
            Mentors and mentees are expected to interact in good faith. MMORTAL
            may suspend or ban users for unprofessional, abusive, or unethical
            behavior, especially within mentorship spaces.
          </p>

          <p>
            We may suspend or terminate your account if you breach these Terms
            or act in a way that disrupts or harms the community or platform.
            This may include removal of your content and loss of access to
            services.
          </p>

          <p>
            These Terms are governed by the laws of the United Kingdom, the
            European Union, and the United States. Users in the UK are subject
            to English law, EU users to their respective country laws under the
            GDPR, and U.S. users to the laws of the State of Delaware.
          </p>

          <p>
            By using MMORTAL, you also agree to our Privacy Policy, Community
            Guidelines, and Copyright Policy, which are incorporated into these
            Terms and carry the same legal weight.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;
