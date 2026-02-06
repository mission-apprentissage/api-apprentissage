import { addJob } from "job-processor";

export const up = async () => {
  await addJob({
    name: "import:mission_locale",
    queued: true,
  });
};
