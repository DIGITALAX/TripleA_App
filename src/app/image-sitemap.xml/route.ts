import { NextResponse } from "next/server";
import { getAllCollections } from "../../../graphql/queries/getGallery";
import { INFURA_GATEWAY, INFURA_GATEWAY_INTERNAL } from "@/lib/constants";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://triplea.agentmeme.xyz";
  const collectionsData = await getAllCollections();
  const profileCache = new Map<string, string>();
  const collections = collectionsData?.data?.collectionCreateds || [];

  const collectionsXml = await Promise.all(
    collections.map(async (coll: any) => {
      if (!coll?.metadata) {
        const data = await fetch(
          `${INFURA_GATEWAY}/ipfs/${coll?.uri?.split("ipfs://")?.[1]}`
        );
        const res = await data.json();

        coll.metadata = res;
      }

      const rawTitle = coll?.metadata?.title ?? "";
      const image = coll?.metadata?.image?.split("ipfs://")?.[1];
      let username = profileCache?.get(coll?.artist);

      if (!username) {
        const query = `query {
            accountsAvailable(
              request: {
                managedBy: "${coll?.artist}",
                includeOwned: true
              }
            ) {
              items {
                ... on AccountOwned {
                  account {
                 
                    username {
                      value
                    }
                   
                  }
                }
              }
            }
          }`;
        const response = await fetch("https://api.lens.xyz/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        const data = await response.json();

        username =
          data?.data?.accountsAvailable?.items?.[0]?.account?.username?.value?.split(
            "lens/"
          )?.[1];

        profileCache.set(coll?.artist, username as string);
      }

      return `
      <url>
        <loc>${baseUrl}/nft/${username}/${coll.collectionId}/</loc>
        <image:image>
          <image:loc>${INFURA_GATEWAY_INTERNAL}${image}/</image:loc>
          <image:title><![CDATA[${rawTitle} | TripleA | DIGITALAX]]></image:title>
          <image:caption><![CDATA[${rawTitle} | TripleA | DIGITALAX]]></image:caption>
        </image:image>
      </url>
    `;
    })
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset 
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
    >
      ${collectionsXml.join("")}
    </urlset>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
