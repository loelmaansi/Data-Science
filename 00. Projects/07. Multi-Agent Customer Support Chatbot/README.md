# 🤖 Real-Time Multi-Agent Customer Support System

This project is a sophisticated, multi-agent customer support chatbot. It is built using **LangGraph** to manage the agent logic and **Streamlit** to provide an interactive, real-time web interface.

Its core function is to intelligently route user queries. A central "Triage Agent" first classifies a user's intent and then dispatches the request to the correct specialized agent—either a **Billing Agent** or a **Technical Agent**.

These specialized agents are empowered with tools to access real-time information. For example, the Billing Agent can call a live **FastAPI** mock server to fetch up-to-date billing data, while the Technical Agent can perform simulated web searches for solutions.

## ✨ Key Features

* **Smart Triage Agent**: Classifies user intent into categories like `billing`, `technical`, `general`, `escalate`, or `close`.
* **Specialized Agents**: Includes a `Billing Agent` and a `Technical Agent`, each with unique tools and instructions.
* **Tool Use for Real-Time Data**:
    * The Billing Agent uses a `check_billing_status` tool to call an external API.
    * The Technical Agent uses a `search_web_for_solution` tool to find technical answers.
* **Human Handoff**: Includes a dedicated path to escalate complex queries that the automated agents cannot resolve.
* **Interactive Chat UI**: A user-friendly chat interface built with Streamlit allows for real-time conversation.
* **Simulated Live API**: A separate FastAPI server (`billing_api.py`) acts as a mock database, allowing the Billing Agent to query for live user data (e.g., "user 12345").
