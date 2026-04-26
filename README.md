# JalDrishti Platform

JalDrishti is a comprehensive, intelligent water management platform designed to provide real-time monitoring, AI-driven forecasting, and seamless citizen engagement. Built with a modern React frontend and integrated with advanced Google technologies, the platform serves both city administrators and citizens through dedicated, role-based portals.

## 🚀 Key Features

### 🛡️ Admin Portal (Secured)
*   **Demand vs Supply Dashboard:** Monitor water distribution with granular views (Hourly, Daily, Weekly) to ensure supply meets demand efficiently and sustainably.
*   **Leak Detection:** Identify and track pipeline anomalies to significantly reduce water loss.
*   **Water Quality Monitoring:** Integrated with the **Google Gemini Multimodal API** to analyze real-time images of water samples, detecting contamination or infrastructure issues instantly.
*   **Tanker Dispatch System:** Manage and route water tankers efficiently based on live citizen requests and priority zones.

### 👥 Citizen Portal (Public Access)
*   **Live Tanker Tracker:** Search and monitor assigned water tankers in real-time via an interactive map interface.
*   **Request Tanker:** Seamlessly submit requests for water tankers with automated, unique tracking number generation backed by Firestore.
*   **WhatsApp Integration:** A direct communication pathway allowing citizens to request tankers and track status effortlessly through WhatsApp.
*   **AI Helpdesk:** An intelligent chatbot powered by the **Google Gemini Multimodal API**, capable of answering complex queries and analyzing user-uploaded images of infrastructure or water quality issues.

## 💻 Technology Stack

*   **Frontend Core:** React 19, Vite, React Router DOM
*   **Styling & UI:** Vanilla CSS using a custom Google-inspired Light Theme (incorporating DeepMind-style aesthetics, crisp typography, and responsive layouts)
*   **Data Visualization:** Recharts
*   **Maps & Geolocation:** `@react-google-maps/api`
*   **AI Integration:** Google Gemini API (`@google/genai`)
*   **Backend & Infrastructure:** Firebase (Firestore for real-time data sync, Firebase Auth for role-based access)
*   **Icons:** Lucide React

## 🛠️ Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn
*   Firebase project setup with Firestore and Authentication enabled
*   Google Maps API Key
*   Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd "Jaldrishti GDG 2026"
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add your API keys:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
    # Add Firebase configuration variables as required by your setup
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

5.  **Build for production:**
    ```bash
    npm run build
    ```

## 🏗️ Architecture & Design Notes

*   **Role-Based Access Control (RBAC):** The platform features a robust routing architecture distinguishing between Admin and Citizen access. Administrative tools are secured via Firebase Auth, while citizen-facing tools (Helpdesk, Tracking) remain highly accessible.
*   **Performance Optimization:** Map-based data rendering and complex visual modules are memoized to ensure smooth performance without rendering crashes.
*   **Premium UI/UX:** The design system prioritizes a clean, tech-forward aesthetic. It utilizes harmonious color palettes (Science Blue, Mint Green), custom pill-shaped components, and subtle micro-animations to deliver a polished, state-of-the-art user experience.

## 📄 License

This project is licensed under the MIT License.
