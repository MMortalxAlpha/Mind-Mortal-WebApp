import CaseStudiesSection from "@/components/home/CaseStudiesSection";
import CtaSection from "@/components/home/CtaSection";
import FeaturedMentorsSection from "@/components/home/FeaturedMentorsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import OurMissionSection from "@/components/home/OurMissionSection";
import HomeNavigation from "@/components/HomeNavigation";
import homeContent from "@/data/homeContent.json";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";

const HomePage: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isMobile = useIsMobile();

  // Transform homeContent.features to match the expected interface
  const featuresData = {
    title: homeContent.features.title,
    items: homeContent.features.items.map((item) => ({
      title: item.title,
      description: item.description,
      icon: item.icon,
      cta: item.link, // Map 'link' to 'cta' to match the Feature interface
      link: item.link, // Also include the link property
    })),
  };

  // Create case studies data from homeContent
  const caseStudiesData = {
    title: "Case Studies",
    studies: [
      {
        title: "Viktor Frankl's Purpose-Driven Legacy",
        description:
          "Psychologist Viktor Frankl, in Man's Search for Meaning, found that purpose—not pleasure—is what sustains humans through suffering and fulfillment. MMortal gives users a concrete way to assign meaning to their life experiences by preserving them for future generations.",
      },
      {
        title: "Nelson Mandela's Legacy of Forgiveness",
        description:
          "Mandela didn't just fight apartheid—he documented his journey through prison, pain, and peace. His letters, preserved during incarceration, became timeless guidance for generations. If Mandela had MMortal, his story wouldn't just be found in books—it would live within an interactive vault, ready for all.",
      },
      {
        title: "Anne Frank's Hidden Genius",
        description:
          "A teenage girl, hiding from genocide, wrote a diary that the world would later call genius. But at the time, it was simply a young girl trying to make sense of the world. MMortal exists to ensure no 'Anne' goes unheard again.",
      },
      {
        title: "The Lost Wisdom of Jamir",
        description:
          "Jamir, a 78-year-old carpenter in Bangladesh, had no formal education but built homes for three generations. When asked what he was most proud of, he said: 'Knowing how to fix what others thought was broken.' He never wrote anything down. After he passed, his grandkids only knew he 'worked with wood.' His philosophy, techniques, and way of looking at life—all lost.",
      },
    ],
  };

  // Create CTA data from homeContent
  const ctaData = {
    title: homeContent.cta.title,
    description: homeContent.cta.description,
    buttonText: homeContent.cta.buttonText,
    metrics: homeContent.cta.goals.map((goal) => ({
      label: goal.title,
      value: goal.target,
    })),
  };

  const sections = [
    {
      component: () => (
        <HeroSection data={homeContent.hero} goToSection={goToSection} />
      ),
      name: "hero",
    },
    {
      component: () => <FeaturesSection data={featuresData} />,
      name: "features",
    },
    { component: FeaturedMentorsSection, name: "mentors" },
    {
      component: () => <CaseStudiesSection data={caseStudiesData} />,
      name: "case-studies",
    },
    { component: () => <CtaSection data={ctaData} />, name: "cta" },
  ];

  const goToSection = useCallback(
    (sectionIndex: number) => {
      if (
        sectionIndex >= 0 &&
        sectionIndex < sections.length &&
        !isTransitioning
      ) {
        setIsTransitioning(true);
        setCurrentSection(sectionIndex);
        setTimeout(() => setIsTransitioning(false), 800);
      }
    },
    [sections.length, isTransitioning]
  );

  const handleNext = useCallback(() => {
    if (currentSection < sections.length - 1) {
      goToSection(currentSection + 1);
    }
  }, [currentSection, sections.length, goToSection]);

  const handlePrevious = useCallback(() => {
    if (currentSection > 0) {
      goToSection(currentSection - 1);
    }
  }, [currentSection, goToSection]);

  // Reset and reprogram mouse wheel or swipe event listener
  useEffect(() => {
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      const deltaY = startY - endY;

      if (Math.abs(deltaY) > 50 && !isTransitioning) {
        if (deltaY > 0 && currentSection < sections.length - 1) {
          handleNext();
        } else if (deltaY < 0 && currentSection > 0) {
          handlePrevious();
        }
      }
    };

    if (isMobile) {
      window.addEventListener("touchstart", handleTouchStart);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentSection, isTransitioning, isMobile]);

  useEffect(() => {
    let wheelTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isTransitioning) return;

      // Clear existing timeout to debounce wheel events
      clearTimeout(wheelTimeout);

      wheelTimeout = setTimeout(() => {
        if (e.deltaY > 0) {
          // Scrolling down
          handleNext();
        } else if (e.deltaY < 0) {
          // Scrolling up
          handlePrevious();
        }
      }, 50); // 50ms debounce
    };

    // Reset keyboard event listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowUp":
          e.preventDefault();
          handlePrevious();
          break;
      }
    };

    // Remove any existing event listeners first
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("keydown", handleKeyDown);

    // Add fresh event listeners with passive: false to allow preventDefault
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      clearTimeout(wheelTimeout);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, handlePrevious, isTransitioning]);

  const CurrentComponent = sections[currentSection].component;

  return (
    <div className="h-screen overflow-hidden relative">
      {/* Home Navigation - Fixed overlay */}
      {isMobile ? (
        <div className="fixed top-4 right-4 z-50">
          <HomeNavigation
            currentSection={currentSection}
            onNavigate={goToSection}
          />
        </div>
      ) : (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <HomeNavigation
            currentSection={currentSection}
            onNavigate={goToSection}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="h-full w-full max-h-screen"
        >
          <CurrentComponent />
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-3">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSection(index)}
            className={`size-2 sm:size-3 rounded-full transition-all duration-300 ${
              currentSection === index
                ? "bg-primary scale-125 border-primary"
                : "bg-gray-300 dark:bg-white/30"
            }`}
            disabled={isTransitioning}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
