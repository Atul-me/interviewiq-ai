const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const logger = require('../utils/logger');
const AppError = require('../utils/customError');
const {
  generateQuestionsSchema,
  evaluateAnswerSchema,
  getQuestionGenerationPrompt,
  getAnswerEvaluationPrompt
} = require('../prompts/promptTemplates');

// Initialize Gemini SDK if API key is provided
let genAI;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    logger.info('Gemini AI Service initialized successfully.');
  } else {
    logger.warn('GEMINI_API_KEY is not configured or has default placeholder value. AI features will fail.');
  }
} catch (error) {
  logger.error('Failed to initialize Gemini AI SDK:', error);
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/**
 * Call Gemini model to generate structured JSON content
 * @param {string} prompt - Input text prompt
 * @param {Object} schema - JSON schema to enforce on the output
 * @param {string} [modelName] - Gemini model variant (reads GEMINI_MODEL env var)
 * @returns {Promise<Object>} Evaluated JSON object response
 */
const generateStructuredJSON = async (prompt, schema, modelName = DEFAULT_MODEL) => {
  if (!genAI) {
    throw new AppError('AI Service is currently unconfigured. Please supply a valid GEMINI_API_KEY in the environment.', 503);
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    logger.info(`Sending request to Gemini model: ${modelName}`);
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.7,
      }
    });

    const response = await result.response;
    const responseText = response.text();
    
    if (!responseText) {
      throw new AppError('Received empty response from Gemini AI service.', 502);
    }

    try {
      const jsonResponse = JSON.parse(responseText);
      return jsonResponse;
    } catch (parseError) {
      logger.error('Failed to parse Gemini JSON output. Raw response:', responseText);
      throw new AppError('AI returned invalid format. Please try again.', 502);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    
    logger.error('Gemini API call failed:', error);
    throw new AppError(`Failed to generate response from AI: ${error.message || 'Unknown error'}`, 500);
  }
};

/**
 * Generate interview questions based on role, difficulty and resume text
 * @param {Object} options
 * @param {string} options.targetRole - Target position
 * @param {string} options.difficulty - Easy, Medium, or Hard
 * @param {string} [options.resumeText] - Extracted resume text
 * @param {number} [options.count=5] - Number of questions to return
 * @returns {Promise<Array>} List of question objects
 */
const generateInterviewQuestions = async ({ targetRole, difficulty, resumeText = '', count = 5 }) => {
  const prompt = getQuestionGenerationPrompt({ targetRole, difficulty, resumeText, count });
  const result = await generateStructuredJSON(prompt, generateQuestionsSchema);
  return result.questions || [];
};

/**
 * Evaluate a user's answer to a question
 * @param {Object} options
 * @param {string} options.question - The question asked
 * @param {string} options.userAnswer - Candidate's input response
 * @param {string} [options.targetRole] - Target position
 * @param {string} [options.difficulty] - Easy, Medium, or Hard
 * @returns {Promise<Object>} Evaluation results containing score, feedback, exemplary answer, and suggestions
 */
const evaluateUserAnswer = async ({ question, userAnswer, targetRole, difficulty }) => {
  const prompt = getAnswerEvaluationPrompt({ question, userAnswer, targetRole, difficulty });
  return await generateStructuredJSON(prompt, evaluateAnswerSchema);
};

/**
 * Transcribe an audio file using Gemini's native multimodal processing capabilities
 * @param {string} filePath - Path to local audio file
 * @param {string} mimeType - Audio mime type
 * @returns {Promise<string>} Transcribed text response
 */
const transcribeAudio = async (filePath, mimeType) => {
  if (!genAI) {
    throw new AppError('AI Service is currently unconfigured. Please supply a valid GEMINI_API_KEY.', 503);
  }

  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    // Read local file and format to inline base64 data for generative model
    const audioData = {
      inlineData: {
        data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
        mimeType,
      },
    };

    logger.info(`Transcribing audio file: ${filePath}`);

    const result = await model.generateContent([
      'You are a professional speech-to-text transcriber. Transcribe this audio recording exactly as spoken. Output ONLY the raw transcribed text. Do not add comments, descriptions, metadata, or corrections.',
      audioData,
    ]);

    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim() === '') {
      throw new AppError('Failed to extract speech from audio file. Please speak clearly.', 400);
    }

    return text.trim();
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Audio transcription failed:', error);
    throw new AppError(`Failed to process voice response: ${error.message || 'Unknown error'}`, 500);
  }
};

module.exports = {
  generateInterviewQuestions,
  evaluateUserAnswer,
  transcribeAudio
};
