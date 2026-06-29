# Walmart-RAG-Assistant
# 🛒 Walmart Sales RAG Assistant

A retrieval-augmented generation (RAG) system that answers natural-language questions about Walmart weekly sales data. Combines hybrid retrieval (BM25 + FAISS) with an LLM-based generator, wrapped in a Streamlit chat interface.

## 📌 Project Overview

- **01. 📄 Document Construction**
  Converts each row of tabular sales data (store, date, holiday flag, temperature, fuel price, CPI, unemployment) into a natural-language `Document`, so the retriever can match on meaning rather than raw column values.

- **02. 🔎 Hybrid Retrieval**
  Combines a `BM25Retriever` with a FAISS vector retriever (MiniLM embeddings) via an `EnsembleRetriever`, weighted 0.4/0.6, to balance keyword and semantic matching.

- **03. 🧠 Generation**
  Uses `ChatOpenAI` (gpt-4o-mini, temperature 0) with a context-constrained prompt template, so answers are grounded only in retrieved documents.

- **04. 📈 Evaluation**
  A small ground-truth question set is scored using sentence-embedding cosine similarity between expected and generated answers (avg. 0.72, range 0.61–0.81) — a sanity check rather than a full benchmark.

- **05. 💬 Streamlit App**
  A cached, chat-style interface (`app.py`) that persists the FAISS index to disk after the first build, so the app loads instantly on repeat runs.

---
Feel free to explore the notebook and app for the full pipeline, code, and evaluation details.
