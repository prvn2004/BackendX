const neo4j = require('neo4j-driver');
require('dotenv').config(); // Load environment variables from a .env file
const { GoogleGenerativeAI } = require("@google/generative-ai");

const neo4jConfig = {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'your_password',
};

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generationConfig = {
        temperature: 0.3,
        topP: 0.95,
        topK: 64
      };

const generalConfig = {
    maxPasses: parseInt(process.env.MAX_PASSES) || 5,
    max_tokens : 99000
};

const driver = neo4j.driver(neo4jConfig.uri, neo4j.auth.basic(neo4jConfig.user, neo4jConfig.password));

module.exports = { driver, model, generationConfig, generalConfig };
