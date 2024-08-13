import { addJob } from "job-processor";

export const up = async () => {
  addJob({
    name: "import:certifications",
    payload: {
      force: true,
    },
    queued: true,
  });
};
