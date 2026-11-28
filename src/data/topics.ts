// Topic hubs (/topics/<slug>) and the single mapping from content to topics.
//
// Assign a page by adding "<collection>/<slug>" to TOPIC_ASSIGNMENTS with the hub group it belongs to.
// Pages that are not listed simply get no topic: the coverage test requires an assignment for every Learn guide,
// study and statistics page. Never edit MDX frontmatter to assign topics.
// Hubs and related reading only ever list pages that getEntries() returns, so scheduled pages appear
// on their publication date with no change here.

export const TOPIC_GROUPS = {
  "job-interviews": ["answers", "nerves-format-bias", "data"],
  "english-learners": ["accent", "listening", "speaking", "data"],
  "teaching-speaking": ["classroom", "young-children", "rehearsal", "research", "teaching-jobs"],
  "fear-of-public-speaking": ["how-common", "what-helps", "delivery"],
  "speaking-at-work": ["meetings", "conversations", "data", "professions"],
} as const;

export type TopicSlug = keyof typeof TOPIC_GROUPS;
export type TopicGroupId<T extends TopicSlug> = (typeof TOPIC_GROUPS)[T][number];

export interface StaticLink {
  href: string;
  title: string;
  description: string;
}

export interface TopicGroup {
  title: string;
  /** Always-live pages (tools, curriculum, data, indexes) listed after the mapped content. */
  links?: StaticLink[];
  /** Adds the N highest-employment published profession guides, computed at build time. */
  topProfessions?: number;
}

export interface Topic<T extends TopicSlug = TopicSlug> {
  slug: T;
  title: string;
  description: string;
  /** 2 to 3 factual sentences. Only state what the linked, already published pages say. */
  intro: string[];
  groups: Record<TopicGroupId<T>, TopicGroup>;
}

type TopicMap = { [T in TopicSlug]: Topic<T> };

export const TOPICS: TopicMap = {
  "job-interviews": {
    slug: "job-interviews",
    title: "Job interviews",
    description:
      "Practice timing a job interview answer and explore research on speaking at work.",
    intro: [
      "Choose an interview question and rehearse your answer aloud.",
      "The timer compares your answer’s length with the practice range for that question.",
    ],
    groups: {
      answers: {
        title: "Preparing your answers",
        links: [
          { href: "/tools/interview-answer-timer", title: "Interview answer timer", description: "Time a practice answer in your browser." },
          { href: "/tools/speech-length-calculator", title: "Estimate the length of a draft answer", description: "Paste a practice answer and choose a speaking pace." },
        ],
      },
      "nerves-format-bias": { title: "Nerves, video formats and accents" },
      data: { title: "Data" },
    },
  },
  "english-learners": {
    slug: "english-learners",
    title: "English learners",
    description:
      "Explore U.S. language statistics and practice clarifying a changed appointment in English.",
    intro: [
      "In the appointment lesson, a caller and a receptionist have different pieces of information.",
      "Use the role cards to practice asking for the time and room, then compare what each person heard.",
    ],
    groups: {
      accent: { title: "Accent and being understood" },
      listening: { title: "Listening and conversation" },
      speaking: { title: "Speaking practice", links: [
        { href: "/curriculum#adult-esl", title: "Clarify a changed appointment", description: "Teach a paired phone conversation in English." },
        { href: "/curriculum/worksheets/adult-esl", title: "Caller and receptionist cards", description: "Print the two roles for the appointment exercise." },
        { href: "/research/agenda", title: "Research on speaking practice", description: "Read the proposed study of spacing practice for adults learning English." },
      ] },
      data: { title: "Data" },
    },
  },
  "teaching-speaking": {
    slug: "teaching-speaking",
    title: "Teaching speaking",
    description:
      "Find a speaking lesson, printable worksheets and research on teaching spoken communication.",
    intro: [
      "Choose a lesson for high school, college, adult English learners or workplace training.",
      "The Institute's review of the evidence considers whether speaking instruction works and states its limits.",
      "The free Teach It Everywhere curriculum includes printable classroom worksheets.",
    ],
    groups: {
      classroom: {
        title: "Oracy and classroom discussion",
        links: [
          {
            href: "/curriculum",
            title: "Teach It Everywhere curriculum",
            description: "Free lessons and printable worksheets for teaching speaking.",
          },
        ],
      },
      "young-children": { title: "Young children" },
      rehearsal: { title: "Rehearsal and feedback" },
      research: { title: "Research" },
      "teaching-jobs": { title: "Speaking in teaching jobs" },
    },
  },
  "fear-of-public-speaking": {
    slug: "fear-of-public-speaking",
    title: "Fear of public speaking",
    description:
      "Read the survey questions behind public-speaking anxiety statistics and try a private self-check.",
    intro: [
      "Survey estimates depend on what people are asked about speaking or performing in public.",
      "The statistics pages give the wording and population behind the numbers.",
    ],
    groups: {
      "how-common": { title: "How common the fear is" },
      "what-helps": {
        title: "Anxiety and practice",
        links: [
          {
            href: "/tools/public-speaking-anxiety-self-check",
            title: "Public speaking anxiety self-check",
            description: "A private self-check that runs in your browser.",
          },
        ],
      },
      delivery: {
        title: "Rehearsal and delivery",
        links: [
          { href: "/tools/speaking-rate-calculator", title: "Speaking rate calculator", description: "Measure your words per minute." },
          { href: "/tools/pause-practice", title: "Pause practice trainer", description: "Practice placing pauses in a passage." },
        ],
      },
    },
  },
  "speaking-at-work": {
    slug: "speaking-at-work",
    title: "Speaking at work",
    description:
      "Look up speaking ratings for U.S. occupations and find examples of conversations on the job.",
    intro: [
      "An Institute analysis of U.S. Department of Labor ratings for 910 occupations finds that 85.5% of matched jobs are in occupations where speaking is at least important.",
      "Use the occupation table to find a job, or open a profession guide for examples of conversations at work.",
    ],
    groups: {
      meetings: { title: "Meetings and leadership" },
      conversations: { title: "Conversations at work" },
      data: {
        title: "Data and research",
        links: [
          {
            href: "/data/speaking-by-occupation",
            title: "Speaking by occupation data",
            description: "Look up speaking ratings for 910 occupations.",
          },
        ],
      },
      professions: {
        title: "Speaking in the largest occupations",
        topProfessions: 18,
        links: [
          {
            href: "/professions",
            title: "All profession guides",
            description: "Every guide to the speaking demands of a job, grouped by field.",
          },
        ],
      },
    },
  },
};

type Assignment = { [T in TopicSlug]?: TopicGroupId<T> };

/** Keyed by "<collection>/<slug>". Every Learn guide, research page and statistics page is listed. */
export const TOPIC_ASSIGNMENTS: Record<string, Assignment> = {
  // Learn
  "learn/accent-vs-intelligibility": { "english-learners": "accent" },
  "learn/can-public-speaking-be-learned": { "fear-of-public-speaking": "what-helps" },
  "learn/do-ai-suggested-replies-change-how-a-message-lands": { "speaking-at-work": "conversations" },
  "learn/do-filler-words-hurt-how-listeners-judge-you": { "fear-of-public-speaking": "delivery" },
  "learn/do-gestures-help-second-language-listening": { "english-learners": "listening" },
  "learn/do-people-who-talk-more-in-meetings-get-seen-as-leaders": { "speaking-at-work": "meetings" },
  "learn/do-students-learn-more-when-they-explain-ideas-out-loud": { "teaching-speaking": "classroom" },
  "learn/do-video-interviews-change-how-job-candidates-are-rated": { "job-interviews": "nerves-format-bias" },
  "learn/does-a-foreign-accent-affect-hiring-decisions": {
    "job-interviews": "nerves-format-bias",
    "english-learners": "accent",
  },
  "learn/does-a-lower-voice-make-people-seem-more-like-leaders": { "speaking-at-work": "meetings" },
  "learn/does-eye-contact-make-a-speaker-more-persuasive": { "speaking-at-work": "conversations" },
  "learn/does-feeling-nervous-hurt-a-job-interview": {
    "job-interviews": "nerves-format-bias",
    "fear-of-public-speaking": "what-helps",
  },
  "learn/does-peer-discussion-help-college-students-learn": { "teaching-speaking": "classroom" },
  "learn/does-practicing-in-virtual-reality-reduce-fear-of-public-speaking": { "fear-of-public-speaking": "what-helps" },
  "learn/does-practicing-speaking-with-an-ai-chatbot-help-english-learners": { "english-learners": "speaking" },
  "learn/does-pronunciation-teaching-help-adults-be-understood": {
    "english-learners": "accent",
    "teaching-speaking": "classroom",
  },
  "learn/does-rehearsing-out-loud-help-you-remember-what-you-plan-to-say": {
    "fear-of-public-speaking": "delivery",
    "teaching-speaking": "rehearsal",
  },
  "learn/does-repeating-the-same-speaking-task-help-english-learners-become-more-fluent": { "english-learners": "speaking" },
  "learn/does-shadowing-help-english-learners-speak-more-clearly": { "english-learners": "speaking" },
  "learn/does-talking-with-young-children-while-reading-build-their-language": { "teaching-speaking": "young-children" },
  "learn/english-captions-for-listening-practice": { "english-learners": "listening" },
  "learn/how-long-should-an-interview-answer-be": { "job-interviews": "answers" },
  "learn/how-many-words-per-minute-should-you-speak": { "fear-of-public-speaking": "delivery" },
  "learn/how-to-ask-a-follow-up-question": { "speaking-at-work": "conversations" },
  "learn/how-to-ask-someone-to-repeat-what-you-missed": {
    "english-learners": "listening",
    "speaking-at-work": "conversations",
  },
  "learn/how-to-disagree-in-a-meeting": { "speaking-at-work": "meetings" },
  "learn/how-to-rehearse-a-presentation-on-video": {
    "fear-of-public-speaking": "delivery",
    "teaching-speaking": "rehearsal",
  },
  "learn/is-public-speaking-the-most-common-fear": { "fear-of-public-speaking": "how-common" },
  "learn/what-is-a-structured-job-interview": { "job-interviews": "answers" },
  "learn/what-is-oracy": { "teaching-speaking": "classroom" },
  "learn/what-to-ask-before-a-meeting-vote": { "speaking-at-work": "meetings" },
  "learn/why-pausing-helps-listeners": { "fear-of-public-speaking": "delivery" },

  // Research
  "research/speaking-at-work-2026": { "speaking-at-work": "data" },
  "research/speaking-demand-over-time": { "speaking-at-work": "data" },
  "research/why-speaking-skills-should-be-taught": { "teaching-speaking": "research", "speaking-at-work": "data" },

  // Statistics
  "statistics/communication-skills-at-work-statistics": { "speaking-at-work": "data", "job-interviews": "data" },
  "statistics/english-learner-communication-statistics": { "english-learners": "data" },
  "statistics/public-speaking-statistics": { "fear-of-public-speaking": "how-common" },
  "statistics/speaking-anxiety-statistics": { "fear-of-public-speaking": "how-common" },

  // Professions. The speaking-at-work hub adds the largest occupations automatically (topProfessions).
  "professions/preschool-teachers": { "teaching-speaking": "teaching-jobs" },
  "professions/elementary-school-teachers": { "teaching-speaking": "teaching-jobs" },
  "professions/middle-school-teachers": { "teaching-speaking": "teaching-jobs" },
  "professions/high-school-teachers": { "teaching-speaking": "teaching-jobs" },
};

export const TOPIC_ORDER: TopicSlug[] = [
  "speaking-at-work",
  "job-interviews",
  "fear-of-public-speaking",
  "english-learners",
  "teaching-speaking",
];
