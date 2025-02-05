export const downloadEliza = (
  title: string,
  bio: string,
  lore: string,
  knowledge: string,
  messageExamples: {
    user: string;
    content: {
      text: string;
    };
  }[][],
  style: string,
  adjectives: string
) => {
  const jsonStr = JSON.stringify({
    name: title,
    clients: [],
    modelProvider: "openai",
    plugins: [],
    bio: bio.split(/\.|\n/).filter(Boolean),
    lore: lore.split(/\.|\n/).filter(Boolean),
    knowledge: knowledge.split(/\.|\n/).filter(Boolean),
    messageExamples: messageExamples,
    postExamples: [],
    topics: [""],
    style: {
      all: style.split(/\.|\n/).filter(Boolean),
    },
    adjectives: adjectives.split(/\.|\n/).filter(Boolean),
  });
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}-character.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
