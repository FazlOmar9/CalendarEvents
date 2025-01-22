# CalendarEvents

CalendarEvents is a react application that allows users to view their Google Calendar events efficiently in one place.

 This project was created as a submission to WhiteCarrot's internship assignment.

## Requirements

* Node.js 18.0.0+
* A Google OAuth Client ID with Calendar API enabled

## Setup

1. Clone the repository:
   

```sh
   git clone <repository-url>
   cd <repository-directory>
```

2. Install the dependencies:
   

```sh
    npm install
```

3. Create a Google OAuth Client ID with Calendar API enabled and set it as the VITE_GOOGLE_CLIENT_ID environment variable in a .env file:
   

```sh
   VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

4. Start the development server:
    

```sh
    npm run dev
```

## Note for Evaluators

As this is a prototype, Google only allows test accounts. Evaluators may contact me to get their test email IDs added to the list of test emails in my OAuth client.

## Video Demo

A video demo of the application can be found [here](https://drive.google.com/file/d/1c7x2CD7ZYbjueHJLkghH0w2A5WfQCfPy/view?usp=sharing).

## Live Demo

A live demo of the application can be found [here](https://calendar-events-eta.vercel.app/).
