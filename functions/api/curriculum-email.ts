import { emailCurriculum } from "../../lib/curriculum-delivery.mjs";

export const onRequestPost = ({ request, env }: { request: Request; env: Record<string, unknown> }) =>
  emailCurriculum(request, env);
