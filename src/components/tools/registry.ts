import type { ComponentType } from "react";
import SpeakingRate from "@/components/tools/SpeakingRate";
import SpeechLength from "@/components/tools/SpeechLength";
import FillerCounter from "@/components/tools/FillerCounter";
import InterviewTimer from "@/components/tools/InterviewTimer";
import AnxietyCheck from "@/components/tools/AnxietyCheck";
import Speakability from "@/components/tools/Speakability";
import PausePractice from "@/components/tools/PausePractice";
import Teleprompter from "@/components/tools/Teleprompter";
import PitchBuilder from "@/components/tools/PitchBuilder";
import DemandLookup from "@/components/tools/DemandLookup";

import SpeakingAssessment from "@/components/tools/SpeakingAssessment";

export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "speaking-self-assessment": SpeakingAssessment,
  "speaking-rate-calculator": SpeakingRate,
  "speech-length-calculator": SpeechLength,
  "filler-word-counter": FillerCounter,
  "interview-answer-timer": InterviewTimer,
  "public-speaking-anxiety-self-check": AnxietyCheck,
  "speakability-checker": Speakability,
  "pause-practice": PausePractice,
  teleprompter: Teleprompter,
  "elevator-pitch-builder": PitchBuilder,
  "speaking-demand-lookup": DemandLookup,
};
