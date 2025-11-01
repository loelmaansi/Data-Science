# 🎬 Cine Shazam
**Based on the Scene, We'll Find Your Movie 🍿**



This project is a Streamlit application that acts like a "Shazam for movies." You can record a short audio clip from a movie or TV show scene, and the app will transcribe the dialogue using OpenAI's Whisper, then identify the title and release year using a custom Retrieval-Augmented Generation (RAG) system.

## ✨ Features

* **Audio Recording**: Captures 40 seconds of audio directly in the browser using `sounddevice`.
* **Speech-to-Text**: Uses OpenAI's `whisper-1` model for high-accuracy transcription of the recorded audio.
* **RAG System**: Identifies the movie from the dialogue using a custom RAG pipeline built with LangChain.
* **Vector Database**: Uses a Chroma vector database (`./chroma_db_`) built from a dataset of over 82,000 movie/TV show subtitles.
* **State-of-the-Art Embeddings**: Employs the `all-MiniLM-L6-v2` sentence transformer for efficient and accurate dialogue embedding.
* **LLM Integration**: Uses `gpt-4o-mini` as the generator to provide the final, formatted answer based on the retrieved subtitles.
* **Interactive Web UI**: A simple and clean user interface built with Streamlit.

## ⚙️ How It Works (The Pipeline)

The project is divided into three main phases:

### Phase 1: Data Preparation (`01. Load the data.ipynb`)

1.  **Load Data**: Connects to an SQLite database (`eng_subtitles_database.db`) containing a `zipfiles` table.
2.  **Unzip & Decode**: The `content` column contains binary data, which is identified as ZIP archives. Each entry is unzipped in memory and decoded using `latin-1` to extract the raw subtitle text.
3.  **Clean Text**: The raw subtitle text is cleaned using regex, converted to lowercase, tokenized, and lemmatized using `nltk`.
4.  **Extract Metadata**: A regex function extracts the movie/show `name`, `season`, `episode`, and `year` from the original file name.
5.  **Final DataFrame**: The cleaned data is saved as a DataFrame with columns: `movie_id`, `name`, `season`, `episode`, `year`, and `subtitles`. This is likely saved to `data/subtitles_metadata.csv` for the next step.

### Phase 2: Vector DB & RAG Build (`02. Building RAG System.ipynb`)

1.  **Load Documents**: The cleaned `subtitles_metadata.csv` is loaded (a 20% sample is used in the notebook).
2.  **Chunking**: The subtitles for each entry are split into 300-character chunks with a 50-character overlap to ensure no dialogue is missed at the boundaries.
3.  **Embeddings**: The `all-MiniLM-L6-v2` embedding model is initialized.
4.  **Vector Store**: A Chroma vector database is created and persisted to the `./chroma_db_` directory. The text chunks are processed in batches and added to this database.
5.  **RAG Chain**: A LangChain RAG pipeline is defined:
    * **Retriever**: The Chroma DB is set up as a retriever to find the top `k=10` most similar subtitle chunks.
    * **Prompt**: A custom prompt template instructs the LLM to answer based *only* on the retrieved context (the subtitle chunks).
    * **LLM**: `gpt-4o-mini` is used as the generator.
    * **Parser**: A simple string output parser formats the LLM's response.

### Phase 3: Streamlit Application (`app.py`)

1.  **Record**: The user clicks the "Record" button, which captures 40 seconds of audio.
2.  **Transcribe**: The audio data is saved to a temporary file and sent to the OpenAI `whisper-1` API, which returns the transcribed text.
3.  **Query**: The transcribed text is passed as the `query` to the RAG chain.
4.  **Retrieve & Generate**: The RAG chain loads the persistent Chroma DB (`./chroma_db_`), retrieves the most relevant subtitle chunks, and passes them (along with the query) to `gpt-4o-mini`.
5.  **Display**: The LLM generates the final answer (e.g., "The Avengers, 2012"), which is then displayed to the user.
