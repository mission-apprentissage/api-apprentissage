import { addJob } from "job-processor";

export const up = async () => {
  await addJob({ name: "import:acce", queued: true });
};
