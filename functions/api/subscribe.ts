import { subscribe } from "../../lib/newsletter.mjs";

export const onRequestPost = ({ request, env }: { request: Request; env: Record<string, string> }) =>
  subscribe(request, env);
