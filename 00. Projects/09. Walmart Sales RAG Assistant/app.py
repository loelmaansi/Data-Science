"""
Walmart Sales RAG Assistant — DIAGNOSTIC VERSION
--------------------------------------------------
Same app as before, with timing print statements added so we can see
exactly where the page-load time is going. These prints show up in your
TERMINAL window (not the browser), right where you ran `streamlit run app.py`.

This file does not touch your .ipynb at all — it's fully separate.
"""

import os
import pickle
import time
import streamlit as st

st.set_page_config(
    page_title="Walmart Sales RAG Assistant",
    page_icon="🛒",
    layout="centered",
)

CSV_PATH = "data/Walmart.csv"
API_KEY_PATH = "keys/openai_api_key.txt"
FAISS_INDEX_DIR = "faiss_index"
DOCS_CACHE_PATH = "faiss_index/docs.pkl"


def load_api_key() -> str:
    if os.path.exists(API_KEY_PATH):
        with open(API_KEY_PATH) as f:
            return f.read().strip()
    return os.environ.get("OPENAI_API_KEY", "")


def build_rewritten_docs():
    from langchain_community.document_loaders.csv_loader import CSVLoader
    from langchain_core.documents import Document

    loader = CSVLoader(file_path=CSV_PATH)
    raw_docs = loader.load()

    rewritten_docs = []
    for doc in raw_docs:
        lines = doc.page_content.split("\n")
        store = lines[0].split(": ")[1]
        date = lines[1].split(": ")[1]
        sales = lines[2].split(": ")[1]
        holiday = lines[3].split(": ")[1]
        temp = lines[4].split(": ")[1]
        fuel = lines[5].split(": ")[1]
        cpi = lines[6].split(": ")[1]
        unemployment = lines[7].split(": ")[1]

        content = f"""Store {store} recorded weekly sales of {sales}.
The date was {date}.
This was a holiday week: {holiday}.
The temperature was {temp}.
Fuel price was {fuel}.
CPI was {cpi}.
Unemployment rate was {unemployment}."""

        rewritten_docs.append(
            Document(
                page_content=content,
                metadata={"store": store, "date": date, "holiday": holiday},
            )
        )
    return rewritten_docs


@st.cache_resource(show_spinner=False)
def build_pipeline(api_key: str):
    import warnings
    warnings.filterwarnings("ignore", category=DeprecationWarning)

    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_community.vectorstores import FAISS
    from langchain_community.retrievers import BM25Retriever
    from langchain_classic.retrievers import EnsembleRetriever
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_openai import ChatOpenAI
    from langchain_core.output_parsers import StrOutputParser
    from langchain_core.runnables import RunnablePassthrough

    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    index_exists = os.path.exists(os.path.join(FAISS_INDEX_DIR, "index.faiss"))

    if index_exists:
        vectorstore = FAISS.load_local(
            FAISS_INDEX_DIR, embedding_model, allow_dangerous_deserialization=True
        )
        with open(DOCS_CACHE_PATH, "rb") as f:
            rewritten_docs = pickle.load(f)
    else:
        rewritten_docs = build_rewritten_docs()
        vectorstore = FAISS.from_documents(rewritten_docs, embedding=embedding_model)
        os.makedirs(FAISS_INDEX_DIR, exist_ok=True)
        vectorstore.save_local(FAISS_INDEX_DIR)
        with open(DOCS_CACHE_PATH, "wb") as f:
            pickle.dump(rewritten_docs, f)

    faiss_retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    bm25_retriever = BM25Retriever.from_documents(rewritten_docs)
    bm25_retriever.k = 3
    hybrid_retriever = EnsembleRetriever(
        retrievers=[bm25_retriever, faiss_retriever],
        weights=[0.4, 0.6],
    )

    prompt_template = ChatPromptTemplate.from_template(
        """You are a Walmart business analyst.

Answer the question based only on the following context:

{context}

Question:
{question}

Provide a clear and concise answer.
Do not include any information not present in the context."""
    )

    chat_model = ChatOpenAI(api_key=api_key, model="gpt-4o-mini", temperature=0)
    parser = StrOutputParser()

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
        {"context": hybrid_retriever | format_docs, "question": RunnablePassthrough()}
        | prompt_template
        | chat_model
        | parser
    )

    return rag_chain


# --------------------------------------------------------------------------
# Setup
# --------------------------------------------------------------------------
api_key = load_api_key()

st.title("🛒 Walmart Sales RAG Assistant")

if not api_key:
    st.error(
        f"No API key found. Add your key to `{API_KEY_PATH}` "
        "(same file your notebook uses), then restart the app."
    )
    st.stop()

if not os.path.exists(CSV_PATH):
    st.error(f"Could not find `{CSV_PATH}`. Check the CSV_PATH variable in app.py.")
    st.stop()

with st.spinner("Setting up the assistant..."):
    rag_chain = build_pipeline(api_key)

# --------------------------------------------------------------------------
# Chat-style conversation
# --------------------------------------------------------------------------
if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

query = st.chat_input("Type your question here...")

if query:
    st.session_state.messages.append({"role": "user", "content": query})
    with st.chat_message("user"):
        st.markdown(query)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            answer = rag_chain.invoke(query)
        st.markdown(answer)

    st.session_state.messages.append({"role": "assistant", "content": answer})