import streamlit as st
import sounddevice as sd
from pydub import AudioSegment
import numpy as np
import time
import wave
import whisper
import torch
import io
import tempfile


def record_audio(duration=40, samplerate=44100, channels=1):
    st.success("Recording started...")
    progress_bar = st.progress(0)
    audio_data = []
    
    def callback(indata, frames, time, status):
        if status:
            st.error(status)
        audio_data.append(indata.copy())
    
    with sd.InputStream(samplerate=samplerate, channels=channels, dtype='int16', callback=callback):
        for i in range(duration + 1):
            time.sleep(1)
            progress_bar.progress(i * 100 // duration)
    
    audio_data = np.concatenate(audio_data, axis=0)

    # Write audio data to WAV buffer
    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(2)  
        wf.setframerate(samplerate)  
        wf.writeframes(audio_data.tobytes())  

    wav_buffer.seek(0)  
    return wav_buffer

from openai import OpenAI
f = open('keys/openai_api_key.txt')
OPENAI_API_KEY = f.read()
client = OpenAI(api_key = OPENAI_API_KEY)

# Title of the Streamlit app
st.title("Cine Shazam")
st.subheader("Based on the Scene, We’ll Find Your Movie 🎥")
st.markdown(
    """
    <p style="font-size:10px; color:gray; text-align:center;">
        Powered by Retriever Augmentation Generation System and OpenAI 
    </p>
    """, 
    unsafe_allow_html=True
)

# Big text print statement
st.text("🎤 Record your content")

# Record button
toggle = st.button("🔴 Record")

if toggle:
    query = record_audio()
    st.success("Recording complete!")

    # transcription = client.audio.transcriptions.create(
    #     model="whisper-1",
    #     file = query)

    # Save the BytesIO buffer to a temporary file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
        temp_file.write(query.getvalue())  # Write the content of BytesIO to the temp file
        temp_file_path = temp_file.name  # Get the file path

    # Use the temporary file for transcription
    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=open(temp_file_path, "rb")  
)
    
    # Display the transcribed text
    st.subheader("Speech Recognition:")
    query = transcription.text
    st.write(query)

    with st.spinner("Searching..."):


# Step 1: Initialize an embedding model

        from langchain.vectorstores import Chroma
        from langchain_chroma import Chroma
        from sentence_transformers import SentenceTransformer
        from langchain.schema import Document
        from langchain.embeddings.base import Embeddings
        from tqdm import tqdm

        # Define an embedding class to wrap SentenceTransformer
        class SentenceTransformerEmbedding(Embeddings):
            def __init__(self, model_name):
                self.model = SentenceTransformer(model_name)

            def embed_documents(self, texts):
                '''Generate embeddings for multiple documents.'''
                return self.model.encode(texts, convert_to_tensor = False).tolist()
            def embed_query(self, text):
                '''Generate an emedding for a single query.'''
                return self.model.encode([text], convert_to_tensor = False)[0].tolist()

        # Create the embedding function
        embedding_function = SentenceTransformerEmbedding('all-MiniLM-L6-v2')

        from langchain_chroma import Chroma

        db = Chroma(
            collection_name = 'vector_database',
            embedding_function = embedding_function,
            persist_directory = './chroma_db_'
        )

        # Step 3: Create a Retriever Object
        # Converting CHROMA db connection to retriever object

        retriever = db.as_retriever(
            search_type= 'similarity',
            search_kwargs = {'k': 10}
        )

        # Step 4: Initiliaze a Chat Prompt template

        from langchain_core.prompts import ChatPromptTemplate

        PROMPT_TEMPLATE = '''Answer based only on the following context:
                {context}

                Based on the given subtitle/dialogues:
                {question}

                Return the result strictly in this format (no extra words, no numbering, no labels):
                <Movie/Show Name>, <Year of Release>
                '''


        prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)

        # Step 5: Initialize a Generator (i.e., Chat Model)

        f = open('keys/openai_api_key.txt')
        OPENAI_API_KEY = f.read()

        from langchain_openai import ChatOpenAI
        chat_model = ChatOpenAI(api_key = OPENAI_API_KEY, model = 'gpt-4o-mini')

        # Step 6: Initialize a Output Parser

        from langchain_core.output_parsers import StrOutputParser
        parser = StrOutputParser()

        # Step 7: Define a RAG Chain

        from langchain_core.runnables import RunnablePassthrough
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)

        rag_chain = {'context': retriever | format_docs, 'question': RunnablePassthrough()} | prompt_template | chat_model | parser

        result = rag_chain.invoke(query)

        st.title(result)
