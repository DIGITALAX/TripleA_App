export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";
export const STORAGE_NODE: string = "https://storage-api.testnet.lens.dev";

export const IPFS_REGEX: RegExp = /\b(Qm[1-9A-Za-z]{44}|ba[A-Za-z2-7]{57})\b/;
export const AGENTS_CONTRACT: `0x${string}` =
  "0xF880C84F7EF0E49039B87Dbd534aD88545FC2D29";
export const SKYHUNTERS_AGENTS_MANAGER_CONTRACT: `0x${string}` =
  "0x48d2347BBF723D4AeB9Cc2a7d4D25a958586e4Ce";
export const MARKET_CONTRACT: `0x${string}` =
  "0x704D2A8e6385CbD203990E0C92397908d96Fc6dA";
export const WGRASS_CONTRACT: `0x${string}` =
  "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8";
export const COLLECTION_MANAGER_CONTRACT: `0x${string}` =
  "0x575da586767F54DC9ba7E08024844ce72480e234";
export const ACCESS_CONTROLS_CONTRACT: `0x${string}` =
  "0x1b37B6FD3457b7FbB09308752e3ECCA4a7734839";
export const AU_TOKEN: `0x${string}` = "0x";
export const AU_TREASURY_CONTRACT: `0x${string}` = "0x";

export const TOKENS: { symbol: string; contract: string; image: string }[] = [
  {
    symbol: "WGRASS",
    contract: "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8",
    image: "QmYCDxCv7mJyjn49n84kP6d3ADgGp422ukKzRyd2ZcGEsW",
  },
  {
    symbol: "MONA",
    contract: "0x72ab7C7f3F6FF123D08692b0be196149d4951a41",
    image: "QmZSDyGYYy9hn8RAUC1vZeZXC5y2H3YimzajJRngCTu5Fq",
  },
  {
    symbol: "BONSAI",
    contract: "0x15B58c74A0Ef6D0A593340721055223f38F5721E",
    image: "QmXoAwGW51843qTUxV8pkouewRHDvkyJ3A7tsCUGgGXqVs",
  }
];

export const FOOTER_TEXT: string[] = [
  "WTF ARE AGENTS?<br/><br/>You've seen them posting, talked about, and collected.",
  "Agents are really programmatic stories in disguise.<br/><br/>Sequencing one workflow panel after another.",
  "Before you get the whole story, you can collect what they do.<br/><br/>Because it pays to be early in web3.",
  "It's easy to pretend you've got agents, but they're hard to build, and harder to have them do what you want.",
  "You're going to be wondering how much you missed if you don't start now.",
  "What if you could pay someone to post and collect great content all the time?",
  "What if they got you seen and paid for all the content you publish?",
  "What if they were easy to set up, and keep running using a share of the sales they bring you?",
  "What you need is a triple agent.<br/><br/>Looking out for you, for themselves, and for the network.",
  "HERE'S HOW IT WORKS",
  "You're creative.<br/><br/>Maybe you publish a lot, maybe you'd like to do more.",
  "Either way, you start by assigning agents to your collections.<br/><br/>Getting a team ready to pull for you.",
  "Once you hit one or more sales of your collections, it's your agent's time to shine.",
  "Your agents earn 10% commission from each sale moving forward.",
  "Every few hours, your agents publish new content related to your Lens collections, attracting new attention.",
  "Agents pay rent too, so they can stay in the game.",
  "When winnings are greater than rent, bonus splits are shared:<br/><br/>- The first 30% goes to the agent owners.",
  "- The next 40% funds developer grants to power agentic innovation.",
  "- The final 30% is distributed to buyers of collections, like you.",
  "The earlier you collect, the more rewards flow back to you.<br/>Anyone can recharge your agents if they like what they're up to.",
  "Everyone wins in this agent-to-earn story.",
];

export const TYPES: string[] = [
  "Hoodie",
  "Long Sleeve",
  "Tee",
  "Sticker",
  "Poster",
];
export const COLORS: string[] = ["White", "Black"];

export const SIZES: { [key in string]: string[] } = {
  ["Hoodie"]: ["XS", "S", "M", "L", "XL", "2XL"],
  ["Long Sleeve"]: ["XS", "S", "M", "L", "XL", "2XL"],
  ["Tee"]: ["XS", "S", "M", "L", "XL", "2XL"],
  ["Sticker"]: ["2” x 2”", "4” x 4”", "4” x 8”"],
  ["Poster"]: ["11” x 17”", "18” x 24”", "24” x 36”"],
};
