# ShowUp2Move - Manual Testing Guide for Jury Demo

## Prerequisites

Start all three services before testing:

```bash
# Terminal 1 — Database
docker compose up -d

# Terminal 2 — Backend
cd backend
uv run uvicorn src.main:app --reload

# Terminal 3 — Frontend
cd frontend
npm run dev
```

Open the app at `http://localhost:5173` in your browser.

> **Multi-user testing**: Open a second browser window in **Incognito/Private mode** to log in as a second user simultaneously. Each window maintains its own session.

---

## PART 1: REGISTRATION & ONBOARDING

### 1.1 Register User A

1. Open `http://localhost:5173` — you should be redirected to `/login`
2. Click **"Sign up"** link at the bottom
3. Fill in:
   - Name: `Alex Popescu`
   - Email: `alex@test.com`
   - Password: `password123`
   - Confirm password: `password123`
4. Click **"Create account"**

**Expected**: Redirected to `/onboarding`

### 1.2 Onboarding Step 1 — Pick Sports

1. You see a **3x3 grid of 9 sports** with icons
2. Tap **Football**, **Basketball**, **Running** — each card highlights green
3. The Continue button shows **"Continue (3 selected)"**
4. Click **Continue**

**Expected**: Progress bar moves to step 2, skill level screen appears

### 1.3 Onboarding Step 2 — Skill Levels

1. You see cards for Football, Basketball, Running
2. For each sport, pick a skill level:
   - Football → **Intermediate**
   - Basketball → **Beginner**
   - Running → **Advanced**
3. Click **Continue**

**Expected**: Progress bar at step 3, bio/photo screen appears

### 1.4 Onboarding Step 3 — Bio, Photo, City

1. **Upload a photo**: Tap the camera circle, select any image
   - The circle now shows your photo preview
2. **AI Photo Analysis**: A purple button appears: *"Let AI detect sports from your photo"*
   - Click it — shows loading spinner
   - A toast notification appears: **"Photo analyzed! Sports detected."**
   - If Gemini API key is set, a purple card shows detected sports
3. **Write a bio**: Type `Weekend footballer and casual runner. Love 5-a-side games in Cluj.`
4. **AI Bio Analysis**: Click the green *"Let AI suggest sports from your bio"* button
   - Toast: **"Bio analyzed! Sports added to your picks."**
   - A green card shows AI-detected sports (e.g., Football, Running)
5. **City**: Type `Cluj-Napoca`
6. Click **"Let's go!"**

**Expected**: Redirected to `/home`

### 1.5 Register User B (Incognito window)

1. Open `http://localhost:5173` in an **Incognito/Private** window
2. Register with:
   - Name: `Maria Ionescu`
   - Email: `maria@test.com`
   - Password: `password123`
3. Complete onboarding:
   - Pick **Football**, **Volleyball**, **Tennis**
   - Set Football → **Intermediate**, Volleyball → **Beginner**, Tennis → **Advanced**
   - Bio: `Tennis player from Cluj, also enjoy football with friends`
   - City: `Cluj-Napoca`
   - Click **"Let's go!"**

---

## PART 2: HOME PAGE & AVAILABILITY

### 2.1 ShowUp Card

1. On User A's home page, you see a green gradient card: **"ShowUpToday?"**
2. Two buttons: **"Yes, I'm in!"** and **"Not today"**

### 2.2 Mark Availability + Smart Matching

1. Click **"Yes, I'm in!"** — card transforms into a sport picker grid
2. Select **Football**
3. Wait for the matching spinner: *"Finding your match..."*

**Expected**: Redirected to `/match` page

### 2.3 Match Result — Accept/Decline Flow

**If not enough players** (only 1 user available):
- Shows "Not enough players yet: 1/10 needed for Football"
- Click **"Back to home"**

**If enough players** (both users showed up for football):
- Shows **"Match found!"** with player cards
- Shows **compatibility score** (e.g., "78% compatible")
- Two buttons: **"Accept match"** and **"Decline"**
- Click **"Accept match"**
- Toast: **"Match confirmed! +10 XP"**
- Button changes to **"Go to event"**
- Click **"Go to event"** — navigates to the event detail page

### 2.4 Cancel Availability

1. Go back to Home
2. The green card now says **"You showed up today!"**
3. Click **"Cancel availability"** at the bottom
4. Toast: **"Availability cancelled"**
5. The "ShowUpToday?" card reappears

### 2.5 Available Users Strip

1. Have User B also show up (click "Yes, I'm in!" in incognito window)
2. On User A's home page, below the showed-up card, you see:
   - **"Available today (1)"** with User B's avatar, name, and sport

---

## PART 3: EVENT CREATION

### 3.1 Create a Manual Event

1. On Home page, click **"Create an event"** (dashed green button at bottom)
2. Fill in:
   - Sport: Tap **Football**
   - Title: `Friday Evening Football`
   - Date: Pick tomorrow's date
   - Time: `18:00`
   - Location: Wait for **venue suggestions** to appear below the location field
3. **Venue Map**: An interactive map shows venue markers in Cluj-Napoca
4. **Venue List**: Click **"Arena Sport Cluj"** in the suggested venues
   - Location field auto-fills with `Arena Sport Cluj, Str. Alexandrescu 63`
5. Max players: `10`
6. Description: `Friendly 5v5 match. All levels welcome!`
7. **Public/Private toggle**: Tap the toggle to switch between Public/Private — icon changes between globe and lock
8. Keep it **Public**
9. Click **"Create event"**

**Expected**: Toast "Event created!", redirected to event detail page

---

## PART 4: EVENT DETAIL PAGE

### 4.1 Event Header

1. You see the event card with:
   - Football icon + title "Friday Evening Football"
   - Date, time, participant count (1/10)
   - Location badge: "Arena Sport Cluj, Str. Alexandrescu 63"
   - Captain badge: "Captain: Alex Popescu"
   - Description text

### 4.2 Share Event

1. Click **"Share"** button
2. On desktop: Toast **"Copied!"** — the event link + details are in your clipboard
3. On mobile: Native share sheet opens

### 4.3 Add to Calendar

1. Click **"Add to calendar"**
2. Browser downloads an `.ics` file (e.g., `event_2.ics`)
3. Open it — your calendar app shows the event with correct date, time, location

### 4.4 Weather Recommendation

1. If the event has a date, a weather card appears:
   - Blue card = "Good weather, great for outdoor sports"
   - Amber card = weather warning with suggestion

### 4.5 Venue Map

1. Below the header, an interactive map shows venue markers
2. Click a marker — popup shows venue name, address, price

### 4.6 Join Event (as User B)

1. In the incognito window (User B), navigate to **Events** tab
2. Find "Friday Evening Football" in the list
3. Click it to open event detail
4. Click **"Join this event"**
5. Toast: **"You joined the event! +10 XP"**
6. Player strip now shows both Alex and Maria
7. Chat section and polls become visible

### 4.7 Group Chat

1. As User B, type in the chat input: `Hey! Looking forward to the game`
2. Click the send button (or press Enter)
3. Message appears with sender name, timestamp, and green bubble
4. Switch to User A's window — message appears within 5 seconds (auto-polling)
5. As User A, reply: `Same here! See you at 6`
6. Captain messages show a gold **"Captain"** badge

### 4.8 Create a Poll (Captain Only)

1. As User A (the captain), scroll to the polls area
2. Click **"Create a poll"** (dashed button)
3. A form expands:
   - Question: `What time works best?`
   - Option 1: `17:00`
   - Option 2: `18:00`
   - Click **"Add option"** → Option 3 appears
   - Option 3: `19:00`
4. Click **"Create"**
5. Toast: **"Poll created!"**
6. The poll appears with all 3 options at 0%

### 4.9 Vote on Poll

1. As User A, click **"18:00"** — it highlights green, shows 100%
2. Switch to User B — the poll is visible
3. As User B, click **"17:00"** — shows 50%/50% split
4. User B changes vote by clicking **"18:00"** — now 100% for 18:00

### 4.10 Leave Event

1. As User B, click the red **"Leave event"** button
2. Toast: **"You left the event"**
3. Button changes back to **"Join this event"**
4. Chat and polls are no longer visible

---

## PART 5: EVENTS BROWSING

### 5.1 Events List

1. Tap the **Events** tab in the bottom nav
2. All public events are listed with:
   - Sport icon, title, status badge (Confirmed/Waiting)
   - Date/time, player count, location
3. Click **"New"** button (top right) → goes to create event page

### 5.2 My Events on Home

1. Go to **Home** tab
2. Under "Your events", see your events with status badges
3. Click **"See all"** → navigates to Events page

---

## PART 6: PROFILE PAGE

### 6.1 View Profile

1. Tap the **Profile** tab in the bottom nav
2. See: avatar (or initials), name, city

### 6.2 XP & Level System

1. **Level card** shows:
   - Current level (e.g., "Level 1")
   - XP count (e.g., "20 XP")
   - Progress bar (fills up every 50 XP)
   - "30 XP to next level"
   - "2 events joined"

### 6.3 Badges

1. **Badges card** shows earned badges:
   - **First Match** (trophy icon) — joined ≥1 event
   - **Storyteller** (pen icon) — has a bio
   - **Photo Ready** (camera icon) — has an avatar
2. Badges NOT yet earned don't appear (earn them by joining more events):
   - **Team Player** — join ≥5 events
   - **Veteran** — join ≥10 events
   - **Multi-Sport** — select ≥3 sports

### 6.4 AI Photo Analysis

1. If you have an avatar, a purple button appears: **"Let AI detect sports from your photo"**
2. Click it — analyzes your photo and shows detected sports

### 6.5 Edit Profile

1. Click **"Edit profile"**
2. Name field becomes editable, bio becomes a textarea, city input appears
3. Change the bio to: `Football lover and weekend runner from Cluj-Napoca`
4. Click **"Save"**
5. Toast: **"Profile updated!"**

### 6.6 Upload Photo from Profile

1. Click the small camera icon on the avatar
2. Select a new image
3. Toast: **"Photo uploaded!"**
4. Avatar updates immediately

### 6.7 My Sports

1. Below the bio, see your sports list:
   - Football — Intermediate
   - Basketball — Beginner
   - Running — Advanced

### 6.8 Log Out

1. Click **"Log out"** at the bottom
2. Redirected to login page
3. Token cleared — refreshing any protected page redirects to login

---

## PART 7: MULTI-USER REAL-TIME DEMO

This is the most impressive demo for the jury — show two users interacting live.

### 7.1 Setup

- **Window 1**: User A (Alex) logged in normally
- **Window 2**: User B (Maria) logged in via Incognito

### 7.2 Live Matching Demo

1. **User A**: Click "Yes, I'm in!" → pick Football
2. **User B**: Click "Yes, I'm in!" → pick Football
3. Both get matched together (if min group reached for football, need 10; with fewer, show "not enough players yet")
4. **Tip**: For a guaranteed match, use **Tennis** (min 2 players) or **Running** (min 2)

### 7.3 Live Chat Demo

1. Both users join the same event
2. User A sends a message → appears in User B's chat within 5 seconds
3. User B replies → appears in User A's chat
4. Show the captain badge on captain's messages

### 7.4 Live Poll Demo

1. Captain creates a poll
2. Both users vote — percentages update in real-time
3. A user changes their vote — percentages adjust

---

## PART 8: AI FEATURES (requires GEMINI_API_KEY)

> Set `GEMINI_API_KEY` in `backend/.env` to enable AI features. Without it, they return graceful fallbacks.

### 8.1 Bio Analysis

1. During onboarding or on profile, write a sports-related bio
2. Click "Let AI suggest sports from your bio"
3. AI detects sports mentioned and suggests skill levels

### 8.2 Photo Analysis

1. Upload a sports-related photo (e.g., someone holding a tennis racket)
2. Click "Let AI detect sports from your photo"
3. AI identifies sports equipment/activity in the image

### 8.3 Weather Recommendations

1. Create an event with tomorrow's date
2. Open the event detail page
3. A weather card shows AI-generated outdoor activity advice

### 8.4 Compatibility Score

1. Trigger a match between 2+ users
2. The match result page shows a compatibility percentage
3. Score is calculated from: skill balance, city proximity, bio overlap, group size

---

## PART 9: MAP & VENUE INTEGRATION

### 9.1 Venue Map on Create Event

1. Go to Create Event, select a sport (e.g., Football)
2. Below the location field: interactive OpenStreetMap with markers
3. Click a marker — popup shows venue name, address, price
4. Click a venue from the list — location auto-fills

### 9.2 Venue Map on Event Detail

1. Open any event with a location
2. Map shows the venue marker(s) with popups

---

## QUICK FEATURE CHECKLIST

| # | Feature | Where to Demo |
|---|---------|---------------|
| 1 | User registration | `/register` |
| 2 | User login | `/login` |
| 3 | Multi-user sessions | Normal + Incognito windows |
| 4 | 3-step onboarding wizard | `/onboarding` |
| 5 | Sport selection (9 sports) | Onboarding step 1 |
| 6 | Skill level picker | Onboarding step 2 |
| 7 | Avatar upload | Onboarding step 3 + Profile |
| 8 | AI bio analysis | Onboarding step 3 + Profile |
| 9 | AI photo analysis | Onboarding step 3 + Profile |
| 10 | ShowUp availability card | Home page |
| 11 | Cancel availability | Home page |
| 12 | Available users today | Home page |
| 13 | Smart matching algorithm | Home → Pick sport |
| 14 | Match accept/decline | Match result page |
| 15 | Compatibility score | Match result + Event detail |
| 16 | XP reward system | Match confirm, event join |
| 17 | Create event form | `/events/create` |
| 18 | Venue suggestions + map | Create event page |
| 19 | Public/private toggle | Create event page |
| 20 | Events browsing | `/events` |
| 21 | My events list | Home page |
| 22 | Event detail view | `/events/:id` |
| 23 | Join/leave event | Event detail page |
| 24 | Share event (clipboard/native) | Event detail page |
| 25 | Calendar export (.ics) | Event detail page |
| 26 | Weather recommendation | Event detail page |
| 27 | Group chat (5s polling) | Event detail page |
| 28 | Captain badge in chat | Event detail page |
| 29 | Create poll (captain) | Event detail page |
| 30 | Vote on polls | Event detail page |
| 31 | Profile view/edit | `/profile` |
| 32 | XP bar + level display | Profile page |
| 33 | Achievement badges | Profile page |
| 34 | Toast notifications | Throughout the app |
| 35 | Responsive mobile design | Resize browser |
| 36 | JWT authentication | All protected routes |
| 37 | Bottom navigation bar | Home, Events, Profile |
| 38 | Seed data (venues, sports) | Auto-loaded on backend start |

---

## TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| Backend won't start | Check Docker is running: `docker compose up -d` |
| "Unauthorized" errors | Token expired — log out and log back in |
| AI features return empty | Set `GEMINI_API_KEY` in `backend/.env` |
| Map not loading | Check internet connection (tiles from OpenStreetMap CDN) |
| Matching says "not enough players" | Use Tennis or Running (min 2 players) instead of Football (min 10) |
| No venues showing | Backend needs seed data — restart backend to trigger `seed_database()` |
