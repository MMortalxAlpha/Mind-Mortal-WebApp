import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CommunityGuidelinesPage = () => {
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
        <h1 className="text-3xl font-bold mb-8">
          MMORTAL Community Guidelines
        </h1>

        <div className="prose prose-sm max-w-none">
          <p>
            MMORTAL is a platform for preserving human value through legacy,
            mentorship, and innovation. We host and protect the stories, ideas,
            and wisdom of individuals across generations and cultures. These
            Community Guidelines define what is and isn't acceptable on MMORTAL.
            By participating in the platform, you agree to follow these
            standards as part of our shared responsibility in creating a
            meaningful and respectful space.
          </p>

          <p>
            We reserve the exclusive right to interpret and enforce these
            guidelines. In doing so, we may consult legal advisors, community
            feedback, historical context, and evolving best practices in digital
            safety and ethics. If you encounter content that may breach these
            guidelines or have questions about how they're applied, please
            contact us at contact@mindmortal.com. If content violates these
            guidelines, we may remove it, restrict its visibility, issue
            warnings, or suspend accounts. These guidelines may be updated over
            time to reflect the growth and evolving needs of our community.
          </p>

          <p>
            These guidelines apply to all content submitted, uploaded,
            transmitted, or otherwise made available by users on MMORTAL. This
            includes public and private posts, comments, multimedia, mentorship
            sessions, time-locked messages, and profile information. Our goal is
            to foster thoughtful contribution and constructive participation.
          </p>

          <p>
            Users must not engage in hate speech or discriminatory practices,
            including content that promotes or condones violence, harassment, or
            discrimination based on race, ethnicity, gender, sexual orientation,
            religion, disability, or age. Harassment, abuse, or threats
            including doxing or stalking are strictly prohibited. Users may not
            distribute misinformation, especially regarding health, science, or
            history, nor plagiarize or misuse others' content without proper
            rights or attribution.
          </p>

          <p>
            MMORTAL is not a platform for adult content, graphic violence, or
            gratuitous suffering. We have a strict no-nudity policy for profile
            images and prohibit sexually exploitative content. While sensitive
            personal stories are welcomed, they must be shared with dignity,
            purpose, and content warnings. Explicit content may be restricted
            from public visibility or removed entirely.
          </p>

          <p>
            Users may not exploit the platform for spam or scams. This includes
            deceptive links, unsolicited promotional material, fraudulent
            fundraising campaigns, or requests for money or data under false
            pretenses. Our community should be free from exploitation and
            manipulation of trust.
          </p>

          <p>
            Mentors and advisors must uphold high professional standards. This
            includes respecting mentee boundaries, avoiding coercive or
            unqualified advice, maintaining confidentiality, and refraining from
            promoting personal businesses unless explicitly requested. All
            mentorship must be grounded in good faith and constructive intent.
          </p>

          <p>
            Respectful participation is expected in all public and private
            interactions. Users should engage in good faith, particularly in
            mentorship sessions and collaborative spaces like the Idea Vault.
            Commentary should remain constructive and appropriate in tone,
            including in messages meant for future release. Trolling, derailing
            conversations, or toxic behavior is not tolerated.
          </p>

          <p>
            MMORTAL may take enforcement actions at its sole discretion,
            including content removal, account suspension, limiting access to
            platform features, or notifying legal authorities. Our moderation
            decisions are guided by our Terms of Use and legal obligations,
            including the UK Online Safety Act, the EU Digital Services Act, and
            U.S. Section 230 of the Communications Decency Act.
          </p>

          <p>
            Users can appeal moderation decisions by writing to
            support@mindmortal.com within 14 days of the notice. Reports of
            violations can be submitted through in-platform tools or by email.
            Every report is reviewed with confidentiality and respect for
            fairness.
          </p>

          <p>
            We may update these guidelines as our platform evolves. Changes will
            be reflected on this page with a revised effective date. Continued
            use of MMORTAL after updates go into effect implies your acceptance
            of the revised Community Guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelinesPage;
