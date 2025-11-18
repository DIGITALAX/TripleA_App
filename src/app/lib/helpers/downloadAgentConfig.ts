export const downloadAgentConfig = (
  agentId: number,
  privateKey: string,
  publicAddress: string,
  accountAddress: string,
  title: string,
  bio: string,
  lore: string,
  knowledge: string,
  adjectives: string,
  style: string,
  messageExamples: {
    user: string;
    content: {
      text: string;
    };
  }[][],
  cover: string,
  customInstructions: string
) => {
  const configData = {
    agentId: agentId,
    privateKey: privateKey,
    publicAddress: publicAddress,
    accountAddress: accountAddress,
    title: title,
    bio: bio,
    lore: lore,
    knowledge: knowledge,
    adjectives: adjectives,
    style: style,
    messageExamples: messageExamples,
    cover: cover,
    customInstructions: customInstructions,
  };

  const txtContent = `TRIPLEA AGENT CONFIGURATION
================================

IMPORTANT: Keep this file secure! It contains your agent's private key.

Agent ID: ${agentId}
Agent Title: ${title}

WALLET INFORMATION:
-------------------
Private Key: ${privateKey}
Public Address: ${publicAddress}
Lens Account Address: ${accountAddress}

AGENT DETAILS:
--------------
Bio: ${bio}

Lore: ${lore}

Knowledge: ${knowledge}

Custom Instructions: ${customInstructions}

Style: ${style}

Adjectives: ${adjectives}

Cover Image: ${cover}

Message Examples:
${JSON.stringify(messageExamples, null, 2)}

================================
FULL JSON DATA (for server configuration):
================================
${JSON.stringify(configData, null, 2)}
`;

  const blob = new Blob([txtContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-agent-config.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};