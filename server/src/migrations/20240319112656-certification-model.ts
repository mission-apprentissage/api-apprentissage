import { addJob } from "job-processor";

export const up = async () => {
  return addJob({
    name: "import:certifications",
    payload: {
      force: true,
    },
    queued: true,
  });
};
