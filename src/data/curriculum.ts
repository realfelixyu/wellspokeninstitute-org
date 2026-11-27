export const lessons = [
  {
    id: "high-school", audience: "High school", title: "Use evidence in a discussion", duration: "25 minutes",
    goal: "Students can support a proposal with evidence and respond to a classmate’s objection.",
    prompt: "Your school can offer one late bus. In this fictional survey, 18 students asked for a bus after sports and 12 after homework club. The school does not know how many students skipped the survey. Which group should get the bus, and what would change your recommendation?",
    steps: [
      "Give students three minutes to write a recommendation, underline a number that supports it, and name one thing the survey cannot tell them.",
      "In groups of three, each student has one minute to make a case. The next speaker must restate a point they heard before giving their own view. Allow eight minutes for discussion.",
      "Give each group six minutes to draft a joint recommendation. Invite one group to present it and another to ask about the missing evidence.",
      "Use the final eight minutes for individual feedback and a second attempt. Ask each speaker to show where a classmate’s question changed or clarified their reasoning.",
    ],
    lookFor: "Listen for a student who cites the survey, names its limitation and answers another speaker’s actual point.",
  },
  {
    id: "college", audience: "College", title: "Explain a finding to someone outside your course", duration: "20 minutes",
    goal: "A listener can explain what a finding means and where the evidence ends.",
    prompt: "Explain only the example assigned to your pair. In report A, library visits rose from 80 to 100 during a week with longer opening hours. In report B, the tutoring desk counted 60 visits one week and 72 the next after adding evening sessions. Both campus reports are fictional.",
    steps: [
      "Assign report A to half the pairs and report B to the rest. Give presenters three minutes to prepare privately, distinguishing visits from individual visitors. Meanwhile listeners prepare a question to ask if the explanation is unclear.",
      "Allow five minutes for a one-minute explanation, a listener question and written notes. The listener records what changed, by how much, and what remains uncertain. Keep the report out of sight.",
      "Spend five minutes comparing each listener’s notes with what the speaker meant. Mark the phrase that caused the largest misunderstanding.",
      "Use seven minutes to rewrite the unclear phrase. Exchange listeners between an A pair and a B pair. Each presenter repeats the revised explanation for someone who has heard only the other report. Ask that listener to paraphrase the result.",
    ],
    lookFor: "A listener should be able to repeat the change in visits without claiming that the change in hours caused it.",
  },
  {
    id: "adult-esl", audience: "Adult English learners", title: "Clarify a changed appointment", duration: "20 minutes",
    goal: "Both speakers leave a conversation with the same time, place and next action.",
    caller: "Your appointment was Thursday at 10 a.m. Ask when and where to go. Your bus arrives five minutes before the new time. Find out if that gives you enough time.",
    receptionist: "The appointment moved to Friday at 2 p.m. in room 16. Check-in takes ten minutes. Ask the caller to arrive by 1:50 p.m.",
    steps: [
      "Model a two-minute exchange. Write “Did you say…?”, “Could you repeat the room number?” and “So I will…” where everyone can see them.",
      "In pairs, have the caller phone the receptionist from across a table. Give them four minutes to ask questions, then have each partner write the final arrangement independently.",
      "Spend five minutes comparing notes. Where they disagree, the caller asks a specific question and the receptionist answers in different words.",
      "Give the same caller six minutes to make a second call with the original card and check both written arrangements. Use three minutes to compare attempts and share the phrase that resolved the misunderstanding.",
    ],
    lookFor: "Score whether the two written arrangements agree. A regional accent or a request for repetition carries no penalty.",
  },
  {
    id: "workplace", audience: "Workplace training", title: "Hand off an unfinished task", duration: "15 minutes",
    goal: "The incoming colleague can identify the open task, its owner and the decision deadline.",
    prompt: "At shift change a delivery is missing three cartons. A replacement might arrive by 3 p.m. The outgoing colleague has logged the shortage. The incoming colleague must call the supplier at 2 p.m. and tell the supervisor if the cartons will miss dispatch.",
    steps: [
      "Give the outgoing colleague two minutes to mark what is known, what is still uncertain, and who owns the next action.",
      "Allow three minutes for a spoken handoff and read-back. The incoming colleague then writes their first action and its deadline from memory.",
      "Use four minutes to compare the plan with the scenario. The listener names the detail that would have been easiest to miss on a busy shift.",
      "Keep the roles and the scenario. Give the pair four minutes for a second handoff and read-back, then two minutes to compare the listener’s notes from both attempts.",
    ],
    lookFor: "The incoming colleague can name the call, its owner, the 2 p.m. deadline and the condition for notifying the supervisor.",
  },
] as const;
