"use client"
import React, { useState, useEffect, useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
// import Navbar from "@/components/navbar";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";
import Image from "next/image";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { Navbar } from "@/components/navbar";
import { SheetDemo } from "@/components/mobilenavbar";


export default function PortfolioPage() {
  //tracing beam content
  const beam_dummyContent = [
    {
      title: "Lorem Ipsum Dolor Sit Amet",
      description: (
        <>
          <p>
            Sit duis est minim proident non nisi velit non consectetur. Esse
            adipisicing laboris consectetur enim ipsum reprehenderit eu deserunt
            Lorem ut aliqua anim do. Duis cupidatat qui irure cupidatat incididunt
            incididunt enim magna id est qui sunt fugiat. Laboris do duis pariatur
            fugiat Lorem aute sit ullamco. Qui deserunt non reprehenderit dolore
            nisi velit exercitation Lorem qui do enim culpa. Aliqua eiusmod in
            occaecat reprehenderit laborum nostrud fugiat voluptate do Lorem culpa
            officia sint labore. Tempor consectetur excepteur ut fugiat veniam
            commodo et labore dolore commodo pariatur.
          </p>
          <p>
            Dolor minim irure ut Lorem proident. Ipsum do pariatur est ad ad
            veniam in commodo id reprehenderit adipisicing. Proident duis
            exercitation ad quis ex cupidatat cupidatat occaecat adipisicing.
          </p>
          <p>
            Tempor quis dolor veniam quis dolor. Sit reprehenderit eiusmod
            reprehenderit deserunt amet laborum consequat adipisicing officia qui
            irure id sint adipisicing. Adipisicing fugiat aliqua nulla nostrud.
            Amet culpa officia aliquip deserunt veniam deserunt officia
            adipisicing aliquip proident officia sunt.
          </p>
        </>
      ),
      badge: "React",
      image:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=3540&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Lorem Ipsum Dolor Sit Amet",
      description: (
        <>
          <p>
            Ex irure dolore veniam ex velit non aute nisi labore ipsum occaecat
            deserunt cupidatat aute. Enim cillum dolor et nulla sunt exercitation
            non voluptate qui aliquip esse tempor. Ullamco ut sunt consectetur
            sint qui qui do do qui do. Labore laborum culpa magna reprehenderit ea
            velit id esse adipisicing deserunt amet dolore. Ipsum occaecat veniam
            commodo proident aliqua id ad deserunt dolor aliquip duis veniam sunt.
          </p>
          <p>
            In dolore veniam excepteur eu est et sunt velit. Ipsum sint esse
            veniam fugiat esse qui sint ad sunt reprehenderit do qui proident
            reprehenderit. Laborum exercitation aliqua reprehenderit ea sint
            cillum ut mollit.
          </p>
        </>
      ),
      badge: "Changelog",
      image:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=3540&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Lorem Ipsum Dolor Sit Amet",
      description: (
        <>
          <p>
            Ex irure dolore veniam ex velit non aute nisi labore ipsum occaecat
            deserunt cupidatat aute. Enim cillum dolor et nulla sunt exercitation
            non voluptate qui aliquip esse tempor. Ullamco ut sunt consectetur
            sint qui qui do do qui do. Labore laborum culpa magna reprehenderit ea
            velit id esse adipisicing deserunt amet dolore. Ipsum occaecat veniam
            commodo proident aliqua id ad deserunt dolor aliquip duis veniam sunt.
          </p>
        </>
      ),
      badge: "Launch Week",
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=3506&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];


  // Sticky Scroll Reveal
  const content = [
    {
      title: "Collaborative Editing",
      description:
        "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
      content: (
        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
          Collaborative Editing
        </div>
      ),
    },
    {
      title: "Real time changes",
      description:
        "See changes as they happen. With our platform, you can track every modification in real time. No more confusion about the latest version of your project. Say goodbye to the chaos of version control and embrace the simplicity of real-time updates.",
      content: (
        <div className="h-full w-full  flex items-center justify-center text-white">
          <Image
            src="/images/img1.jpg"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            alt="linear board demo"
          />
        </div>
      ),
    },
    {
      title: "Version control",
      description:
        "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
      content: (
        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white">
          Version control
        </div>
      ),
    },
    {
      title: "Running out of content",
      description:
        "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
      content: (
        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
          Running out of content
        </div>
      ),
    },
  ];

  const [showNavbar, setShowNavbar] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // State to track if device is mobile
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

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Assuming mobile width is <= 768px
    };

    // Add event listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkMobile);

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
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
        {/* Render Navbar only if not mobile */}
        {!isMobile && <Navbar />}


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

            {isMobile && <SheetDemo />}

            <TracingBeam className="px-6">
              <div className="max-w-2xl mx-auto antialiased pt-4 relative">
                {beam_dummyContent.map((item, index) => (
                  <div key={`content-${index}`} className="mb-10">
                    <h2 className="bg-black text-white rounded-full text-sm w-fit px-4 py-1 mb-4">
                      {item.badge}
                    </h2>

                    <p className="text-xl mb-4">{item.title}</p>

                    <div className="text-sm  prose prose-sm dark:prose-invert">
                      {item?.image && (
                        <Image
                          src={item.image}
                          alt="blog thumbnail"
                          height="1000"
                          width="1000"
                          className="rounded-lg mb-10 object-cover"
                        />
                      )}
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </TracingBeam>

            <StickyScroll content={content} />


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
