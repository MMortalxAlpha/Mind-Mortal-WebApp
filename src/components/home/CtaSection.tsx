import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, useMotionValue, animate } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface MetricItem {
  label: string;
  value: string;
}

interface CtaSectionProps {
  data: {
    title: string;
    description: string;
    buttonText: string;
    metrics?: MetricItem[];
  };
}

const CtaSection: React.FC<CtaSectionProps> = ({ data }) => {
  const navigate = useNavigate();

  // Legal page links
  const legalLinks = [
    { title: "Terms of Use", path: "/legal/terms-of-use" },
    { title: "Privacy Policy", path: "/legal/privacy-policy" },
    { title: "Community Guidelines", path: "/legal/community-guidelines" },
    { title: "Copyright Policy", path: "/legal/copyright-policy" },
  ];
  // ==== We aim to inspire 50,000 people=====
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

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center py-20 xs:py-12 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* <h2 className="text-3xl md:text-5xl font-bold mb-6">{data.title}</h2> */}
          {/* <p className="text-lg md:text-xl text-muted-foreground mb-2 lg:mb-10 max-w-2xl mx-auto">
            {data.description}
          </p> */}
          <h2 className="text-3xl text-primary md:text-5xl font-bold mb-6">
            Our Mission
          </h2>
          <div className="h-1 w-20 mb-6 bg-primary mx-auto" />
                
          {/* we aim to inspire    start  */}

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

          {/* we aim to inspire end  */}

          <div className="my-8 xs:mb-4">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-lg bg-[#F97316] hover:bg-[#F97316]/90"
              onClick={() => navigate("/signup")}
            >
              {data.buttonText}
            </Button>
          </div>

          <p className="text-gray-500 md:text-lg font-medium mt-6">
            Together, we are creating the world's first legacy network — where
            every story matters.
          </p>

          {/* {data.metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xs:mt-8">
              {data.metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="font-bold text-4xl text-primary mb-2">
                    {metric.value}
                  </div>
                  <div className="text-muted-foreground">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          )} */}

          {/* Legal Links Section */}
          <div className="mt-4 lg:mt-12">
            <Separator className="mb-8 md:mb-4 xs:mb-4" />
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 xs:gap-0">
              {legalLinks.map((link, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="link"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => navigate(link.path)}
                  >
                    {link.title}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CtaSection;
