# Walmart-RAG-Assistant
# 🛒 Walmart Sales Pandas Agent Assistant

A chat assistant that answers natural-language questions about Walmart weekly sales data by running a pandas dataframe agent directly on the cleaned dataset. Wrapped in a Streamlit chat interface.

## 📌 Project Overview

- **01. 🧹 Data Processing**
  Cleans and feature-engineers the raw Walmart sales CSV: renames columns, parses dates, derives `month`/`year`/`season`, buckets temperature/fuel price/CPI/unemployment into levels, and adds weekday vs. weekend flags. The result is cached to `data/walmart_processed.csv`.

- **02. 🐼 Pandas Dataframe Agent**
  A `create_pandas_dataframe_agent` (LangChain, tool-calling, `gpt-4o-mini`, temperature 0, `return_intermediate_steps=True`) runs directly on the processed dataframe to answer questions. The notebook (`walmart_data.py`) also wires the same agent into a single-node `LangGraph` `StateGraph`.

- **03. 💬 Streamlit Chat App**
  `streamlit_app.py` wraps the same data pipeline and agent in a chat UI:
  - Captures any matplotlib figures produced by the agent's pandas code during a tool call and renders them inline in the chat
  - Prepends a short transcript of recent turns to each new question so follow-ups (e.g. "what about for store 5?") resolve correctly, since the agent itself is stateless per call
  - Includes a dedupe safeguard that collapses an answer if the agent restates it twice
  - Sidebar shows example questions, dataset metrics (row count, store count, date range), a toggle to show the generated pandas code, and a clear-chat button
