const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const logger = require('../utils/logger');
const AppError = require('../utils/customError');

/**
 * Service to manage PDF extraction.
 */
const resumeService = {
  /**
   * Parse PDF file path and extract raw text contents.
   * @param {string} filePath - Absolute file path to the PDF on disk
   * @returns {Promise<string>} Parsed text contents
   */
  parsePDF: async (filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        throw new AppError('Resume file not found on disk', 404);
      }

      // Read binary buffer
      const dataBuffer = fs.readFileSync(filePath);
      
      // Initialize parser instance with file data buffer
      const parser = new PDFParse({ data: dataBuffer });
      
      // Parse using the parser's getText() method
      const result = await parser.getText();
      
      logger.info(`Successfully parsed PDF. Extracted text length: ${result.text?.length || 0} characters.`);
      
      // Return cleaned/trimmed text content
      return result.text ? result.text.trim() : '';
    } catch (error) {
      logger.error(`PDF parsing service failure: ${error.message}`);
      throw new AppError(`Failed to parse resume: ${error.message}`, 500);
    }
  },
};

module.exports = resumeService;
