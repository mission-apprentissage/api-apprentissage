import { addJob } from "job-processor";

export const up = async () => {
  await addJob({ name: "import:certifications", payload: { force: true }, queued: false });
};
