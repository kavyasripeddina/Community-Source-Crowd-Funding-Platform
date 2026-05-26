# HopeBridge - Community Crowdfunding Platform

A full-stack MERN application for medical and emergency fundraising.

## 🚀 Features
- **User Authentication:** JWT-based secure login and registration.
- **Campaign Management:** Create, Read, Update, Delete campaigns.
- **Donation System:** Automatic updates of raised amounts and progress bars.
- **Admin Dashboard:** Approve/Reject campaigns, toggle featured status, and track metrics.
- **Responsive UI:** Modern, visually excellent design using Tailwind CSS, Framer Motion, and Lucide Icons.

## 📁 Folder Structure
```
root/
├── .env                # Backend environment variables
├── server.js           # Backend entry point
├── package.json        
├── config/             # DB Connection
├── controllers/        # Express Route Handlers
├── middleware/         # Auth, Error, & Multer
├── models/             # Mongoose Schemas
├── routes/             # Express Routers
├── uploads/            # Auto-created for campaign images
│
└── client/             # Frontend React + Vite
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── index.css
        ├── main.jsx
        ├── App.jsx
        ├── components/ # Reusable UI Components
        ├── context/    # React Context (Auth)
        ├── pages/      # Route Pages
        └── utils/      # Axios API handler
```

## 🛠️ Step-by-Step Setup

### Prerequisites
Make sure you have MongoDB installed and running locally on `mongodb://localhost:27017/crowdfund`. Set up your environment variables if needed in the `.env` file at the root.

### 1. Backend Setup
1. Open a new terminal at the root (`Crowd`).
2. Install npm dependencies (already done).
3. Start the server:
   ```bash
   npm run dev
   ```
   *The backend runs on http://localhost:5000*

### 2. Frontend Setup
1. Open a new terminal inside the `client` directory.
2. Install dependencies (already done).
3. Start the Vite React app:
   ```bash
   npm run dev
   ```
   *The frontend runs on http://localhost:5173*

## 💡 How to test Admin functionality
1. Register a new account normally on the frontend.
2. Open MongoDB Compass (or Mongo Shell) and connect to `mongodb://localhost:27017/crowdfund`.
3. Go to the `users` collection, find your user document, and change the `"role"` from `"user"` to `"admin"`.
4. Refresh your browser, and you will see the Admin Panel tab in your profile/nav dropdown to approve campaigns!
