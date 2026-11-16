# Ziara

**Discover Lebanon. Explore its places. Connect with local businesses.**

Ziara is a collaborative full-stack tourism platform developed as part
of the **Tashgheel training program**. It helps people discover
touristic, religious, and local places across Lebanon while giving local
businesses an online presence.

The project brings together a mobile application for visitors, a
business client portal, an admin dashboard, and an AI-powered tourism
chatbot.

## Table of Contents

-   [Project Overview](#project-overview)
-   [Applications](#applications)
-   [Key Features](#key-features)
-   [Technology Stack](#technology-stack)
-   [Project Structure](#project-structure)
-   [Getting Started](#getting-started)
-   [Environment Variables](#environment-variables)
-   [Running the Applications](#running-the-applications)
-   [Screenshots](#screenshots)
-   [Contributors](#contributors)

## Project Overview

Finding reliable information about tourist attractions, religious sites,
restaurants, and other places in Lebanon can be fragmented across
different sources. Ziara aims to bring these discoveries together in one
platform and improve the visibility of local businesses.

The platform distinguishes between two types of places:

-   **Static Places:** Touristic and religious places managed by
    administrators.
-   **Client Places:** Restaurants, shops, hotels, and activity places
    managed by business owners through the Client Portal.

## Applications

### 1. Mobile Application

A React Native application for visitors to discover and explore places
across Lebanon.

Main capabilities include:

-   Browse and search for places by name.
-   Discover nearby places, restaurants, tourist attractions, and
    religious places.
-   View place locations on an interactive map.
-   Save favorite places and keep track of visited places.
-   Create reviews and submit reports.
-   Manage an account and profile.
-   Use the application in Arabic or English.

### 2. Business Client Portal

A web application that allows local businesses to manage their presence
on Ziara.

Main capabilities include:

-   Register a business account.
-   Manage business place information.
-   Manage subscription-related information.
-   Interact with reviews and reports related to business places.

### 3. Admin Dashboard

A web dashboard for managing and moderating platform content.

Main capabilities include:

-   Manage client content and subscription plans.
-   Review and moderate submitted reviews and reported places.
-   Manage static places and platform users.
-   Handle administrative actions and related email notifications.

### 4. AI-Powered Tourism Chatbot

A chatbot focused on tourism in Lebanon. It is designed to answer
questions about touristic places, religious sites, restaurants, and food
within Lebanon.

The chatbot server is built with **Python and Flask** and uses the
**Google Gemini API** (`gemini-1.5-flash`) to generate responses.

## Key Features

-   **Location-based discovery:** Find nearby places using geographic
    coordinates and Google Places API.
-   **Category-based nearby results:** Nearby places, restaurants,
    tourist attractions, and religious places.
-   **Interactive maps:** Display place locations with map markers using
    React Native Maps.
-   **Arabic and English:** The mobile interface supports both languages
    and keeps a left-to-right layout in both.
-   **User accounts:** Registration, login, logout, profile editing,
    profile pictures, and password recovery.
-   **Favorites and visited places:** Save places and keep track of
    visits.
-   **Reviews and reporting:** Share feedback and report places or
    content.
-   **AI tourism assistant:** Ask tourism-related questions about
    Lebanon.

## Technology Stack

### Mobile Application

-   React Native CLI 0.80.1
-   React 19.1.0
-   Redux Toolkit and React Redux
-   React Navigation 7
-   Axios
-   React Native Maps
-   Geolocation libraries
-   Formik and Yup
-   i18n-js

### Business Client Portal

-   React 19.1.0
-   Create React App (`react-scripts` 5.0.1)
-   React Router DOM 6
-   Redux and React Redux
-   Axios
-   Formik and Yup
-   i18next and React i18next

### Admin Dashboard

-   React 19.1.0
-   Vite 7.0.4
-   React Router DOM 7
-   Axios
-   React Toastify

### Main Backend

-   Node.js
-   Express 5.1.0
-   MongoDB with Mongoose 8.17.0
-   JSON Web Tokens (JWT)
-   Bcrypt
-   Cloudinary
-   Multer
-   Nodemailer
-   Axios

### Chatbot Server

-   Python
-   Flask
-   Google Gemini API
-   Flask-CORS
-   python-dotenv

## Project Structure

``` text
Ziara/
├── frontend/       # React Native mobile application
├── client/         # Business Client Portal (React)
├── admin/          # Admin Dashboard (React + Vite)
├── backend/        # Main Node.js + Express API
└── chatbot/        # Python + Flask chatbot server
```

## Getting Started

### Prerequisites

Install the following before running the project:

-   Node.js 18 or later and npm
-   Python and pip
-   MongoDB database (or a MongoDB connection URI)
-   A Cloudinary account
-   A Google Places API key
-   A Google Gemini API key
-   Android Studio and an Android emulator or device for Android
    development; Xcode is required for iOS development on macOS.

### Clone the Repository

``` bash
git clone https://github.com/omarghemrawi/ziara.git
cd ziara
```

Install dependencies separately in each Node.js application:

``` bash
cd backend
npm install

cd ../client
npm install

cd ../admin
npm install

cd ../frontend
npm install
```

For the chatbot, install its Python dependencies. The project does not
currently include a `requirements.txt`, so install the packages used by
`app.py` in your Python environment:

``` bash
pip install Flask flask-cors python-dotenv google-generativeai
```

## Environment Variables

Create local `.env` files for the relevant applications. Do not commit
real credentials, API keys, database connection strings, or secrets to
GitHub.

### Main Backend

Create `backend/.env`:

``` env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_api_secret
API_KEY_GOOGLE_PLACES=your_google_places_api_key
```

The backend also uses other environment variables in some features (for
example, authentication and email configuration). Add the exact
variables required by your local backend configuration.

### Chatbot

Create `chatbot/.env`:

``` env
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend Applications

The Client Portal, Admin Dashboard, and Mobile Application may require
API base URLs or other environment-specific configuration. Use the
variable names expected by each application's source code.

> **Security:** Keep `.env` files out of version control. Add `.env`,
> `.env.*`, and local secret files to `.gitignore`. If a secret has
> already been pushed to a public repository, revoke or rotate it;
> adding it to `.gitignore` does not remove it from Git history.

## Running the Applications

Run each component in a separate terminal from its own directory.

### 1. Main Backend

``` bash
cd backend
npm run dev
```

By default, the server listens on port `5000`.

### 2. Business Client Portal

``` bash
cd client
npm start
```

### 3. Admin Dashboard

``` bash
cd admin
npm run dev
```

Vite prints the local development URL in the terminal.

### 4. Mobile Application

Start the Metro bundler:

``` bash
cd frontend
npm start
```

In another terminal, run the Android application:

``` bash
cd frontend
npm run android
```

For iOS, use `npm run ios` on macOS with the required Xcode setup.

### 5. Chatbot Server

``` bash
cd chatbot
python app.py
```

The Flask application runs on port `8000` as configured in `app.py`.

## Screenshots

``` text
docs/
└── screenshots/
    ├── mobile/
    ├── client/
    └── admin/
```

## Contributors

Developed collaboratively during the Tashgheel training program.

-   **Rama Tobbo**
-   **Reda Rifai**
-   **Omar Ghemrawi**
-   **Baraa Wehbe**

**Mentor:** Dr. Nader Bakir

------------------------------------------------------------------------

**Note:** Ziara is currently configured for local development.
Deployment instructions and live demo links can be added when deployment
is available.
