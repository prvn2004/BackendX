Android Application Github Repository -> https://github.com/prvn2004/Project24

# BackendX

Auto AI generated project description

**Building an LLM-based AI backend pipeline to process user data, automate follow-ups, summarize, and enable AI-powered personal data queries.**

**Technologies:** Node.js, Android, MongoDB, Google OAuth, Agenda, Socket.io, Firebase Cloud Messaging (FCM)

**Github Link:** In-Progress 

## Project Overview

This project aims to create a robust and intelligent personal AI assistant by leveraging the power of Large Language Models (LLMs). The core functionality revolves around processing user data, automating tasks like follow-ups, generating summaries, and enabling users to query their personal data using natural language.

The backend pipeline is built using Node.js and integrates with various technologies to achieve its goals:

* **Google OAuth and Node.js:** Handle user authentication and authorization.
* **Agenda Schedulers and MongoDB:** Enable scheduled data processing and storage.
* **Socket.io and Firebase Cloud Messaging (FCM):** Facilitate real-time interaction with the LLM pipeline and deliver follow-up notifications.

## Project Structure and Functionality

**1. Core Application Logic:**

* **`controllers`:** 
    * **`commonFunctions`:** Houses shared utility functions used across the application.
    * **`gemini`:** This folder suggests potential integration with a service or library called "Gemini" for tasks related to email automation or NLP processing. Libraries like `geminiAutomationLib` and `geminiLib` indicate functionalities related to task automation and interaction with the Gemini service.
    * **`firebase`:** Manages interactions with Firebase services, primarily for sending notifications via FCM. Files like `chatNotificationCategories.js` and `notificationTypes.js` suggest functionalities related to categorizing and managing notifications.
    * **`Notifications`:** Dedicated to handling user notifications. Files like `newNotification.js` and `deleteSentNotifications.js` likely handle the creation, sending, and management of notifications triggered by the AI pipeline.
    * **`Schedulers`:** Contains logic for scheduling tasks using Agenda. This is crucial for automating data processing, follow-ups, and other time-based actions.
    * **`Socket`:** Implements the websocket server using Socket.io. This enables real-time communication between the frontend (potentially an Android app) and the backend LLM pipeline, allowing for interactive queries and updates. 
* **`models`:** Defines the data structures (models) used to represent entities like users, messages, processed data, follow-ups, etc., stored in MongoDB. 
* **`routes`:** Defines the API endpoints that the application exposes for functionalities like user authentication, data submission, querying the LLM, managing follow-ups, etc.
* **`server.js`:** The entry point of the application. It initializes the server, connects various components, and starts listening for incoming requests.
* **`webSocketServer.js`:**  Specifically manages the websocket server instance, handling the real-time communication aspects with the frontend.

**2. External Services and Integrations:**

* **`firebase_config.json`:**  Configuration file for Firebase integration, containing API keys and project credentials, specifically for FCM.
* **`emailsScheduler.js`:**  Handles the scheduling and sending of emails, potentially integrated with the "Gemini" service for automation.

**3. Project Configuration and Dependencies:**

* **`config.js`:** Contains general application configurations and settings.
* **`package.json` & `package-lock.json`:**  Manage project dependencies and their versions.
* **`.env`:** Stores environment variables (sensitive data like API keys and database credentials).
* **`.gitignore`:** Specifies files and folders that should be ignored by Git.


## Application Flow

1. **User Authentication:** Users authenticate using Google OAuth, managed by the relevant controllers and routes.
2. **Data Submission:** Users submit their data through the defined API endpoints.
3. **Data Processing and LLM Interaction:** The backend pipeline processes the data, potentially involving interaction with an LLM for tasks like summarization, analysis, and answering user queries.
4. **Scheduled Tasks and Follow-ups:** Agenda schedules tasks based on predefined rules or user requests. These tasks might involve further data processing, sending follow-up notifications via FCM, or triggering actions based on LLM outputs.
5. **Real-time Interaction:** Users can interact with the LLM pipeline in real-time through the websocket connection, submitting queries and receiving immediate responses.
6. **Notifications:** FCM delivers notifications to the frontend (e.g., Android app) to inform users about updates, follow-ups, or task completions.

## Future Development

* **Integration with specific LLMs:** Connect the pipeline to powerful LLMs like GPT-4o and Whisper for voice command.
* **Enhanced User Interface:** Develop a user-friendly interface (e.g., web or mobile app) to interact with the AI assistant, submit data, and view results.
* **Expansion of AI Capabilities:**  Implement more sophisticated AI functionalities, like personalized recommendations, sentiment analysis, or automated task completion based on user data and LLM insights.
