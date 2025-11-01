import streamlit as st
from langchain_core.messages import HumanMessage, AIMessage

# --- 1. IMPORT YOUR AGENT ---
# Import the compiled graph 'app' from your other file
# We rename it to 'graph_app' to avoid conflicts with the Streamlit 'app.py'
try:
    from agent_graph import app as graph_app
except ImportError:
    st.error("Error: Could not import 'app' from 'agent_graph.py'. Make sure the file exists and is in the same directory.")
    st.stop()
except Exception as e:
    st.error(f"An error occurred during import: {e}")
    st.stop()

# --- 2. SET UP THE PAGE ---
st.set_page_config(page_title="🤖 Multi-Agent Support", layout="wide")
st.title("🤖 Real-Time Multi-Agent Support System")
st.info("This demo showcases a LangGraph multi-agent system that routes queries to specialized agents (Billing or Technical). Don't forget to run the `billing_api.py` server in a separate terminal!")

# --- 3. SESSION STATE FOR CHAT HISTORY ---
# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = [
        AIMessage(content="Hello! I'm your automated support assistant. How can I help you today?")
    ]

# --- 4. DISPLAY CHAT MESSAGES ---
# Display chat messages from history on app rerun
for message in st.session_state.messages:
    with st.chat_message("human" if isinstance(message, HumanMessage) else "ai"):
        st.markdown(message.content)

# --- 5. CHAT INPUT AND AGENT INVOCATION ---
if prompt := st.chat_input("Ask about billing (ID 12345) or a technical issue (e.g., 'server timeout')..."):
    # Add user message to chat history
    st.session_state.messages.append(HumanMessage(content=prompt))
    
    # Display user message in chat message container
    with st.chat_message("human"):
        st.markdown(prompt)

    # Display AI response in chat message container
    with st.chat_message("ai"):
        # Use a spinner while the agent is working
        with st.spinner("Thinking..."):
            try:
                # This is where you call your LangGraph agent!
                input_state = {"messages": [HumanMessage(content=prompt)]}
                
                # 'app.invoke()' is the same call you used in your test
                result = graph_app.invoke(input_state)
                
                # The final response is the last message in the state
                response_message = result['messages'][-1]
                
            except Exception as e:
                # Handle errors, especially the API connection error
                if "Connection Error" in str(e):
                    response_message = AIMessage(content="Error: I can't connect to the billing API. **Did you remember to run `python billing_api.py` in a separate terminal?**")
                else:
                    response_message = AIMessage(content=f"An error occurred: {e}")
            
            # Display the final response
            st.markdown(response_message.content)
            
    # Add AI response to chat history
    st.session_state.messages.append(response_message)