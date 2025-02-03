import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        morado: "#FD91C6",
        crema: "#E8E8E8",
        ligero: "#E3DADA",
        cielo: "#4888BC",
        oscuro: "#58789A",
        mochi: "#73B6DF",
        costa: "#015783",
        mar: "#4BA1D1",
        pink: "#F50092",
        windows: "#0000f5",
      },
      zIndex: {
        200: "200",
      },
      fontFamily: {
        jackey: "Jackey",
        jack: "Jack",
        start: "Start",
        jackey2: "Jackey2",
        arc: "Arcadia",
        nerd: "Nerd",
        nim: "Nimbus",
      },
      fontSize: {
        xxs: "0.6rem",
      },
      cursor: {
        canP: "url('https://thedial.infura-ipfs.io/ipfs/QmRet46G3agnioVtrfgnWKhw5r1FZNqcpDT9xtpbgZ8RB2'), pointer",
        can: "url('https://thedial.infura-ipfs.io/ipfs/QmbCFJeTGrXsP917jhH758BkYKAN12LHJC9qnwysbCdBRb'), default",
      },
    },
  },
  plugins: [],
} satisfies Config;
