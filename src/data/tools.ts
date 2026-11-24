export interface ToolInfo {
  slug: string;
  name: string;
  short: string;
  description: string;
}

export const TOOLS: ToolInfo[] = [
  {
    slug: "speaking-rate-calculator",
    name: "Speaking rate calculator",
    short: "Find your words per minute.",
    description:
      "Paste or time a passage and get your speaking rate in words per minute, with plain-language guidance on pace.",
  },
  {
    slug: "speech-length-calculator",
    name: "Speech length calculator",
    short: "How long will my speech run?",
    description:
      "Paste your script to estimate how many minutes it will take to deliver at slow, typical, and fast speaking rates, including planned pauses.",
  },
  {
    slug: "filler-word-counter",
    name: "Filler word counter",
    short: "Count um, uh, like, and you know.",
    description:
      "Paste a transcript to count filler words and phrases, see them highlighted, and get your rate per 100 words.",
  },
  {
    slug: "interview-answer-timer",
    name: "Interview answer timer",
    short: "Practice answers that land in time.",
    description:
      "Pick a common interview question, answer out loud, and see whether you landed inside a practical time target for that question.",
  },
  {
    slug: "public-speaking-anxiety-self-check",
    name: "Public speaking anxiety self-check",
    short: "A private self-reflection.",
    description:
      "A short self-reflection on how you feel before and during speaking, with practical next steps. Runs entirely in your browser.",
  },
  {
    slug: "speakability-checker",
    name: "Speakability checker",
    short: "Is your script easy to say and hear?",
    description:
      "Checks a script for long sentences, dense words, and hard-to-say phrasing, so listeners can follow it the first time they hear it.",
  },
  {
    slug: "pause-practice",
    name: "Pause practice trainer",
    short: "Practice deliberate pauses.",
    description:
      "Reads your script back in phrases with timed gaps so you can rehearse pausing at natural breaks instead of filling silence.",
  },
  {
    slug: "teleprompter",
    name: "Free teleprompter",
    short: "Scroll your script at speaking pace.",
    description:
      "A distraction-free teleprompter that scrolls at an adjustable words-per-minute rate. Works on phones, tablets, and laptops.",
  },
  {
    slug: "elevator-pitch-builder",
    name: "Elevator pitch builder",
    short: "Structure a 30 to 60 second introduction.",
    description:
      "Answer five short prompts and get a structured spoken introduction you can rehearse, with a timing estimate.",
  },
  {
    slug: "speaking-demand-lookup",
    name: "How much does my job depend on speaking?",
    short: "Look up any occupation.",
    description:
      "Search 900 occupations and see how important speaking is to each one, based on U.S. Department of Labor ratings.",
  },
];
