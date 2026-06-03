/**
 * Gemini AI Prompt Templates and Response Schemas
 * Used to ensure structured, predictable outputs from the generative model.
 */

// 1. Schema for question generation
const generateQuestionsSchema = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      description: "List of generated interview questions",
      items: {
        type: "OBJECT",
        properties: {
          id: {
            type: "STRING",
            description: "A unique identifier for the question (e.g. q-1, q-2)"
          },
          question: {
            type: "STRING",
            description: "The interview question text"
          },
          category: {
            type: "STRING",
            description: "Category of the question (e.g., Technical, Behavioral, System Design, Problem Solving)"
          },
          difficulty: {
            type: "STRING",
            description: "Difficulty of the question (e.g., Easy, Medium, Hard)"
          },
          rationale: {
            type: "STRING",
            description: "Brief explanation of why this question is relevant to the candidate's target role or resume"
          }
        },
        required: ["id", "question", "category", "difficulty", "rationale"]
      }
    }
  },
  required: ["questions"]
};

// 2. Schema for answer evaluation
const evaluateAnswerSchema = {
  type: "OBJECT",
  properties: {
    score: {
      type: "INTEGER",
      description: "Score out of 10 indicating the quality of the candidate's answer"
    },
    feedback: {
      type: "STRING",
      description: "Detailed critique of the answer, highlighting what was done well and what was missed"
    },
    exemplaryAnswer: {
      type: "STRING",
      description: "A model answer showing what a perfect response would look like"
    },
    improvementSuggestions: {
      type: "ARRAY",
      description: "Bullet points suggesting specific ways the user can improve their response",
      items: {
        type: "STRING"
      }
    }
  },
  required: ["score", "feedback", "exemplaryAnswer", "improvementSuggestions"]
};

/**
 * Generates prompt for generating interview questions.
 * @param {Object} params
 * @param {string} params.targetRole - Target job role
 * @param {string} params.difficulty - Difficulty level (Easy, Medium, Hard)
 * @param {string} [params.resumeText] - Optional parsed resume text
 * @param {number} [params.count=5] - Number of questions to generate
 * @returns {string} Prompt string
 */
const getQuestionGenerationPrompt = ({ targetRole, difficulty, resumeText = '', count = 5 }) => {
  let prompt = `You are a professional, senior technical interviewer. Generate ${count} interview questions for a candidate applying for the role of "${targetRole}". 
The difficulty level of the questions should be "${difficulty}".`;

  if (resumeText && resumeText.trim().length > 0) {
    prompt += `\n\nHere is the candidate's resume text:
---
${resumeText}
---
Tailor the questions to the candidate's experience, technologies listed, and projects in the resume, while still evaluating core competencies for the "${targetRole}" position. Ensure a balanced mix of technologies mentioned in the resume and general industry standards for a "${difficulty}" level interview.`;
  } else {
    prompt += `\n\nFocus the questions on typical industry standards, concepts, and technical skills expected of a "${targetRole}" at a "${difficulty}" level.`;
  }

  prompt += `\n\nYou must respond ONLY with a JSON object conforming to the specified schema. Each question should have a unique ID, clear question text, its category (e.g. Technical, Behavioral, System Design), its difficulty, and the rationale for asking it.`;
  
  return prompt;
};

/**
 * Generates prompt for evaluating a user's answer.
 * @param {Object} params
 * @param {string} params.question - The interview question
 * @param {string} params.userAnswer - The answer provided by the user
 * @param {string} [params.targetRole] - Target role for context
 * @param {string} [params.difficulty] - Question difficulty level
 * @returns {string} Prompt string
 */
const getAnswerEvaluationPrompt = ({ question, userAnswer, targetRole = 'Software Engineer', difficulty = 'Medium' }) => {
  return `You are a professional technical interviewer grading a candidate's answer.
Target Role: ${targetRole}
Difficulty Level: ${difficulty}

Question:
"${question}"

Candidate's Answer:
"${userAnswer}"

Grade the candidate's answer critically but constructively.
Evaluate it based on:
1. Technical accuracy and depth.
2. Completeness (did they answer all parts of the question?).
3. Communication clarity and structure.

Provide a score from 0 to 10 (where 0 is completely incorrect/empty, and 10 is absolute perfection).
Provide constructive feedback, a model exemplary answer that shows how a senior engineer would respond, and concrete actionable suggestions for improvement.
You must respond ONLY with a JSON object conforming to the specified schema.`;
};

module.exports = {
  generateQuestionsSchema,
  evaluateAnswerSchema,
  getQuestionGenerationPrompt,
  getAnswerEvaluationPrompt
};
