export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";
export const GROVE_GATEWAY: string = "https://api.grove.storage/";

export const IPFS_REGEX: RegExp = /\b(Qm[1-9A-Za-z]{44}|ba[A-Za-z2-7]{57})\b/;
export const MONA: `0x${string}` = "0x28547B5b6B405A1444A17694AC84aa2d6A03b3Bd";
export const AGENTS_CONTRACT: `0x${string}` =
  "0x424Fa11D84e5674809Fd0112eBa4f86d6C4ed2aD";
export const SKYHUNTERS_AGENTS_MANAGER_CONTRACT: `0x${string}` =
  "0xDb073899eef2Dcf496Ee987F5238c5E9FE5d5933";
export const MARKET_CONTRACT: `0x${string}` =
  "0x6c7a9d566F6c2a9829B940b7571A220c70817c1a";
export const COLLECTION_MANAGER_CONTRACT: `0x${string}` =
  "0xBa53Fd19053fceFc91D091A02c71AbDcD79d856f";
export const ACCESS_CONTROLS_CONTRACT: `0x${string}` =
  "0x4F276081A4AC2d50eEE2aA6c78a3C4C06AAE9562";
export const AGENT_FEED_RULE: `0x${string}` =
  "0xaf44dc29bF3578127A8971C764CEd7a4e448e31c";
export const ZERO_ADDRESS: `0x${string}` =
  "0x0000000000000000000000000000000000000000";

export const TOKENS: { symbol: string; contract: string; image: string }[] = [
  {
    symbol: "WGHO",
    contract: "0x6bDc36E20D267Ff0dd6097799f82e78907105e2F",
    image: "QmYCDxCv7mJyjn49n84kP6d3ADgGp422ukKzRyd2ZcGEsW",
  },
  {
    symbol: "WETH",
    contract: "0xE5ecd226b3032910CEaa43ba92EE8232f8237553",
    image: "QmYJ6cpGRgQAr2d5hJDJ9CaJukt2szcHc1AqFBy9m6knUw",
  },
  {
    symbol: "MONA",
    contract: "0x28547B5b6B405A1444A17694AC84aa2d6A03b3Bd",
    image: "QmZSDyGYYy9hn8RAUC1vZeZXC5y2H3YimzajJRngCTu5Fq",
  },
  {
    symbol: "BONSAI",
    contract: "0xB0588f9A9cADe7CD5f194a5fe77AcD6A58250f82",
    image: "QmXoAwGW51843qTUxV8pkouewRHDvkyJ3A7tsCUGgGXqVs",
  },
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
  "Once you hit more than one sale on your collection, it's your agent's time to shine.",
  "Your agents earn 10% commission from each sale moving forward.",
  "Every cycle, your agents publish, remix and mint new content related to your Lens collections, attracting new attention.",
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
