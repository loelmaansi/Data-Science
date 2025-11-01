from fastapi import FastAPI
import uvicorn
from time import sleep

# Create the FastAPI application
app = FastAPI()

@app.get("/api/billing")
def read_billing_data(user_id: str):
    """
    Simulates a real database lookup for a user's billing status.
    It takes a user_id as a query parameter.
    """
    
    # Print to the terminal so you can see when the API is hit
    print(f"\n[BILLING API] Received request for user_id: {user_id}")
    
    # Simulate a 0.5 second network/database delay
    sleep(0.5)
    
    # --- Mock Data ---
    if user_id == "12345":
        # Data for an overdue customer
        print("[BILLING API] Found user 12345. Responding with OVERDUE status.")
        return {
            "user_id": user_id, 
            "status": "Premium (Overdue)", 
            "invoice": "$59.99", 
            "details": "Payment pending since Oct 2025."
        }
    elif user_id == "99999":
        # Data for an active customer
        print("[BILLING API] Found user 99999. Responding with ACTIVE status.")
        return {
            "user_id": user_id, 
            "status": "Basic (Active)", 
            "invoice": "$0.00", 
            "details": "Next bill due Nov 2025."
        }
    else:
        # User not found (simulates a 404 error for the agent to handle)
        print(f"[BILLING API] User {user_id} not found. Responding with 404 error.")
        return {"detail": "User ID not found in the billing system"}, 404

# This part allows you to run the file directly with: python billing_api.py
if __name__ == "__main__":
    print("Starting Mock Billing API server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
