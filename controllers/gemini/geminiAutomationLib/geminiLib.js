const { driver, model, generationConfig } = require('../../../config');
const moment = require('moment');

const geminiLib = {
    storeData: async (data) => {
        try {
            console.log("Storing data:", data);
            const cypherQuery = await generateCypherFromData(data);
            console.log("Generated Cypher query:", cypherQuery);
            const session = driver.session();
            const result = await session.run(cypherQuery);
            console.log("Data stored successfully:", result);
            return { success: true, result };
        } catch (error) {
            console.error("Error storing data in Neo4j:", error);
            return { success: false, error: error.message };
        } finally {
            // await session.close();
            console.log("Session closed.");
        }
    },

    retrieveData: async (query) => {
        const session = driver.session();
        try {
            console.log("Retrieving data with query:", query);
            const result = await session.run(query);
            console.log("Retrieved data:", result);
            const formattedResult = formatNeo4jResult(result);
            console.log("Formatted result:", formattedResult);
            return { success: true, result: formattedResult };
        } catch (error) {
            console.error("Error retrieving data from Neo4j:", error);
            return { success: false, error: error.message };
        } finally {
            await session.close();
            console.log("Session closed.");
        }
    },

    formatTime: (dateTimeString, format) => {
        console.log("Formatting time:", dateTimeString, format);
        return moment(dateTimeString).format(format);
    },

    sendMessage: async (message, recipient) => {
        try {
            console.log("Sending message:", message, "to:", recipient);
            // let info = await transporter.sendMail(mailOptions);
            console.log("Message sent successfully.");
            return { success: true, message: "Message sent successfully."};
        } catch (error) {
            console.error("Error sending message:", error);
            return { success: false, error: error.message };
        }
    }
};

const generateCypherFromData = async (data) => {
    const prompt = `You are a Cypher query generator. Your task is to translate JSON data into a SINGLE valid Cypher query for Neo4j. This query must create a node with appropriate labels and properties.

Important Instructions:

*  The query MUST end with a semicolon (;).
*  Do NOT include ANY additional text, explanations, code block markers, line breaks, or formatting.
*  Your output should be ONLY the pure Cypher query.

Given the following JSON data: \`${JSON.stringify(data)}\`, generate the Cypher query:
`;
 try {
        let chat = await model.startChat({
            generationConfig: generationConfig
        });

        const result = await chat.sendMessage(prompt);

        console.log("Generating Cypher query with prompt:", prompt);

        const geminiResponse = await result.response;
        console.log('Gemini response:', geminiResponse.text());

        console.log("Gemini response:", geminiResponse.text());
        const cypherQuery = geminiResponse.text().trim();
        console.log("Generated Cypher query:", cypherQuery);
        validateCypherQuery(cypherQuery);  // Validate the Cypher query
        return cypherQuery;
    } catch (error) {
        console.error("Error generating Cypher query:", error);
        throw new Error("Failed to generate Cypher query.");
    }
};

const validateCypherQuery = (query) => {
    const validCommands = ['create', 'match', 'merge', 'delete', 'return', 'set'];
    const trimmedQuery = query.trim().toLowerCase();

    if (!validCommands.some(cmd => trimmedQuery.startsWith(cmd))) {
        throw new Error("Invalid Cypher query generated.");
    }

    // Additional checks can be added here
    if (!trimmedQuery.includes(';')) {
        throw new Error("Cypher query should end with a semicolon.");
    }
};

const formatNeo4jResult = (result) => {
    // Implement result formatting logic for Gemini
    return result.records.map(record => {
        let formattedRecord = {};
        record.keys.forEach((key, index) => {
            formattedRecord[key] = record._fields[index];
        });
        return formattedRecord;
    });
};

module.exports = geminiLib;
