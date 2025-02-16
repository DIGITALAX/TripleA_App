"use client";

import { FOOTER_TEXT, INFURA_GATEWAY } from "@/lib/constants";
import Image from "next/legacy/image";
import { FunctionComponent, JSX, useState } from "react";
import { BsDiscord, BsTwitter, BsGithub } from "react-icons/bs";
import MarqueeText from "react-fast-marquee";

const Footer: FunctionComponent = (): JSX.Element => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openDetails, setOpenDetails] = useState<boolean>(false);
  return (
    <div className="relative w-full h-fit bg-gradient-to-r from-[#EA5EFF] to-[#9568F6] border-2 border-black flex flex-col items-center justify-between">
      <div className="relative w-full h-10 flex flex-row text-xs sm:text-base uppercase gap-3 items-center justify-center font-nerd bg-black">
        <div className="relative flex text-[#00FFEE] flex flex-row w-fit h-full items-center justify-center gap-2">
          <div className="relative w-fit h-fit flex">
            <div className="relative w-4 h-4 sm:w-7 sm:h-7 flex">
              <Image
                src={`${INFURA_GATEWAY}/ipfs/Qma5pNQqqy1Z17FwvhvWbFnCxfHk3Bj9gJuift9thVNsWW`}
                draggable={false}
                layout="fill"
              />
            </div>
          </div>
          <div className="relative w-fit h-fit flex whitespace-nowrap">
            NEW AGENT ACTIONS:
          </div>
        </div>
        <div className="relative w-full h-full bg-white flex overflow-x-hidden">
          <MarqueeText
            gradient={false}
            speed={100}
            direction={"left"}
            pauseOnHover
            className="z-0"
          >
            <div
              className="relative w-full h-fit text-black font-arcadia uppercase flex flex-row gap-2 items-center "
              dangerouslySetInnerHTML={{
                __html: `<img style='width: 15px; height: 15px;' src='https://thedial.infura-ipfs.io/ipfs/Qmcwxxf8Ndg9Mj4ny247ZAXTnQ7czHGyU3et7ye6MDrDmn' draggable='false' /> we gave them wallets (whoops) <img src='https://thedial.infura-ipfs.io/ipfs/QmenbMocrCELUVwhGiL1HNFc4LyXCfYVpNGtdm3m4y9mfk' draggable='false' style='width: 15px; height: 15px;' /> vitalik was here <img src='https://thedial.infura-ipfs.io/ipfs/Qmed3dvT7gtuhU6UjjvT9cXu4E5RM8bHgomQE7BvAEqH1H' draggable='false' style='width: 15px; height: 15px;' /> i ❤️ web3 <img src='https://thedial.infura-ipfs.io/ipfs/QmU7oYPQvdQKyRdxG1s54YXNVUVm8XJBUopbTMdJPUzdEj' draggable='false' style='width: 15px; height: 15px;' /> elf needs food badly <img src='https://thedial.infura-ipfs.io/ipfs/Qmcwxxf8Ndg9Mj4ny247ZAXTnQ7czHGyU3et7ye6MDrDmn' draggable='false' style='width: 15px; height: 15px;' /> continue? insert coin. 10... 9... 8... <img src='https://thedial.infura-ipfs.io/ipfs/QmenbMocrCELUVwhGiL1HNFc4LyXCfYVpNGtdm3m4y9mfk' draggable='false' style='width: 15px; height: 15px;' /> deploy agent -> touch grass -> profit  <img src='https://thedial.infura-ipfs.io/ipfs/Qmed3dvT7gtuhU6UjjvT9cXu4E5RM8bHgomQE7BvAEqH1H' draggable='false' style='width: 15px; height: 15px;' /> hello, my name is...  <img src='https://thedial.infura-ipfs.io/ipfs/QmU7oYPQvdQKyRdxG1s54YXNVUVm8XJBUopbTMdJPUzdEj' draggable='false' style='width: 15px; height: 15px;' /> digitalax <img src='https://thedial.infura-ipfs.io/ipfs/Qmcwxxf8Ndg9Mj4ny247ZAXTnQ7czHGyU3et7ye6MDrDmn' draggable='false' style='width: 15px; height: 15px;' /> no tiktok, streaming star <img src='https://thedial.infura-ipfs.io/ipfs/QmenbMocrCELUVwhGiL1HNFc4LyXCfYVpNGtdm3m4y9mfk' draggable='false' style='width: 15px; height: 15px;' /> agent meme <img src='https://thedial.infura-ipfs.io/ipfs/Qmed3dvT7gtuhU6UjjvT9cXu4E5RM8bHgomQE7BvAEqH1H' draggable='false' style='width: 15px; height: 15px;' /> reverse engineering AGI before it's too late <img src='https://thedial.infura-ipfs.io/ipfs/QmU7oYPQvdQKyRdxG1s54YXNVUVm8XJBUopbTMdJPUzdEj' draggable='false' style='width: 15px; height: 15px;' /> probably nothing <img src='https://thedial.infura-ipfs.io/ipfs/Qmcwxxf8Ndg9Mj4ny247ZAXTnQ7czHGyU3et7ye6MDrDmn' draggable='false' style='width: 15px; height: 15px;' /> AI speedrun: art history <img src='https://thedial.infura-ipfs.io/ipfs/QmenbMocrCELUVwhGiL1HNFc4LyXCfYVpNGtdm3m4y9mfk' draggable='false' style='width: 15px; height: 15px;' /> /imagine prompt: getting out-traded by a daemon <img src='https://thedial.infura-ipfs.io/ipfs/Qmed3dvT7gtuhU6UjjvT9cXu4E5RM8bHgomQE7BvAEqH1H' draggable='false' style='width: 15px; height: 15px;' /> too busy trading agents to write this <img src='https://thedial.infura-ipfs.io/ipfs/QmU7oYPQvdQKyRdxG1s54YXNVUVm8XJBUopbTMdJPUzdEj' draggable='false' style='width: 15px; height: 15px;' /> sorry about your reach error <img src='https://thedial.infura-ipfs.io/ipfs/Qmcwxxf8Ndg9Mj4ny247ZAXTnQ7czHGyU3et7ye6MDrDmn' draggable='false' style='width: 15px; height: 15px;' /> i want my mta   <img src='https://thedial.infura-ipfs.io/ipfs/QmenbMocrCELUVwhGiL1HNFc4LyXCfYVpNGtdm3m4y9mfk' draggable='false' style='width: 15px; height: 15px;' /> do not lean on door <img src='https://thedial.infura-ipfs.io/ipfs/Qmed3dvT7gtuhU6UjjvT9cXu4E5RM8bHgomQE7BvAEqH1H' draggable='false' style='width: 15px; height: 15px;' /> skill issue: collecting with agents in 2025 <img src='https://thedial.infura-ipfs.io/ipfs/QmU7oYPQvdQKyRdxG1s54YXNVUVm8XJBUopbTMdJPUzdEj' draggable='false' style='width: 15px; height: 15px;' /> rekt by algorithms you can't collect <img src='https://thedial.infura-ipfs.io/ipfs/Qmcwxxf8Ndg9Mj4ny247ZAXTnQ7czHGyU3et7ye6MDrDmn' draggable='false' style='width: 15px; height: 15px;' /> wizard is about to die <img src='https://thedial.infura-ipfs.io/ipfs/QmenbMocrCELUVwhGiL1HNFc4LyXCfYVpNGtdm3m4y9mfk' draggable='false' style='width: 15px; height: 15px;' /> cope + seethe + deploy agent <img src='https://thedial.infura-ipfs.io/ipfs/Qmed3dvT7gtuhU6UjjvT9cXu4E5RM8bHgomQE7BvAEqH1H' draggable='false' style='width: 15px; height: 15px;' /> autonomous grindset <img src='https://thedial.infura-ipfs.io/ipfs/QmU7oYPQvdQKyRdxG1s54YXNVUVm8XJBUopbTMdJPUzdEj' draggable='false' style='width: 15px; height: 15px;' /> 🌻 Слава Укра<>ні`,
              }}
            ></div>
          </MarqueeText>
        </div>
      </div>
      <div className="relative w-full h-[10rem] sm:h-[20rem] lg:h-[33rem] flex">
        <video
          muted
          autoPlay
          loop
          key={`${INFURA_GATEWAY}/ipfs/Qmcy2HA8ugTTjnsfNieGhAMmLrJvi5MMLSU7iCmTLTJbbA`}
          className="flex object-cover w-full h-full"
          draggable={false}
        >
          <source
            src={`${INFURA_GATEWAY}/ipfs/Qmcy2HA8ugTTjnsfNieGhAMmLrJvi5MMLSU7iCmTLTJbbA`}
          />
        </video>
        <div
          className={`absolute bottom-3 right-3 w-fit h-fit flex cursor-canP ${
            openDetails && "rotate-180"
          }`}
          onClick={() => setOpenDetails(!openDetails)}
        >
          <div
            className={`relative flex ${
              openDetails ? "w-12 h-12" : "w-12 sm:w-20 h-12 sm:h-20"
            }`}
          >
            <Image
              draggable={false}
              src={`${INFURA_GATEWAY}/ipfs/QmbPHZuqofaVWRM4KCMRaqhVrQJvCiUKnrdWZ6jhWmPstZ`}
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
      </div>
      {openDetails && (
        <div className="relative w-full h-fit flex flex-row justify-between items-center gap-6 pb-6 pt-6 px-2 sm:px-6 flex-wrap lg:flex-nowrap">
          <div className="relative w-full h-fit flex justify-between items-center gap-6 lg:flex-row flex-col">
            <div className="relative w-full sm:w-fit h-fit flex items-center justify-center">
              <div className="relative w-full sm:w-72 h-80 flex">
                <Image
                  draggable={false}
                  src={`${INFURA_GATEWAY}/ipfs/QmPmvs2swFozQWvAhbV5kB1tz5AryEydhvYfUw2Eyavi5v`}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>
            <div className="relative w-full sm:w-fit h-full flex items-center md:items-start justify-center md:justify-start flex-row gap-4 xl:flex-nowrap flex-wrap">
              <div className="relative w-full sm:w-fit h-fit flex">
                <div className="w-full sm:w-60 h-60 xl:w-80 xl:h-80 flex items-center justify-center pixel-border-2 rounded-xl relative p-3">
                  <div className="rounded-lg pixel-border-4 relative w-full h-full flex p-1 bg-[#73B6DF]">
                    <div
                      className="relative w-full h-full rounded-md bg-[#0B75FF] border border-black flex overflow-y-scroll break-words p-3 text-base lg:text-lg font-arc text-white whitespace-inline"
                      dangerouslySetInnerHTML={{
                        __html: FOOTER_TEXT[currentPage - 1],
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div
                className="relative w-fit h-fit flex cursor-canP"
                onClick={() =>
                  setCurrentPage(
                    currentPage < FOOTER_TEXT.length ? currentPage + 1 : 1
                  )
                }
              >
                <div className="relative w-20 h-20 flex">
                  <Image
                    draggable={false}
                    src={`${INFURA_GATEWAY}/ipfs/QmbPHZuqofaVWRM4KCMRaqhVrQJvCiUKnrdWZ6jhWmPstZ`}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="relative w-full sm:w-fit h-fit flex">
                <div className="w-full sm:w-60 h-60 xl:w-80 xl:h-80 flex items-center justify-center pixel-border-2 rounded-xl relative p-3">
                  <div className="rounded-lg pixel-border-4 relative w-full h-full flex p-1 bg-[#73B6DF]">
                    <div
                      className="relative w-full h-full rounded-md bg-[#0B75FF] border border-black flex overflow-y-scroll break-words p-3 text-base lg:text-lg font-arc text-white whitespace-inline"
                      dangerouslySetInnerHTML={{
                        __html: FOOTER_TEXT[currentPage],
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative w-full lg:w-fit h-full flex break-all font-jackey2 text-white text-base flex-col justify-between text-center lg:text-right gap-6 lg:items-end items-center">
            <div className="uppercase text-2xl relative w-fit h-fit flex">
              DO YOUR STORIES <br />
              COLLECT THEMSELVES?
            </div>
            <div className="uppercase relative w-fit h-fit flex break-words">
              NOW THEY CAN. BUT YOU NEED AN AGENT TO GET SEEN
            </div>
            <div className="uppercase relative w-fit h-fit flex break-words">
              FUNDED BY SALES AND SOCIAL VIBES
            </div>
            <div className="uppercase relative w-fit h-fit flex break-words">
              BUILT ON THE NEW LENS NETWORK
            </div>
          </div>
        </div>
      )}
      <div className="relative w-full h-20 bg-[#FFD237] flex items-center justify-between font-start text-xxs text-black flex-row px-2 gap-6">
        <div className="relative w-fit h-fit flex flex-row gap-1">
          {[
            {
              link: "https://github.com/digitalax",
              title: "Github",
              component: <BsGithub size={30} color={"black"} />,
            },
            {
              image: "QmR9scKZgM7oYzhdiTGMPjxYU44PqUovzVb6Xef9AYHWJS",
              link: "https://cypher.digitalax.xyz/autograph/digitalax",
              title: "Autograph",
            },
            {
              link: "https://twitter.com/digitalax_",
              title: "Twitter",
              component: <BsTwitter size={30} color={"black"} />,
            },
            {
              link: "https://discord.gg/wz7Bxg4feG",
              title: "Discord",
              component: <BsDiscord size={30} color={"black"} />,
            },
          ].map((elemento, indice) => {
            return (
              <div
                key={indice}
                className="relative w-5 h-5 flex items-center justify-center cursor-canP active:scale-95"
                onClick={() => window.open(elemento.link)}
                title={elemento.title}
              >
                {elemento?.component ? (
                  elemento.component
                ) : (
                  <Image
                    src={`${INFURA_GATEWAY}/ipfs/${elemento.image}`}
                    layout="fill"
                    draggable={false}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="relative w-fit h-fit flex">
          {`${currentPage} / ${FOOTER_TEXT.length}`}
        </div>
      </div>
    </div>
  );
};

export default Footer;
