'use client'

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface RibbonProps {
  projects: {
    id: number;
    title: string;
    slug: string;
    description: string;
    image: string;
    tags: string[];
  }[];
  openProject?: (slug: string) => void;
}

const Ribbon: React.FC<RibbonProps> = ({ projects, openProject }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  const handleClick = (slug: string) => {
    setClickedCard(slug);
    if (openProject) {
      openProject(slug);
    }
  };

  return (
    <div className="w-full bg-[#0A0A0A] py-20 relative overflow-hidden border-y border-white/5">
      {/* Subtle light beams */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-40 left-1/4 w-80 h-[500px] bg-white/30 rotate-12 blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-[500px] bg-white/20 -rotate-12 blur-3xl"></div>
      </div>
      
      <div className="max-w-[2000px] mx-auto px-8 relative z-10">
        <div 
          ref={scrollRef}
          className="overflow-x-auto hide-scrollbar pb-4 -mx-8 px-8"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="flex gap-8 min-w-max">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                layoutId={`project-${project.slug}`}
                className="relative w-[380px] h-[240px] flex-shrink-0 group cursor-pointer"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => handleClick(project.slug)}
              >
                <div className="absolute inset-0 rounded-md overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20 opacity-80 transition-opacity duration-300" />
                  <div className="absolute inset-0 border border-white/10 rounded-md group-hover:border-white/20 transition-colors duration-300" />
                </div>
                
                <motion.div 
                  className="relative h-full flex flex-col justify-end p-7 text-white"
                  animate={{
                    opacity: clickedCard === project.slug ? 0 : 1,
                    transition: { duration: 0.3 }
                  }}
                >
                  <h3 className="text-xl font-light tracking-wide mb-3 transform transition-transform duration-300">
                    {project.title}
                  </h3>
                  
                  <p className="text-sm text-white/60 line-clamp-2 mb-5 opacity-60 group-hover:opacity-90 transition-opacity duration-300">
                    {project.description}
                  </p>
                  
                  <div className="flex gap-2 flex-wrap">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] uppercase tracking-wider px-3 py-1 bg-white/5 group-hover:bg-white/10 rounded-full transition-colors duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <motion.div 
                    className="absolute top-7 right-7 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 group-hover:text-white transition-all duration-500 overflow-hidden"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </motion.svg>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ribbon; 