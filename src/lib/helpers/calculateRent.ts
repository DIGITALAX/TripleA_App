import { TokenThreshold } from "@/components/Common/types/common.types";
import { Worker } from "@/components/Dashboard/types/dashboard.types";

const calculateRent = (tokenThreshold: TokenThreshold, agent: Worker) => {
  let total = 0;

  if (agent?.publish) {
    total =
      (Number(tokenThreshold?.rentRemix || 0) / 10 ** 18) *
      Number(agent?.publishFrequency || 0);
  }

  if (agent?.remix) {
    total +=
      (Number(tokenThreshold?.rentLead || 0) / 10 ** 18) *
      Number(agent?.leadFrequency || 0);
  }

  if (agent?.lead) {
    total +=
      (Number(tokenThreshold?.rentRemix || 0) / 10 ** 18) *
      Number(agent?.remixFrequency || 0);
  }

  return total;
};

export default calculateRent;
