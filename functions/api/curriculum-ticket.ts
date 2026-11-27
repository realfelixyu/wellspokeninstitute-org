import { openCurriculumLink } from "../../lib/curriculum-delivery.mjs";

export const onRequestGet = ({ request }: { request: Request }) => openCurriculumLink(request);
