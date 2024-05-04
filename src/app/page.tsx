"use client"
import React, { useState, useEffect, useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Navbar from "@/components/navbar"; // Import the Navbar component
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";

export default function PortfolioPage() {
  const [showNavbar, setShowNavbar] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const refRect = ref.current.getBoundingClientRect();
        const isGeminiEffectVisible =
          refRect.top > window.innerHeight || refRect.bottom < 0;
        setShowNavbar(!isGeminiEffectVisible);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

  return (
    <div>
      <BackgroundBeams />
      <div className="min-h-screen bg-black">
        {showNavbar && <Navbar />}
        <div
          className="h-[200vh] bg-black w-full dark:border dark:border-white/[0.1] rounded-md relative pt-20 overflow-clip"
          ref={ref}
        >
          <GoogleGeminiEffect
            pathLengths={[
              pathLengthFirst,
              pathLengthSecond,
              pathLengthThird,
              pathLengthFourth,
              pathLengthFifth,
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center py-8">
            <h1 className="text-4xl sm:text-7xl font-bold mb-4">
              Abhimanyu Singh
            </h1>
            <p className="text-lg sm:text-xl">AI & Robotics Engineer</p>
            <p className="mt-4">
              Welcome to my portfolio page! Here you'll find some of my recent
              projects and experiences.
            </p>
            <div className="mt-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Projects</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Example project cards */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Project 1</h3>
                  <p>Description of Project 1...</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Project 2</h3>
                  <p>Description of Project 2...</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Skills</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <li>Deep Learning (Tensorflow/Keras/PyTorch)</li>
                <li>Computer Vision (OpenCV/SkImage)</li>
                <li>JavaScript (React, Node.js)</li>
                <li>HTML5 & CSS3 (Tailwind CSS)</li>
                <li>Python (Django)</li>
                <li>Database Management (SQL, MongoDB)</li>
                <li>Version Control (Git)</li>
                <li>Robotics</li>
              </ul>
            </div>
            <div className="mt-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Contact Me
              </h2>
              <p>Email: abhimanyus1997@gmail.com</p>
              {/* <p>Phone: +1234567890</p> */}
              <p>
                LinkedIn:{" "}
                <a href="https://www.linkedin.com/in/abhimanyu-singh/">
                  Abhimanyu Singh
                </a>
              </p>
              <p>
                GitHub:{" "}
                <a href="https://github.com/abhimanyu-singh">abhimanyu-singh</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
