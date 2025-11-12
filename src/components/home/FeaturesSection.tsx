import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Feature } from "@/types";
import mediaConfig from "@/data/mediaConfig.json";

// import SVGs as React components
import LegacyIcon from "@/assets/icons/Legacy.svg?react";
import IdeaIcon from "@/assets/icons/Idea.svg?react";
import MentorshipIcon from "@/assets/icons/Mentorship.svg?react";
import TimelessMessageIcon from "@/assets/icons/TimelessMessage.svg?react";


interface FeaturesSectionProps {
  data: {
    title: string;
    items: Feature[];
  };
}

const FeatureIcon = ({ icon }: { icon: string }) => {
  const baseClasses = "h-8 w-8 md:h-10 md:w-10 text-base";
  switch (icon) {
    case "archive":
      return <LegacyIcon className={baseClasses} />;
    case "lightbulb":
      return <IdeaIcon className={baseClasses} />;
    case "users":
      return <MentorshipIcon className={baseClasses} />;
    case "clock":
      return <TimelessMessageIcon className={baseClasses} />;
    default:
      return <LegacyIcon className={baseClasses} />;
  }
};

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ data }) => {
  const navigate = useNavigate();

  // remap titles/links as before
  const updatedFeatures = data.items.map((feature) => {
    let updated = { ...feature };
    if (feature.title === "Knowledge Exchange") {
      updated.title = "Mentorship";
      updated.description =
        "Guidance from experience to ignite your growth.";
      updated.link = "/features/mentorship";
      updated.cta = "Find a Mentor";
    } else if (feature.title === "Legacy") {
      updated.description =
        "Preserve your legacy for future generations.";
      updated.link = "/features/legacy-vault";
      updated.cta = "Create Your Legacy";
    } else if (feature.title === "Timeless Messages") {
      updated.description = "Leave a message that lasts forever.";
      updated.link = "/features/timeless-messages";
      updated.cta = "Create a Timeless Message";
    } else if (feature.title === "Idea") {
      updated.description = "Refine, share, and fund your ideas.";
      updated.link = "/features/idea-vault";
      updated.cta = "Start Your Idea";
    }
    return updated;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };
  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  // video src from mediaConfig
  const videoSrc = mediaConfig.features.backgroundAnimation;

  return (
    // <div
    //   className="min-h-screen flex flex-col items-center justify-center py-16 md:py-20 px-4"
    //   id="features-section"
    // >
    //   <motion.div
    //     initial={{ opacity: 0, y: 20 }}
    //     whileInView={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 0.5 }}
    //     viewport={{ once: true }}
    //     className="text-center mb-8 md:mb-16"
    //   >
    //     <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
    //       {data.title}
    //     </h2>
    //     <div className="h-1 w-20 bg-primary mx-auto" />
    //   </motion.div>

    //   <motion.div
    //     variants={containerVariants}
    //     initial="hidden"
    //     whileInView="visible"
    //     viewport={{ once: true, amount: 0.2 }}
    //     className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto w-full"
    //   >
    //     {updatedFeatures.map((feature) => (
    //       <motion.div key={feature.title} variants={itemVariants}>
    //         <Card
    //           className="relative h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden max-w-[90vw] md:max-w-none mx-auto"
    //           onClick={() => feature.link && navigate(feature.link)}
    //         >
    //           {/* looping background video */}
    //           <video
    //             src={videoSrc}
    //             className="absolute top-0 left-0 w-full h-full object-cover"
    //             autoPlay
    //             loop
    //             muted
    //             playsInline
    //           />

    //           {/* content wrapper to sit above video */}
    //           <div className="relative z-10">
    //             <CardHeader className="pb-1 md:pb-2 text-center px-3 pt-3 md:px-6 md:pt-6">
    //               <div className="flex justify-center mb-2 md:mb-4">
    //                 <FeatureIcon icon={feature.icon} />
    //               </div>
    //               <CardTitle className="text-base md:text-xl">
    //                 {feature.title}
    //               </CardTitle>
    //             </CardHeader>
    //             <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
    //               <p className="text-center text-xs md:text-base">
    //                 {feature.description}
    //               </p>
    //               <motion.div
    //                 className="mt-2 md:mt-4 text-center text-xs md:text-base font-medium"
    //                 initial={{ opacity: 0.7 }}
    //                 whileHover={{ opacity: 1, scale: 1.05 }}
    //               >
    //                 {feature.cta} →
    //               </motion.div>
    //             </CardContent>
    //           </div>
    //         </Card>
    //       </motion.div>
    //     ))}
    //   </motion.div>
    // </div>
  
    // ======= Edited ======

    <div
      className="min-h-screen flex flex-col items-center justify-center py-8 md:py-20 px-4"
      id="features-section"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-4 md:mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-6">
          {data.title}
        </h2>
        <div className="h-1 w-20 bg-primary mx-auto" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8 max-w-6xl mx-auto w-full"
      >
        {updatedFeatures.map((feature) => (
          <motion.div key={feature.title} variants={itemVariants}>
            <Card
              className="relative h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden max-w-[90vw] md:max-w-none mx-auto"
              onClick={() => feature.link && navigate(feature.link)}
            >
              {/* looping background video */}
              <video
                src={videoSrc}
                className="absolute top-0 w-full h-full object-none"
                autoPlay
                loop
                muted
                playsInline
              />

              {/* content wrapper to sit above video */}
              <div className="relative z-10">
                <CardHeader className="pb-1 md:pb-2 text-center px-3 pt-3 md:px-6 md:pt-6">
                  <div className="flex justify-center mb-0 md:mb-4">
                    <FeatureIcon icon={feature.icon} />
                  </div>
                  <CardTitle className="text-base md:text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2 md:px-6 md:pb-6">
                  <p className="text-center text-xs md:text-base">
                    {feature.description}
                  </p>
                  <motion.div
                    className="mt-1 md:mt-4 text-center text-xs md:text-base font-medium"
                    initial={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1, scale: 1.05 }}
                  >
                    {feature.cta} →
                  </motion.div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  
  );
};

export default FeaturesSection;
