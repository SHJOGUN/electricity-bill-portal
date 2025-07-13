# Dynamic Electricity Bill Tracker

This project is a dynamic electricity bill tracking portal developed by a team of four over a period of ten days. It allows users to input their electricity consumption data, visualize it through a chart, and get a predicted bill amount.

## Features

*   **Data Input:** Easily add daily electricity consumption units along with the date.
*   **Interactive Chart:** Visualize consumption trends over time with a dynamic line chart.
*   **Bill Prediction:** Get an estimated electricity bill based on recent consumption data.
*   **Bill Download:** Download a summary of the predicted bill in HTML format.

## Technologies Used

*   **Frontend:** HTML, CSS, JavaScript
*   **Backend:** Node.js with Express
*   **Database:** SQLite3
*   **Charting:** Chart.js with date-fns adapter

## Setup and Running the Project

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [repository_url]
    cd final-college-project
    ```
    (Note: Replace `[repository_url]` with the actual repository URL if this project were hosted on Git.)

2.  **Install dependencies:**
    Navigate to the project directory and install the required Node.js packages:
    ```bash
    npm install express sqlite3 cors chart.js date-fns chartjs-adapter-date-fns
    ```

3.  **Start the server:**
    ```bash
    node server.js
    ```
    The server will start on `http://localhost:3000`.

4.  **Open the application:**
    Open your web browser and navigate to `http://localhost:3000`.

## Development Timeline (10 Days)

*   **Day 1-2: Planning & Setup**
    *   Defined project scope and core features.
    *   Set up project structure (frontend/backend separation).
    *   Initialized Node.js project and installed basic dependencies.
    *   Designed initial database schema for consumption data.

*   **Day 3-4: Backend Development**
    *   Implemented API endpoints for adding and fetching consumption data.
    *   Set up SQLite database connection and data storage.
    *   Developed bill prediction logic based on consumption.

*   **Day 5-6: Frontend UI & Data Integration**
    *   Designed and implemented the main `index.html` structure.
    *   Styled the application using `style.css`.
    *   Integrated frontend with backend APIs for data submission and retrieval.

*   **Day 7-8: Charting & Visualization**
    *   Integrated Chart.js for dynamic consumption visualization.
    *   Configured date adapters for proper time-series display.
    *   Ensured real-time chart updates upon new data entry.

*   **Day 9: Bill Generation & Download**
    *   Implemented the functionality to generate and download the predicted bill as an HTML file.
    *   Refined bill display with Indian currency and address details.

*   **Day 10: Testing, Refinements & Documentation**
    *   Conducted thorough testing of all features.
    *   Addressed bugs and made UI/UX improvements.
    *   Prepared comprehensive `README.md` documentation.
