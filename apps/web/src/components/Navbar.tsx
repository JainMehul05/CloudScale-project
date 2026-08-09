"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useScroll,
  AnimatePresence,
} from "framer-motion";

import {
  Menu,
  X,
  ArrowRight,
} from "lucide-react";


const GITHUB_URL = "YOUR_GITHUB_URL_PLACEHOLDER";


const NAV_LINKS = [
  {
    label: "Product",
    href: "#product",
  },
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "Documentation",
    href: "#",
  },
  {
    label: "GitHub",
    href: GITHUB_URL,
    external: true,
  },
];



function ScrollProgress() {

  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{
        scaleX: scrollYProgress,
      }}
      className="
      fixed
      top-0
      left-0
      right-0
      z-[100]
      h-[2px]
      origin-left
      bg-gradient-to-r
      from-blue-500
      via-cyan-400
      to-violet-500
      "
    />
  );
}




// Custom CloudScale Logo
function Logo() {

  return (

    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >

      <rect
        width="100"
        height="100"
        rx="22"
        fill="white"
      />


      <path
        d="M30 50C30 38.954 38.954 30 50 30C61.046 30 70 38.954 70 50C70 61.046 61.046 70 50 70C38.954 70 30 61.046 30 50Z"
        fill="#2563EB"
      />


      <path
        d="M50 38L62 50L50 62L38 50L50 38Z"
        fill="white"
      />

    </svg>

  );

}





export default function Navbar() {


  const [open,setOpen] = useState(false);

  const [scrolled,setScrolled] =
    useState(false);



  useEffect(()=>{


    const handleScroll = ()=>{

      setScrolled(
        window.scrollY > 20
      );

    };


    handleScroll();


    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive:true,
      }
    );


    return ()=>{

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };


  },[]);




  return (

    <>


      <ScrollProgress />



      <header
        className="
        sticky
        top-0
        z-50
        px-4
        "
      >



        <motion.div

          initial={{
            opacity:0,
            y:-20,
          }}

          animate={{
            opacity:1,
            y:0,
          }}

          transition={{
            duration:0.5,
          }}


          className={`
          mx-auto
          mt-4
          max-w-7xl
          flex
          items-center
          justify-between
          rounded-xl
          border
          px-4
          py-3
          backdrop-blur-xl
          transition-all

          ${
            scrolled
            ?
            `
            bg-black/70
            border-white/10
            shadow-xl
            `
            :
            `
            bg-black/30
            border-white/5
            `
          }

          `}
        >




          {/* LOGO */}


          <a
            href="/"
            className="
            flex
            items-center
            gap-3
            text-white
            "
          >


            <motion.div

              whileHover={{
                scale:1.1,
                rotate:8,
              }}

              transition={{
                type:"spring",
                stiffness:300,
              }}

              className="
              h-9
              w-9
              rounded-lg
              overflow-hidden
              "
            >

              <Logo />

            </motion.div>




            <span
              className="
              text-lg
              font-bold
              tracking-tight
              "
            >
              CloudScale
            </span>


          </a>







          {/* DESKTOP LINKS */}


          <nav
            className="
            hidden
            md:flex
            items-center
            gap-8
            "
          >

            {
              NAV_LINKS.map((link)=>(

                <a

                  key={link.label}

                  href={link.href}

                  target={
                    link.external
                    ?
                    "_blank"
                    :
                    undefined
                  }


                  rel={
                    link.external
                    ?
                    "noopener noreferrer"
                    :
                    undefined
                  }


                  className="
                  text-sm
                  font-medium
                  text-zinc-400
                  transition
                  hover:text-white
                  "

                >

                  {link.label}

                </a>


              ))
            }


          </nav>







          {/* ACTION BUTTONS */}


          <div
            className="
            hidden
            md:flex
            items-center
            gap-3
            "
          >


            <a

              href="#"

              className="
              text-sm
              text-zinc-300
              hover:text-white
              "
            >

              Login

            </a>




            <motion.a

              href="#"

              whileHover={{
                scale:1.05
              }}

              whileTap={{
                scale:0.95
              }}


              className="
              group
              flex
              items-center
              gap-2
              rounded-lg
              bg-white
              px-4
              py-2
              text-sm
              font-semibold
              text-black
              "
            >

              Get Started


              <ArrowRight
                className="
                h-4
                w-4
                transition
                group-hover:translate-x-1
                "
              />


            </motion.a>


          </div>







          {/* MOBILE MENU BUTTON */}


          <button

            onClick={()=>setOpen(!open)}

            className="
            md:hidden
            text-zinc-300
            "

          >

            {
              open
              ?
              <X />
              :
              <Menu />
            }


          </button>




        </motion.div>







        {/* MOBILE MENU */}


        <AnimatePresence>


        {
          open &&

          (

            <motion.div

              initial={{
                opacity:0,
                height:0
              }}

              animate={{
                opacity:1,
                height:"auto"
              }}

              exit={{
                opacity:0,
                height:0
              }}


              className="
              md:hidden
              overflow-hidden
              "
            >


              <div

                className="
                mt-2
                rounded-xl
                border
                border-white/10
                bg-black/90
                p-4
                "
              >


                {
                  NAV_LINKS.map((link)=>(

                    <a

                      key={link.label}

                      href={link.href}

                      onClick={()=>setOpen(false)}

                      className="
                      block
                      rounded-md
                      px-3
                      py-2
                      text-sm
                      text-zinc-300
                      hover:bg-white/5
                      hover:text-white
                      "
                    >

                      {link.label}

                    </a>

                  ))
                }



                <div
                  className="
                  mt-3
                  border-t
                  border-white/10
                  pt-3
                  "
                >


                  <a
                    href="#"
                    className="
                    block
                    text-center
                    py-2
                    text-zinc-300
                    "
                  >
                    Login
                  </a>



                  <a
                    href="#"
                    className="
                    block
                    rounded-md
                    bg-white
                    py-2
                    text-center
                    text-sm
                    font-semibold
                    text-black
                    "
                  >
                    Get Started
                  </a>


                </div>


              </div>


            </motion.div>

          )
        }


        </AnimatePresence>



      </header>


    </>

  );
}