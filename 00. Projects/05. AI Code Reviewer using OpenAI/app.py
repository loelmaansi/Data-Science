from openai import OpenAI
import streamlit as st

f = open('keys/openai_api_key.txt')
OPENAI_API_KEY = f.read()

client = OpenAI(api_key = OPENAI_API_KEY)

def code_reviewer(prompt):
    response = client.chat.completions.create(
        model = 'gpt-4o-mini',
        messages = [
            {
                'role': 'system',
                'content': '''You are a Python Code Reviewer.
                              The user will provide Python code. Your response must always have exactly two parts:
                              1. Bug Report:
                              - If the code has issues, list them as short, clear bullet points.
                              - If the code is correct, return "The code is perfect".
                              
                              2. Fixed Code:
                              Provide the corrected version of the code (or the original code if no changes are needed).
                              
                              Important Notes:
                              - Always make sure the code is related to python and act as python reviewer only VERY STRICTLY.
                              - Keep the bug report concise and structured.
                              - Output must always follow the required two-part format, with no extra commentary.'''},
            {
                'role': 'user',
                'content': prompt
            }
        ]
    )

    return response.choices[0].message.content

st.title("AI Code Reviewer")

user_code = st.text_area("Enter your Python code:", height=200, placeholder="Type your code here...")

if st.button("Generate"):
    if user_code.strip():
        corrected = code_reviewer(user_code)
        st.subheader("Code Review:")
        st.code(corrected, language="python")