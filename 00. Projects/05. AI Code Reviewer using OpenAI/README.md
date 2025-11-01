# 🤖 AI Code Reviewer

This project is a web application built with Streamlit that uses OpenAI's `gpt-4o-mini` to act as an AI-powered Python code reviewer.

The user can paste their Python code into a text area, and the AI will provide a two-part analysis: a detailed **Bug Report** and the complete **Fixed Code**.


## ✨ Features

* **Interactive Web UI**: A simple and clean interface built with Streamlit.
* **AI-Powered Review**: Leverages `gpt-4o-mini` for intelligent code analysis.
* **Structured Output**: The AI is forced by a specific system prompt to provide a consistent, two-part response:
    1.  **Bug Report**: A bulleted list of all issues found (e.g., syntax errors, logic errors, spelling) or a "The code is perfect" message.
    2.  **Fixed Code**: The complete, corrected version of the provided code.

## ⚙️ How It Works

The core of this project is the specific system prompt used to control the AI's behavior.

1.  A user enters their code into the Streamlit `st.text_area`.
2.  When the "Generate" button is pressed, this code is sent as a user message to the OpenAI `chat.completions` API.
3.  The API call includes a detailed **system prompt** that instructs the `gpt-4o-mini` model to act "VERY STRICTLY" as a Python Code Reviewer and to format its entire response *only* in the required two-part "Bug Report" and "Fixed Code" structure.
4.  The raw text response from the AI is then displayed in a `st.code` block.
