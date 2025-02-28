""" General Bot """
import google.generativeai as ai

# API key
API_KEY= 'AIzaSyDu3ra9coEnkHU4mDy6NWCMqYR4epM_RFc'

#COnfigure the API

ai.configure(api_key=API_KEY)

#creating a new model
model=ai.GenerativeModel("gemini-pro")
chat = model.start_chat()

#Start a conversation
while True:
    message = input('You: ')
    if message.lower() == 'bye':
        print ('Chatbot: Goodbye!')
        break
    response=chat.send_message(message)
    print("Chatbot: ", response.text)