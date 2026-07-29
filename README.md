# 🌍 Voyage AI – Intelligent Travel Planner

An AI-powered full-stack travel planning platform that generates personalized itineraries, visualizes routes on interactive maps, and helps travelers organize every aspect of their journey with real-time AI assistance.

## ✨ Features

### 🤖 AI-Powered Itinerary Generator

* Generate personalized day-by-day travel itineraries using **Google Gemini AI**.
* Plans are tailored based on destination, duration, travel style, budget, and interests.
* Includes attractions, restaurants, transportation suggestions, estimated costs, and practical travel tips.

### 🗺️ Interactive Trip Maps

* Built with **React Leaflet** and **OpenStreetMap**.
* Interactive numbered markers for every destination.
* Route visualization connecting all itinerary locations.
* Activity popups with synchronized itinerary highlighting.
* Fullscreen map mode with Google Maps navigation support.

### 📍 Sticky Route Overview

* Desktop sticky sidebar that remains visible while scrolling.
* Quickly navigate between itinerary activities.
* Highlights the currently selected destination.
* One-click access to Google Maps navigation.

### 🧳 Smart Trip Management

* View complete day-by-day itinerary timelines.
* Edit, add, or remove activities dynamically.
* Save generated trips permanently in MongoDB.
* Export itineraries as downloadable PDFs.
* Share trips using unique URLs.

### 💬 AI Travel Concierge

* Built-in AI assistant powered by **Google Gemini**.
* Ask destination-specific questions.
* Receive restaurant recommendations.
* Learn local customs and travel advice.
* Get weather-based suggestions.
* Modify travel plans through conversational AI.

### 💰 Budget & Travel Essentials

* Expense tracking by category.
* Accommodation, transportation, food, and activity budgeting.
* Smart packing checklist.
* Travel essentials manager.

---

# 🚀 Tech Stack

## Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* Zustand
* React Router
* React Leaflet
* Lucide React

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* MongoDB
* Mongoose

## AI

* Google Gemini API (`@google/genai`)

## Maps

* OpenStreetMap
* React Leaflet
* Optional Google Maps integration

---

# 📦 Key Features

* AI-generated travel itineraries
* Interactive route visualization
* Smart trip dashboard
* Persistent trip storage using MongoDB
* AI-powered travel assistant
* Budget planning
* Travel checklist
* PDF itinerary export
* Responsive UI
* Dark & Light mode
* Smooth animations

---

# 🏗️ Project Architecture

```
Voyage AI
│
├── Frontend (React + TypeScript)
│   ├── Planner
│   ├── Dashboard
│   ├── Trip Details
│   ├── Interactive Maps
│   ├── AI Chat Drawer
│   └── Zustand Store
│
├── Backend (Express)
│   ├── AI Endpoints
│   ├── Trip APIs
│   ├── MongoDB Integration
│   └── Gemini API
│
└── Database
    └── MongoDB
```

---

# 📂 Main Functionality

### Generate AI Trip

Create complete travel plans by providing:

* Destination
* Duration
* Budget
* Travel Style
* Group Size
* Interests

---

### Save Trips

Generated trips are automatically stored in **MongoDB** for future access.

Each trip includes:

* Destination
* Budget
* Duration
* Travel Style
* Interests
* AI-generated itinerary
* Creation timestamp
* Last updated timestamp

---

### Interactive Maps

* Route visualization
* Numbered destination markers
* Activity synchronization
* Fullscreen map
* Google Maps navigation

---

# 🗄️ Database

MongoDB stores:

* Trip information
* AI itineraries
* User travel preferences
* Wishlist status
* Creation & update timestamps

---

# ⚡ Installation

## Clone Repository

```bash
git clone <repository-url>
cd Voyage-AI
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file in the project root.

```env
GOOGLE_API_KEY=your_google_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
```

## Start Development Server

```bash
npm run dev
```

---

# 📸 Screenshots

Add screenshots here:

* Home Page
* AI Planner
* Dashboard
* Interactive Map
* Trip Details
* AI Concierge

---

# 🔮 Future Enhancements

* User Authentication
* Saved Favorites
* Collaborative Trip Planning
* Flight & Hotel APIs
* Real-time Weather Integration
* Offline Trip Access
* Multi-language Support
* Calendar Integration
* Expense Analytics
* Email Trip Sharing

---

# 👨‍💻 Author

**Anand Kumar**

* GitHub: https://github.com/Anandkumar04
* LinkedIn: *(Add your profile link)*

---

## ⭐ If you like this project, consider giving it a star!
