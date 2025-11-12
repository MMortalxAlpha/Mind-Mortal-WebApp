import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CopyrightPolicyPage = () => {
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
        <h1 className="text-3xl font-bold mb-8">MMORTAL Copyright Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: May 10, 2025
        </p>

        <div className="prose prose-sm max-w-none">
          <p>
            At MMORTAL, we are committed to respecting the intellectual property
            rights of others. We expect all users of our platform to do the
            same. This Copyright Policy outlines the procedures for addressing
            copyright concerns, including how creators, rights holders, or their
            representatives can report content that they believe infringes their
            rights. This policy is an extension of the MMORTAL Terms of Use.
          </p>

          <p>
            All original materials provided by MMORTAL, including the design of
            our platform, logos, software code, visual assets, and system
            features, are protected by applicable copyright, trademark, and
            intellectual property laws. These materials are the exclusive
            property of MMORTAL and may not be used, copied, or distributed
            without our explicit permission.
          </p>

          <p>
            If you believe that your copyrighted material has been used on
            MMORTAL without permission, you may file a copyright infringement
            notification under the U.S. Digital Millennium Copyright Act (DMCA)
            or similar international copyright laws. To file a valid notice,
            send an email to copyright@mindmortal.com. Your notice should
            include your full name and contact information, a clear description
            of the copyrighted work, a direct link or specific reference to the
            content in question, a statement declaring that you have a good
            faith belief that the use is unauthorized, and a declaration under
            penalty of perjury that the information provided is accurate and
            that you are authorized to act on behalf of the copyright owner.
            Your notice must include your physical or electronic signature.
          </p>

          <p>
            Submitting false claims can have legal consequences. Please be aware
            that knowingly misrepresenting material or submitting a fraudulent
            notice may result in legal liability, including penalties under the
            DMCA. We encourage you to consult with a legal professional if you
            are unsure whether your rights have been violated or whether your
            use qualifies as fair use.
          </p>

          <p>
            We enforce a repeat infringer policy. Users who are repeatedly found
            to violate copyright may have their accounts restricted or
            permanently terminated. We also retain the discretion to limit
            access to features or content during our investigation. All
            copyright notices and counterclaims are documented to evaluate
            patterns of repeated infringement.
          </p>

          <p>
            If your content has been removed due to a copyright complaint and
            you believe it was removed in error, you may submit a
            counter-notification. If we receive a valid counter-notice, we may
            reinstate the content unless the original claimant pursues legal
            action. Again, we strongly advise seeking legal counsel before
            submitting a counter-notice.
          </p>

          <p>
            This policy does not limit your rights under the fair use or fair
            dealing doctrines. These legal exceptions allow for certain uses of
            copyrighted material without prior permission. However, users
            relying on fair use must do so responsibly and are encouraged to
            provide context or attribution where possible. We review these cases
            carefully and may request additional information when necessary.
          </p>

          <p>
            To report a copyright concern or request additional information,
            please contact us at copyright@mindmortal.com. We aim to handle each
            case promptly, respectfully, and in accordance with applicable law.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CopyrightPolicyPage;
