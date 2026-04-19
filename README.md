# Sidequesting ⚔️

*Embark upon a grand adventure of friendship and challenge! Forge alliances, accept noble quests, and rise through the ranks of legendary adventurers in this realm of gamified glory.*

## 🏰 The Chronicles of Sidequesting

### 📜 The Quest Board
- **Craft Legendary Challenges**: Weave tales of valor and issue sidequests to your fellow adventurers
- **Choose Your Path**: Select from sacred categories of challenge:
  - 💪 **Fitness** - Test your physical prowess
  - 🦁 **Courage** - Face your fears with bravery
  - 🎨 **Creativity** - Unleash your artistic magic
  - 📚 **Wisdom** - Seek knowledge and enlightenment
  - 🤝 **Social** - Forge bonds with your companions
  - 🗺️ **Adventure** - Venture into the unknown
- **Command Your Destiny**: Send quests to one or many allies at once to gain XP and level up

### 🛡️ The Guild Roster
- **Seek Companions**: Scour the realm for worthy adventurers by name
- **Form Alliances**: Send scrolls of friendship and await their response
- **Manage Your Fellowship**: Accept or decline requests from potential allies
- **Behold Your Guild**: View the roster of your trusted companions

### 🏆 The Hall of Fame
- **Earn Glory**: Accumulate experience points through completed quests
- **Ascend the Rankings**: Witness your rise among your fellow adventurers
- **Celebrate Victories**: Behold the animated glow of your growing power

## ⚡ Getting Started

### Prerequisites
- Node.js 16+ and npm

### Setup

1. **Install dependencies**
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

2. **Configure environment variables**
   
   Copy the example environment file and update the JWT secret:
   
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `backend/.env` and replace the JWT_SECRET with a long random string (at least 32 characters):
   ```
   JWT_SECRET="your-long-random-secret-here-at-least-32-chars"
   ```

3. **Initialize the database**
   ```bash
   cd backend
   npm run setup:dev
   cd ..
   ```

4. **Start the application**

   Open two terminals:

   **Terminal 1** (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2** (Frontend):
   ```bash
   npm run web
   ```

   The app will open at `http://localhost:8081`

### Your First Steps in the Realm

1. **Create Your Legend**: Register with a username, email, and display name worthy of song
2. **Seek Fellowship**: Search for companions and send scrolls of friendship
3. **Begin Your Odyssey**: Once allies accept, commence the creation of quests and the earning of glory!

### First Time

1. Create an account with a username, email, and display name
2. Search for your friends and send them friend requests
3. Once they accept, you can start creating quests for each other!