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
f = open('keys/openai_key.txt')
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
    #     file=query)
    
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
        ######################################################
        #______Retriever Augmentation Generation system_______
        ######################################################

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
                """Generate embeddings for multiple documents."""
                return self.model.encode(texts, convert_to_tensor=False).tolist()

            def embed_query(self, text):
                """Generate an embedding for a single query."""
                return self.model.encode([text], convert_to_tensor=False)[0].tolist()

        # Create the embedding function
        embedding_function = SentenceTransformerEmbedding('all-MiniLM-L6-v2')

        # Step 1 - Initialize a ChromaDB Connection
        from langchain_chroma import Chroma

        # Initialize the database connection
        # If database exist, it will connect with the collection_name and persist_directory
        # Otherwise a new collection will be created
        db = Chroma(collection_name="vector_database", 
                    embedding_function=embedding_function, 
                    persist_directory="./chroma_db_")
        

        # Step-2 : Create a Retriever Object
        retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 5})


        # Step-3 Initialize a Chat Prompt Template
        from langchain_core.prompts import ChatPromptTemplate
        PROMPT_TEMPLATE = """
        Answer the question based on the following context:
        {context}

        Based on the given subtitle/dialogues below:
        {question}

        Provide the following details strictly based on the context and 
        show in below format

        1. The title of the movie or web series, or TV show.
        DONT SHOW THE BELOW LINE IF YOU DIDNT FIND IN THE CONTEXT VERY STRICTLY
        2. The year of release. 
        SHOW THE 3RD POINT IF ITS A WEBSERIES OR ELSE DONT PRINT THE BELOW LINE VERY STRICTLY
        3. the season and episode number. (show this only if its webseries)

        Do not include any ID (VERY STRICTLY)
        Do not add any extra information.
        Do not justify your answers.
        DO NOT MENTION Not SPECIFIED
        DO NOT MENTION NOT APPLICABLE
        DO NOT MENTION NOT FOUND
        DO NOT MENTION N/A


        Avoid phrases like "according to the context/question" or "mentioned in the context/question."
        Simply provide the requested details.
        """
        prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)


        # Step 4: Initialize a Generator (i.e. Chat Model)
        f = open('keys/openai_key.txt')
        OPENAI_API_KEY = f.read()   
        
        from langchain_openai import ChatOpenAI
        chat_model = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model = "gpt-3.5-turbo")

        # Step 5: Initialize a Output Parser
        from langchain_core.output_parsers import StrOutputParser
        parser = StrOutputParser()

        # Step 6: Define a RAG Chain
        from langchain_core.runnables import RunnablePassthrough
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)
        rag_chain = {"context": retriever | format_docs, "question": RunnablePassthrough()} | prompt_template | chat_model | parser

        # Step-6 Invoking the Rag_Chain
        result = rag_chain.invoke(query)

        st.title(result)
        