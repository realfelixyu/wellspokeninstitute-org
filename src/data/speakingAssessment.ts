// Adapted from the rules-based adult speaking self-assessment.
interface QuizQuestion {
  id: string;
  prompt: string;
  options: { label: string; weights: Record<string, number> }[];
}

export const dimensions = {
  structure: "Organization", conciseness: "Brevity", confidence: "Confidence",
  pronunciation: "Clarity", fillerRate: "Managing fillers", pace: "Pacing"
};
export function totalsByWeights(questions: QuizQuestion[], answers: number[]) {
  const totals: Record<string, number> = Object.fromEntries(Object.keys(dimensions).map(key => [key, 0]));
  questions.forEach((question, i) => {
    const choice = question.options[answers[i]];
    if (choice) for (const [key, value] of Object.entries(choice.weights)) totals[key] += value;
  });
  return totals;
}

const p = (dim: string, n: number): Record<string, number> => ({ [dim]: n });

export const HOW_WELL_SPOKEN_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "When you explain something complicated, people:",
    options: [
      { label: "Often lose the thread", weights: p("structure", 0) },
      { label: "Follow most of it", weights: p("structure", 1) },
      { label: "Usually keep up", weights: p("structure", 2) },
      { label: "Can repeat it back to you", weights: p("structure", 3) },
    ],
  },
  {
    id: "q2",
    prompt: "Um, uh, and like show up in your speech:",
    options: [
      { label: "Constantly", weights: p("fillerRate", 0) },
      { label: "A fair amount", weights: p("fillerRate", 1) },
      { label: "Now and then", weights: p("fillerRate", 2) },
      { label: "Rarely", weights: p("fillerRate", 3) },
    ],
  },
  {
    id: "q3",
    prompt: "When you state an opinion, you:",
    options: [
      { label: "Hedge a lot, with just, maybe, I think", weights: p("confidence", 0) },
      { label: "Soften it a little", weights: p("confidence", 1) },
      { label: "Say it fairly directly", weights: p("confidence", 2) },
      { label: "State it plainly and stand behind it", weights: p("confidence", 3) },
    ],
  },
  {
    id: "q4",
    prompt: "In meetings, your points are:",
    options: [
      { label: "Often rambly", weights: p("conciseness", 0) },
      { label: "A bit long", weights: p("conciseness", 1) },
      { label: "Usually tight", weights: p("conciseness", 2) },
      { label: "Short and sharp", weights: p("conciseness", 3) },
    ],
  },
  {
    id: "q5",
    prompt: "When you get nervous, your pace:",
    options: [
      { label: "Speeds way up", weights: p("pace", 0) },
      { label: "Gets a bit fast", weights: p("pace", 1) },
      { label: "Stays about right", weights: p("pace", 2) },
      { label: "Stays slow and steady", weights: p("pace", 3) },
    ],
  },
  {
    id: "q6",
    prompt: "People ask you to repeat yourself:",
    options: [
      { label: "Often", weights: p("pronunciation", 0) },
      { label: "Sometimes", weights: p("pronunciation", 1) },
      { label: "Rarely", weights: p("pronunciation", 2) },
      { label: "Almost never", weights: p("pronunciation", 3) },
    ],
  },
  {
    id: "q7",
    prompt: "Before an important talk, you:",
    options: [
      { label: "Wing it", weights: p("structure", 0) },
      { label: "Jot down a few notes", weights: p("structure", 1) },
      { label: "Outline the key points", weights: p("structure", 2) },
      { label: "Map a clear beginning, middle, and end", weights: p("structure", 3) },
    ],
  },
  {
    id: "q8",
    prompt: "When you lose your train of thought, you:",
    options: [
      { label: "Fill the gap with sounds", weights: p("fillerRate", 0) },
      { label: "Reach for like or you know", weights: p("fillerRate", 1) },
      { label: "Trail off for a second", weights: p("fillerRate", 2) },
      { label: "Pause in silence and pick it back up", weights: p("fillerRate", 3) },
    ],
  },
  {
    id: "q9",
    prompt: "Walking into a high-stakes conversation, you feel:",
    options: [
      { label: "Anxious and unsure", weights: p("confidence", 0) },
      { label: "A little shaky", weights: p("confidence", 1) },
      { label: "Mostly steady", weights: p("confidence", 2) },
      { label: "Calm and ready", weights: p("confidence", 3) },
    ],
  },
  {
    id: "q10",
    prompt: "Asked a yes or no question, you:",
    options: [
      { label: "Give a long preamble first", weights: p("conciseness", 0) },
      { label: "Get there eventually", weights: p("conciseness", 1) },
      { label: "Answer, then explain", weights: p("conciseness", 2) },
      { label: "Answer in a sentence", weights: p("conciseness", 3) },
    ],
  },
  {
    id: "q11",
    prompt: "You use pauses:",
    options: [
      { label: "Almost never", weights: p("pace", 0) },
      { label: "Rarely", weights: p("pace", 1) },
      { label: "Sometimes for effect", weights: p("pace", 2) },
      { label: "Deliberately, to give a point weight", weights: p("pace", 3) },
    ],
  },
  {
    id: "q12",
    prompt: "Your words come out:",
    options: [
      { label: "Mumbled when I am nervous", weights: p("pronunciation", 0) },
      { label: "A bit unclear at speed", weights: p("pronunciation", 1) },
      { label: "Mostly crisp", weights: p("pronunciation", 2) },
      { label: "Clear and easy to follow", weights: p("pronunciation", 3) },
    ],
  },
];
