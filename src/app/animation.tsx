"use client";
import { motion } from "framer-motion";
import { useContext, useEffect } from "react";
import { AnimationContext } from "./providers";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";

export default function Animation({ children }: { children: React.ReactNode }) {
  const context = useContext(AnimationContext);

  useEffect(() => {
    if (context?.pageChange) {
      const timer = setTimeout(() => {
        context?.setPageChange(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [context?.pageChange]);

  return (
    <>
      {context?.pageChange ? (
        <>
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
            }}
            style={{ height: "100%" }}
            className="absolute top-0 left-0 w-1/2 h-full z-100"
          >
            <Image
              src={`${INFURA_GATEWAY}/ipfs/Qma4hocWVFBDDJtHCDEAqBVMiNgsE8Pk5ocyWg6snj4ZPS`}
              layout="fill"
              draggable={false}
            />
          </motion.div>
          <motion.div
            style={{ height: "100%", width: "100%" }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              opacity: context?.pageChange ? 0 : 1,
              scale: context?.pageChange ? 0.2 : 1,
              rotate: context?.pageChange ? 10 : 0,
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
            }}
          >
            {children}
          </motion.div>
          <motion.div
            style={{ height: "100%" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
            }}
            className="absolute top-0 right-0 w-1/2 h-full z-100"
          >
            <Image
              src={`${INFURA_GATEWAY}/ipfs/QmWWkuW45Rj9mmAp6i9bSoTToxKMSpu5U7RkYF5chANCxj`}
              layout="fill"
              draggable={false}
            />
          </motion.div>
        </>
      ) : (
        children
      )}
    </>
  );
}
