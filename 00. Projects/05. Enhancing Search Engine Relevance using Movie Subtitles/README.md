# Enhancing Search Engine Relevance Using Movie Subtitles

## 📌 Introduction
Users often encounter short dialogue clips but struggle to identify the corresponding movie or TV show. Current tools lack the precision to accurately recognize content from such brief audio snippets.

## 🎯 Objective
Develop an application that can:
- 🎙️ Record short audio clips
- ✍️ Accurately transcribe speech
- 🔍 Match transcriptions against a large subtitle database  
- 📽️ Return precise movie/show titles, release years, and season/episode details when applicable

## 🛠️ Methodology
- Developed a **Streamlit** web app with in-browser audio recording
- Used **OpenAI’s Whisper** model for speech-to-text transcription
- Built a **Retrieval Augmented Generation (RAG)** pipeline using:
  - **LangChain** for orchestration
  - **Sentence Transformers** for generating dense text embeddings
  - **ChromaDB** for performing efficient vector similarity search
- Leveraged **GPT models** to produce detailed and user-friendly identification results

## ✅ Result
- Scalable and intuitive application capable of identifying media content from short audio clips
- Returns comprehensive metadata including:
  - 🎬 Movie/Show Title  
  - 📅 Release Year  
  - 📺 Season and Episode Number (if applicable)
- Significantly enhances user experience and search result relevance

## 🧩 UML Diagram
View the system architecture here:  
🔗 [UML Diagram - Google Slides](https://docs.google.com/presentation/d/1ztyXWKS6mlmJO6Z5T9N--0dEEGsyZBEgRrSkxKsPDQY/edit?usp=sharing)
