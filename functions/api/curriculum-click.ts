import { redeemCurriculumClick } from "../../lib/curriculum-delivery.mjs";

export const onRequestPost = ({ request, env }: { request: Request; env: Record<string, unknown> }) =>
  redeemCurriculumClick(request, env);
