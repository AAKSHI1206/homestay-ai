# Homestay AI

An AI-powered homestay platform that helps travelers discover accommodations and receive personalized travel recommendations while enabling hosts to manage bookings efficiently.

## Tech Stack

### Frontend
- React 19 (Vite 8)
- Tailwind CSS v4
- React Router v7

### Backend
- Node.js
- Express.js
- In-memory data store (Week 4)

### Planned (Future Weeks)
- MongoDB Atlas (Week 5)
- JWT Authentication
- Gemini API
- Vercel + Render deployment

---

## Project Structure

```
homestay-ai-component-library/
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── api/           # API client (listingsApi.js)
│   │   ├── components/    # Navbar, Footer, Card, Hero
│   │   │   └── ui/        # Button, Input, Modal, Loader, Toast
│   │   ├── context/       # ThemeContext (dark/light mode)
│   │   ├── pages/         # Home, Listings, Dashboard, About, Login
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── backend/               # Express.js API
│   ├── controllers/       # listingController.js
│   ├── routes/            # listingRoutes.js
│   ├── middleware/        # errorHandler.js, validateListing.js
│   ├── data/              # listings.js (in-memory store)
│   ├── utils/             # (reserved for future utilities)
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Setup & Run

### Prerequisites
- Node.js 18+
- npm

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Server starts at **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens at **http://localhost:5173**

### Environment Variables

Copy `.env.example` to `.env` in the backend folder:

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## API Endpoints

| Method   | Endpoint                     | Description            | Status Codes     |
|----------|------------------------------|------------------------|------------------|
| `GET`    | `/api/health`                | Health check           | 200              |
| `GET`    | `/api/listings`              | All listings           | 200              |
| `GET`    | `/api/listings/featured`     | Featured listings only | 200              |
| `GET`    | `/api/listings/search?q=`    | Search / filter        | 200, 400         |
| `GET`    | `/api/listings/:id`          | Single listing         | 200, 404         |
| `POST`   | `/api/listings`              | Create listing         | 201, 400         |
| `PUT`    | `/api/listings/:id`          | Update listing         | 200, 400, 404    |
| `DELETE` | `/api/listings/:id`          | Delete listing         | 204, 404         |

### Search Query Parameters

| Param      | Type   | Description                    |
|------------|--------|--------------------------------|
| `q`        | string | Keyword search (title, desc, location, amenities) |
| `location` | string | Filter by location             |
| `minPrice` | number | Minimum price per night        |
| `maxPrice` | number | Maximum price per night        |
| `guests`   | number | Minimum guest capacity         |

---

## Project Status

- **Week 1**: Repository initialization and project planning
- **Week 2**: Component library (Button, Input, Modal, Loader, Toast)
- **Week 3**: Pages, routing, dark mode, responsive layout
- **Week 4**: Backend API (Express.js), frontend integration, CRUD operations