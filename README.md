# Weather Live - Next.js, React, TypeScript,OpenWeather API, TailwindCSS, Framer Motion Fundamental Project 11

A fast, minimal, and modern weather web application built with React and Vite. It lets users search any city in the world and view up-to-date weather details including temperature, humidity, and wind information using the [OpenWeather API](https://openweathermap.org/). Designed for learning and demonstration, this project is ideal for beginners and intermediates who want to understand how to build and deploy a real-world React app with API integration and Vercel deployment.

- **Live-Demo:** [https://weather-instant.vercel.app/](https://weather-instant.vercel.app/)

---

## Table of Contents

1. [Project Summary](#project-summary)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [How It Works](#how-it-works)
7. [API Integration](#api-integration)
8. [Usage Examples](#usage-examples)
9. [Learning Points](#learning-points)
10. [Conclusion](#conclusion)

---

## Features

- 🌦️ **Real-Time Weather Data** – Fetches live weather info for any city worldwide.
- 🔍 **City Search** – Users can search for any city and get instant results.
- 🌡️ **Details Displayed** – Temperature, humidity, wind speed, and weather status.
- ⚡ **Fast & Modern** – Built using React + Vite for fast HMR and lightweight builds.
- 📱 **Responsive Design** – Looks great on both desktop and mobile.
- 🚀 **Deployed on Vercel** – Easy one-click deployment and live demo.
- 💡 **Great for Learning** – Clean code, API usage, and React best practices.

---

## Technology Stack

- **Frontend Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **API**: [OpenWeather API](https://openweathermap.org/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Other Tools**: ESLint, Babel or SWC for Fast Refresh, CSS

---

## Project Structure

```bash
Weather--ReactVite/
│
├── .eslintrc.cjs        # Linting configuration
├── .gitignore           # Git ignore file
├── index.html           # Main HTML file
├── package.json         # NPM dependencies and scripts
├── package-lock.json    # NPM lock file
├── vite.config.js       # Vite configuration
├── README.md            # Project documentation
│
└── src/
    ├── App.jsx                # Main React component
    ├── main.jsx               # App entry point
    ├── index.css              # Global CSS
    ├── assets/                # Images, icons, etc
    └── Components/            # Reusable React components
```

---

## Installation & Setup

Follow these steps to get the project running locally:

### 1. Install Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/en/).

---

### 2. Clone the Repository

```bash
git clone https://github.com/arnobt78/Weather--ReactVite.git
cd Weather--ReactVite
```

---

### 3. Install Dependencies

```bash
npm install
```

This installs all required packages from `package.json`.

---

### 4. Environment variables

Copy `.env.example` to `.env.local` and add your API keys. Do not commit `.env.local` or any file containing real keys.

---

### 5. Get OpenWeather API Key

- Register for free at [OpenWeather](https://openweathermap.org/).
- Get your API key from your dashboard.

---

### 6. Run the App Locally

```bash
npm run dev
```

Visit [http://localhost:3000/](http://localhost:3000/) in your browser (Next.js default).

---

## How It Works

1. **Search for a City**: Type a city name and submit.
2. **API Request**: The app fetches weather data for the city using OpenWeather API.
3. **Display Data**: Weather details (temperature, humidity, wind, status) are shown.
4. **Responsive UI**: The design adapts to your device for a seamless experience.

---

## API Integration

This app uses the **OpenWeather API** to fetch weather data. You’ll need an API key to use it.

**Basic fetch example:**

```js
const apiKey = "YOUR_API_KEY";
const url = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`;

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    // Use data.main.temp, data.weather[0].description, etc.
  });
```

---

## Usage Examples

### Example: Main Weather Fetch Function

```jsx
async function fetchWeather(city) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY&units=metric`,
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY&units=metric`
  );
  const data = await response.json();
  // Display data.main.temp, data.weather[0].description, etc.
}
```

### Example: Simple Weather Card Component

```jsx
function WeatherCard({ city, temp, humidity, wind, status }) {
  return (
    <div className="weather-card">
      <h2>{city}</h2>
      <p>{status}</p>
      <p>Temperature: {temp}°C</p>
      <p>Humidity: {humidity}%</p>
      <p>Wind: {wind} m/s</p>
    </div>
  );
}
```

---

## Learning Points

- **React Fundamentals**: State, props, component structure, hooks.
- **API Calls**: Using `fetch`/`async-await` to integrate remote APIs.
- **Vite Tooling**: Fast development, hot reloading, and minimal config.
- **Component-Based Design**: Modular UI for easy extension and maintenance.
- **Environment Variables**: How to safely use API keys locally.
- **Deployment**: How to publish your app with Vercel.

---

## Keywords

React, Vite, OpenWeather, Weather App, API Integration, JavaScript, Frontend, Web Development, Vercel Deployment, Learning Project, Beginner Friendly

---

## Conclusion

This project demonstrates how to build a simple, powerful, and modern weather web app using React and Vite. It's perfect for learning about React, working with APIs, and deploying frontend apps. Feel free to fork, modify, and use it as your own weather dashboard or as a starter for more advanced projects.

---

## References

- [OpenWeather API Documentation](https://openweathermap.org/current)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Vercel Documentation](https://vercel.com/docs)

---

## Happy Coding! 🚀

Thank you for checking out this project! If you have suggestions or find it helpful, feel free to star the repo and share it with others.  
**Happy Coding!** 😊

---
