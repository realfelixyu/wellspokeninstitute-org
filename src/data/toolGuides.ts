export interface GuideSection {
  heading: string;
  paragraphs: string[];
}

export const TOOL_GUIDES: Record<string, GuideSection[]> = {
  "speaking-rate-calculator": [
    {
      heading: "How to use it",
      paragraphs: [
        "Paste a passage you plan to say, press start, read it aloud at your natural pace, and press stop. The calculator divides the number of words by the time you took. You can also type the number of seconds if you timed yourself elsewhere.",
        "Read the same passage two or three times. Your first run is usually faster than your real delivery because you are focused on the clock.",
      ],
    },
    {
      heading: "What a good pace looks like",
      paragraphs: [
        "There is no single correct speed. The right pace depends on how familiar the material is to your listeners, how large the room is, and whether people are hearing you through a speaker or a video call.",
        "A useful rule: slow down for anything new, technical, or important, and let the pauses do the work. Listeners cannot scroll back, so give them time to absorb each key sentence.",
      ],
    },
  ],
  "speech-length-calculator": [
    {
      heading: "How the estimate works",
      paragraphs: [
        "The calculator counts your words and sentences, divides the words by your speaking rate, and adds your chosen pause after each sentence. It shows the result at your rate and at a slower and faster pace so you can see the range.",
        "For the most accurate estimate, time yourself reading the first paragraph with the speaking rate calculator and enter that rate here.",
      ],
    },
    {
      heading: "Plan for real delivery",
      paragraphs: [
        "Live delivery almost always runs longer than a silent read-through suggests. Audience laughter, slides, questions, and nerves all add time. If you have a hard limit, aim to finish a full rehearsal comfortably under it.",
      ],
    },
  ],
  "filler-word-counter": [
    {
      heading: "How to get a transcript",
      paragraphs: [
        "Record yourself answering a question or giving a short talk, then use any speech-to-text feature (many phones and video call apps have one) to get a transcript. Paste it here. Some transcription tools remove fillers automatically, so check that yours keeps them.",
      ],
    },
    {
      heading: "Should you eliminate filler words?",
      paragraphs: [
        "Not entirely. Words like um and uh are a normal part of spontaneous speech, and a few of them rarely bother listeners. What tends to distract people is a high rate, or fillers clustered at the start of every sentence.",
        "The most reliable replacement for a filler is a short silent pause. Practice pausing on purpose at the end of a thought, and many fillers disappear on their own.",
      ],
    },
  ],
  "interview-answer-timer": [
    {
      heading: "Why time your answers",
      paragraphs: [
        "Interview answers that run too short can sound unprepared, and answers that run too long lose the listener. Practicing with a timer helps you find a length that includes your main point, one concrete example, and a clear finish.",
        "The time targets here are practical practice ranges, not strict rules. Behavioral questions that ask for an example usually need more time than simple fact questions.",
      ],
    },
    {
      heading: "A simple structure",
      paragraphs: [
        "Start with a one-sentence answer, give one specific example with what you did and what happened, then close by connecting it back to the job. Saying the answer aloud several times, not just thinking it through, is what makes it come out smoothly in the room.",
      ],
    },
  ],
  "public-speaking-anxiety-self-check": [
    {
      heading: "About this self-check",
      paragraphs: [
        "This is a reflection exercise to help you notice how speaking affects you. It is not a clinical assessment and it is not a validated research questionnaire. Nothing you select is stored or sent anywhere.",
      ],
    },
    {
      heading: "What tends to help",
      paragraphs: [
        "Nervousness before speaking is extremely common and does not mean you are bad at it. Most people improve with repeated, gradual practice: rehearse out loud, practice in front of one or two supportive people, then take on slightly larger audiences.",
        "If fear of speaking is limiting your work, studies, or daily life, consider talking to a licensed mental health professional.",
      ],
    },
  ],
  "speakability-checker": [
    {
      heading: "Writing for the ear",
      paragraphs: [
        "A script that reads well on paper can be hard to follow out loud. Listeners hear each sentence once, in order, at your pace. Long sentences with several clauses force them to hold too much in memory before the point arrives.",
        "Aim for one idea per sentence, put the main point early, and prefer short, familiar words when a long one is not needed. Then read the script aloud: anywhere you stumble is a place a listener will too.",
      ],
    },
  ],
  "pause-practice": [
    {
      heading: "Why practice pausing",
      paragraphs: [
        "Deliberate pauses give listeners time to absorb a point, make you sound more in control, and give you a moment to breathe and plan the next sentence. Many speakers find silence uncomfortable at first, so practicing it with a timer helps.",
        "The trainer splits your script at punctuation, shows one phrase at a time, and then holds a silent pause. Say each phrase aloud, then stay quiet until the next one appears.",
      ],
    },
  ],
  teleprompter: [
    {
      heading: "Tips for reading naturally",
      paragraphs: [
        "Set the speed a little slower than you think you need, and use larger text than feels necessary so you can glance rather than stare. Put the device as close to your camera or audience sight line as you can.",
        "Write your script the way you talk: short sentences, contractions, and line breaks where you would naturally pause.",
      ],
    },
  ],
  "elevator-pitch-builder": [
    {
      heading: "What makes a spoken introduction work",
      paragraphs: [
        "A good spoken introduction is short, specific, and ends with something the listener can respond to. One concrete detail is more memorable than a list of strengths.",
        "Once you have a version you like, practice saying it out loud until you can deliver it without reading. Then adapt the last line to the person and situation in front of you.",
      ],
    },
  ],
  "speaking-demand-lookup": [
    {
      heading: "Where the numbers come from",
      paragraphs: [
        "The ratings come from the O*NET 31.0 Database, maintained for the U.S. Department of Labor, which surveys workers and job analysts about the skills each occupation requires. Speaking importance is rated from 1 (not important) to 5 (extremely important).",
        "The Speaking Demand Score combines speaking importance, the level of speaking skill required, and the importance of oral expression into a 0 to 100 score. The full method and the downloadable dataset are on our Speaking by Occupation page.",
      ],
    },
  ],
};
