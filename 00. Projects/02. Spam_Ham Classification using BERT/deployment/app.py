import streamlit as st
import torch
from transformers import AutoTokenizer, AutoModel

# Load the tokenizer and model from Hugging Face
tokenizer = AutoTokenizer.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
model = AutoModel.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')

# Function to get BERT embeddings
def get_embeddings(text):
    # Tokenize input text
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=512)
    
    # Get the model's output
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Get embeddings from the last hidden state (you can average over the tokens)
    embeddings = outputs.last_hidden_state.mean(dim=1)
    
    return embeddings

# Assuming you have a classifier trained on these embeddings (loaded via joblib)
import joblib
classifier = joblib.load('models/logistic_regression_model.pkl')  # Load your trained classifier

def predict_email(text):
    embeddings = get_embeddings(text)
    
    # Predict the class (spam or ham) using the trained classifier
    prediction = classifier.predict(embeddings.numpy())
    
    return prediction[0]

def main():
    # Title of the web app
    st.title("Spam vs Ham Email Classifier")
    
    # Instructions
    st.markdown("""
    Enter the content of an email below to classify it as **Spam** or **Ham**.
    """)
    
    # Input field for email text
    email_text = st.text_area("Enter the email content:")
    
    # When the user clicks the 'Classify' button
    if st.button("Classify"):
        if email_text:
            # Get the prediction
            result = predict_email(email_text)
            if result == 1:
                st.success("This email is **Spam**!")
            else:
                st.success("This email is **Ham**!")
        else:
            st.warning("Please enter the email content to classify.")

if __name__ == '__main__':
    main()
