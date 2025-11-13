import { aaaClient ,graphTripleServer} from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const COLLECTIONS_AGENT = gql`
  query ($skip: Int!, $isAgent: Boolean!) {
    collectionCreateds(first: 10, skip: $skip, where: { isAgent: $isAgent }) {
      id
      artist
      collectionId
      metadata {
        image
        title
        description
      }
      dropId
      amountSold
      amount
      agentIds
      tokenIds
      transactionHash
      uri
      prices {
        price
        token
      }
      isAgent
      blockTimestamp
    }
  }
`;

const COLLECTIONS = gql`
  query ($skip: Int!) {
    collectionCreateds(
      first: 10
      skip: $skip
      orderDirection: desc
      orderBy: blockTimestamp
    ) {
      id
      artist
      collectionId
      metadata {
        image
        title
        description
      }
      dropId
      amountSold
      amount
      agentIds
      tokenIds
      transactionHash
      uri
      prices {
        price
        token
      }
      blockTimestamp
    }
  }
`;

const ALL_COLLECTIONS = gql`
  query {
    collectionCreateds {
      artist
      uri
      collectionId
      metadata {
        title
        image
      }
    }
  }
`;

const COLLECTIONS_ARTIST = gql`
  query ($artist: String!) {
    collectionCreateds(first: 10, where: { artist: $artist }) {
      artist
      id
      uri
      collectionId
      metadata {
        image
      }
    }
  }
`;

const COLLECTIONS_ARTIST_NOT = gql`
  query ($artist: String!) {
    collectionCreateds(first: 10, where: { artist_not: $artist }) {
      artist
      id
      uri
      collectionId
      metadata {
        image
      }
    }
  }
`;

export const getCollections = async (
  skip: number,
  isAgent?: boolean
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = (typeof window === "undefined" ? graphTripleServer : aaaClient).query({
    query: isAgent !== undefined ? COLLECTIONS_AGENT : COLLECTIONS,
    variables: isAgent !== undefined ? { skip, isAgent } : { skip },
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  });

  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      resolve({ timedOut: true });
    }, 60000);
  });

  const result: any = await Promise.race([queryPromise, timeoutPromise]);

  timeoutId && clearTimeout(timeoutId);

  if (result.timedOut) {
    return;
  } else {
    return result;
  }
};

export const getCollectionsArtist = async (
  artist: string
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = (typeof window === "undefined" ? graphTripleServer : aaaClient).query({
    query: COLLECTIONS_ARTIST,
    variables: { artist },
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  });

  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      resolve({ timedOut: true });
    }, 60000);
  });

  const result: any = await Promise.race([queryPromise, timeoutPromise]);

  timeoutId && clearTimeout(timeoutId);

  if (result.timedOut) {
    return;
  } else {
    return result;
  }
};

export const getCollectionsArtistNot = async (
  artist: string
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = (typeof window === "undefined" ? graphTripleServer : aaaClient).query({
    query: COLLECTIONS_ARTIST_NOT,
    variables: { artist },
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  });

  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      resolve({ timedOut: true });
    }, 60000);
  });

  const result: any = await Promise.race([queryPromise, timeoutPromise]);

  timeoutId && clearTimeout(timeoutId);

  if (result.timedOut) {
    return;
  } else {
    return result;
  }
};

export const getAllCollections = async (): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = (typeof window === "undefined" ? graphTripleServer : aaaClient).query({
    query: ALL_COLLECTIONS,
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  });

  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      resolve({ timedOut: true });
    }, 60000);
  });

  const result: any = await Promise.race([queryPromise, timeoutPromise]);

  timeoutId && clearTimeout(timeoutId);

  if (result.timedOut) {
    return;
  } else {
    return result;
  }
};
