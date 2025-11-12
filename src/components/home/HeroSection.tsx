import React, { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import BlobLogo from "../BlobLogo";
import { useNavigate } from "react-router-dom";
import mediaConfig from "@/data/mediaConfig.json";

interface HeroSectionProps {
  data: {
    title: string;
    slogans: string[];
    description: string;
    backgroundImages: string[];
  };
  goToSection: (index: number) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ data, goToSection }) => {
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Transform mouse position to rotation values
  const rotateX = useTransform(mouseY, [0, window.innerHeight], [5, -5]);
  const rotateY = useTransform(mouseX, [0, window.innerWidth], [-5, 5]);

  // Load background video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = mediaConfig.hero.backgroundVideo;
      videoRef.current.load();
      videoRef.current.play().catch((error) => {
        console.log("Video autoplay failed:", error);
        // Fallback to image if video fails to play
      });
    }
  }, []);

  // Fix scroll functionality
  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      // If scrolling down, navigate to features section
      if (event.deltaY > 0) {
        document.dispatchEvent(
          new CustomEvent("navigateToSlide", { detail: { index: 1 } })
        );
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, []);

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Static motto - use the first slogan from the array
  const staticMotto = data.slogans[0];

  // Tech-themed floating elements
  const floatingElements = [
    { id: 1, shape: "circle", size: 60, x: 15, y: 20, color: "#F97316" },
    { id: 2, shape: "hexagon", size: 80, x: 85, y: 15, color: "#F97316" },
    { id: 3, shape: "triangle", size: 70, x: 75, y: 75, color: "#F97316" },
    { id: 4, shape: "square", size: 50, x: 20, y: 70, color: "#F97316" },
    { id: 5, shape: "circle", size: 40, x: 50, y: 30, color: "#F97316" },
  ];

  return (
    <div
      className="relative h-screen max-h-screen flex items-center justify-center overflow-hidden px-4"
      onMouseMove={handleMouseMove}
    >
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="absolute inset-0 object-cover w-full h-full opacity-60"
          loop
          muted
          playsInline
        >
          <source type="video/webm" />
          Your browser does not support the video tag.
        </video>

        {/* Fallback image if video fails to load */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage: `url(${mediaConfig.hero.fallbackImage})`,
            filter: "brightness(0.6)",
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* Tech grid overlay */}
      <div className="absolute inset-0 z-0 bg-[url('/Assets/4dc712f6-a086-4f5f-bd6b-3231b62037bb.png')] bg-cover bg-center opacity-10"></div>

      {/* Floating elements */}
      {floatingElements.map((el) => {
        // Shape class based on shape type
        const shapeClass =
          el.shape === "circle"
            ? "rounded-full"
            : el.shape === "square"
            ? "rounded-md"
            : el.shape === "triangle"
            ? "triangle"
            : el.shape === "hexagon"
            ? "hexagon"
            : "rounded-full";

        return (
          <motion.div
            key={el.id}
            className={`absolute ${shapeClass} backdrop-blur-md border`}
            style={{
              width: el.size,
              height: el.size,
              left: `${el.x}%`,
              top: `${el.y}%`,
              backgroundColor: `${el.color}10`,
              borderColor: `${el.color}20`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              x: [0, 20, 0],
              y: [0, -20, 0],
              rotate: [0, 10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 8 + el.id,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{
              scale: 1.2,
              opacity: 0.8,
              boxShadow: `0 0 20px 5px ${el.color}33`,
            }}
            drag
            dragConstraints={{
              top: -100,
              right: 100,
              bottom: 100,
              left: -100,
            }}
            dragElastic={0.3}
          />
        );
      })}

      {/* Content - transparent, directly on background */}
      <motion.div
        className="relative z-10 text-center max-w-4xl"
        style={{
          rotateX,
          rotateY,
          perspective: 1000,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Fixed the logo positioning by adding proper centering classes */}
          <div className="flex justify-center items-center mb-6">
            <BlobLogo size="lg" />
          </div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {data.title}
          </motion.h1>

          <div className="h-16 md:h-20 flex items-center justify-center">
            <motion.h2
              className="text-2xl md:text-4xl font-semibold text-[#F97316] flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {staticMotto}
            </motion.h2>
          </div>

          <motion.p
            className="text-lg md:text-xl text-white/80 mt-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {data.description}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 20px rgba(249, 115, 22, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-[#F97316]/50 text-[#F97316] hover:bg-[#F97316]/10 hover:text-[#F97316] rounded-full"
                onClick={() => goToSection(1)}
              >
                Explore Features
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Tech-themed visual elements */}
      {/* <svg
        className="absolute bottom-10 left-10 w-40 h-40 opacity-10"
        viewBox="0 0 100 100"
      >
        <motion.path
          d="M 10 10 L 90 10 L 90 90 L 10 90 Z"
          stroke="#F97316"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
        />
      </svg>

      <svg
        className="absolute top-10 right-10 w-40 h-40 opacity-10"
        viewBox="0 0 100 100"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          stroke="#F97316"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
        />
      </svg> */}
    </div>
  );
};

export default HeroSection;
