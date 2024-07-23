const Tools = {
  BIO: "bio",
  HISTORY: "history",
  TIMELINE: "timeline",
  ASK_USER: "ask_user",
  CURRENT_INFO: "current_info",
  BROWSE: "browse",
  EMAIL: "email",
  CONTACTS: "contacts",
  MESSAGE: "message",
};

function extractMainTextLocal(inputText) {
  const toolRegexString = `tool=(${Object.values(Tools).join("|")})`;

  // Build the regex using the dynamic string
  const extractToolRegex = new RegExp(`${toolRegexString}\\s*:\\s*(.*)`, 'i');

  const match = inputText.match(extractToolRegex);
  return match && match.length >= 3 ? match[2].trim() : ''; // Return empty string if no match
}

function extractFunctionCall(toolCode) {
  const toolRegexString = `tool=(${Object.values(Tools).join("|")})`;

  // Build the regex using the dynamic string
  const extractToolRegex = new RegExp(`${toolRegexString}\\s*:\\s*(.*)`, 'i');
  const match = toolCode.match(extractToolRegex);
  return match ? match[1].trim() : null;
}

function extractMainText(inputText) {
  return extractMainTextLocal(inputText);
}

module.exports = {
  extractFunctionCall,
  extractMainText,
};