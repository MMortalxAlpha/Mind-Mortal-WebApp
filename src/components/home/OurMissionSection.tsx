import { useEffect, useRef, useState } from "react";
import { useMotionValue, animate } from "framer-motion";

const AnimatedNumber = ({ value, duration = 2 }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [display, setDisplay] = useState(0);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, {
        duration,
        ease: "easeOut",
        onUpdate: (latest) => setDisplay(Math.floor(latest)),
      });
      return () => controls.stop();
    }
  }, [inView, value, duration, motionValue]);

  return (
    <span
      ref={ref}
      className="font-bold text-primary transition-colors duration-400"
    >
      {display.toLocaleString()}
    </span>
  );
};

const OurMissionSection: React.FC = () => {
  return (
    <section className="px-4 flex items-center justify-center min-h-screen bg-yellow-300 dark:bg-zinc-900 text-black dark:text-white transition-colors duration-300">
      <div className="max-w-2xl w-full text-center flex flex-col items-center justify-center">
        <h2 className="text-2xl text-primary md:text-3xl font-bold mb-4">
          Our Mission
        </h2>
        <p className="text-base md:text-lg dark:text-gray-500 font-medium mb-2">
          We aim to inspire{" "}
          <b>
            <AnimatedNumber value={50000} />
          </b>{" "}
          people to start building their legacies,
          <br />
          help{" "}
          <b>
            <AnimatedNumber value={10000} />
          </b>{" "}
          individuals preserve and save their stories for future generations,
          <br />
          and empower{" "}
          <b>
            <AnimatedNumber value={8000} />
          </b>{" "}
          people to benefit from mentorship through <b>MMortal</b>.
        </p>
        <p className="text-gray-500 md:text-lg font-medium mt-6">
          Together, we are creating the world's first legacy network — where
          every story matters.
        </p>
      </div>
    </section>
  );
};

export default OurMissionSection;
