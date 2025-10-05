# Farm Quest - NASA Space Apps Challenge 2025

A minimalist web game for the NASA Space Apps Challenge where players manage virtual farms using real-world satellite data and agricultural insights.

## Features

- 🔐 **Google OAuth Login** - Seamless authentication with Google accounts
- 🗺️ **Global Farm Selection** - Choose from 8 real-world farm locations across different continents
- 🎮 **Farm Management Game** - Monitor crops, manage resources, and optimize yields
- 🛰️ **Space-themed UI** - Minimal dark design with space/satellite aesthetics
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Technologies Used

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **NextAuth.js** for Google OAuth
- **Google Fonts** (Space Mono, Orbitron) for that cool tech look
- **Lucide React** for icons

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Google Cloud Console account (for OAuth and Maps API)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables:**
   
   Copy `.env.local` and fill in your credentials:
   ```env
   # NextAuth.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   
   # Google Maps API Key (optional for enhanced map view)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

3. **Google OAuth Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Game Flow

1. **Login** - Authenticate with Google OAuth
2. **Farm Selection** - Choose from 8 real-world farm locations:
   - 🌽 Heartland Corn Farm (Iowa, USA)
   - 🌾 Prairie Gold Wheat (Kansas, USA)
   - 🍚 Mekong Delta Rice (Vietnam)
   - ☕ Andean Coffee Estate (Colombia)
   - 🫘 Cerrado Soybean (Brazil)
   - 🍅 Mediterranean Tomato (Spain)
   - 🥔 Andes Potato Farm (Peru)
   - 🥛 Canterbury Dairy (New Zealand)
3. **Farm Management** - Monitor crops, manage resources, and complete missions

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/    # NextAuth API routes
│   │   ├── farm-selection/            # Farm selection page
│   │   ├── game/                      # Main game interface
│   │   ├── login/                     # Login page
│   │   ├── globals.css                # Global styles
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Home page (redirects to login)
│   ├── components/
│   │   ├── GoogleMap.tsx              # Google Maps integration (advanced)
│   │   ├── SimpleMap.tsx              # Simplified map component
│   │   └── providers.tsx              # NextAuth session provider
│   └── data/
│       └── farms.ts                   # Farm location data
├── .env.local                         # Environment variables
├── package.json
└── README.md
```

## Design Philosophy

- **Minimal & Clean** - Black background with green accent color (#00ff88)
- **Space Theme** - Using Orbitron and Space Mono fonts for that NASA/space aesthetic
- **Accessible** - High contrast and clear typography
- **Responsive** - Mobile-first design approach

## Next Steps / Future Enhancements

- 🛰️ Integration with real NASA Earth observation APIs
- 📊 Advanced data visualization for crop health
- 🌦️ Real-time weather data integration
- 🎯 Achievement system and scoring
- 👥 Multiplayer capabilities
- 📈 Historical data and trend analysis
- 🤖 AI-powered farming recommendations

## NASA Space Apps Challenge

This project is designed for the NASA Space Apps Challenge, focusing on:
- Sustainable agriculture
- Earth observation data utilization
- Climate adaptation strategies
- Food security solutions

## License

MIT License - feel free to use this as a starting point for your own NASA Space Apps projects!

---

**Built with 💚 for NASA Space AIPYNB pps Challenge 2025**
