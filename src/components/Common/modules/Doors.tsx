"use client";

import { motion } from "framer-motion";
import Image from "next/legacy/image";
import { JSX, useContext, useEffect, useState } from "react";
import { INFURA_GATEWAY } from "@/lib/constants";
import { AnimationContext } from "@/app/providers";

export default function SlidingDoors({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const animationContext = useContext(AnimationContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  const toggleDoors = (): void => {
    if (initialized) setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(true);
      setInitialized(true);
    }, 500);
  }, []);
  return (
    <>
      {!animationContext?.pageChange && (
        <>
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isOpen ? "-99%" : 0 }}
            transition={{ duration: 6, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-1/2 h-full z-50"
            onClick={() => toggleDoors()}
          >
            <Image
              src={`${INFURA_GATEWAY}/ipfs/Qma4hocWVFBDDJtHCDEAqBVMiNgsE8Pk5ocyWg6snj4ZPS`}
              layout="fill"
                    className="z-50"
              draggable={false}
            />
          </motion.div>
          {children}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isOpen ? "99%" : 0 }}
            transition={{ duration: 6, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-1/2 h-full z-50"
            onClick={() => toggleDoors()}
          >
            <Image
              src={`${INFURA_GATEWAY}/ipfs/QmWWkuW45Rj9mmAp6i9bSoTToxKMSpu5U7RkYF5chANCxj`}
              layout="fill"
              className="z-50"
              draggable={false}
            />
          </motion.div>
        </>
      )}
    </>
  );
}
