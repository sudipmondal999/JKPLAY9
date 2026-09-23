🎵 KINGPlay

A modern music + stories platform with YouTube-powered playback,
playlists, user profiles, Jam Mode, Sleep Timer, and Firebase
authentication.

📌 Project Overview

KingPlay is a full-stack web application designed as a modern music
and stories platform.

Users can:

Discover and play music through official YouTube embeds

Search for YouTube music

Add songs to KingPlay using a YouTube URL

Create and manage playlists

Like songs

View listening history

Manage a personal profile

Read and publish stories

Create and join synchronized Jam rooms

Use a global music player

Set a Sleep Timer

Sign in with Google or Email/Password

KingPlay does not download, extract, rip, or re-host YouTube audio.

✨ Main Features

🎧 Music

YouTube-powered music playback

Global persistent music player

Play / pause

Previous / next

Seek

Volume control

Queue

Shuffle

Repeat

Favorites / liked songs

Recently played

Responsive mini and full-screen player

🔗 Add Song from YouTube

Users can add songs directly from their profile.

Flow:

Profile
   ↓
Add Song
   ↓
Paste YouTube URL
   ↓
Fetch metadata
   ↓
Preview song
   ↓
Select playlist
   ↓
Add to playlist

Only the YouTube video ID and metadata are stored. KingPlay does not
store the YouTube audio file.

📂 Playlists

Users can:

Create playlists

Rename playlists

Delete playlists

Add songs

Remove songs

Reorder songs

View playlist details

Play an entire playlist

👤 User Profiles

Profiles include:

Avatar

Display name

Username

Bio

User playlists

Recently added songs

Recently played songs

Liked songs

🔐 Authentication

Authentication is handled by Firebase Authentication.

Supported methods:

Google Login

Email/Password Sign Up

Email/Password Login

Forgot Password

Password Reset

Logout

Persistent sessions

Firebase ID-token verification

The backend verifies Firebase ID tokens using firebase-admin.

🌙 Sleep Timer

The global player supports:

5 minutes

10 minutes

15 minutes

30 minutes

45 minutes

60 minutes

Custom duration

End of current song

Optional fade-out

The timer remains active while navigating through KingPlay.

🤝 Jam Mode

Jam Mode allows users to listen together.

Features:

Create a Jam room

Join using a room code

Participant list

Shared queue

Play/pause synchronization

Seek synchronization

Track-change synchronization

Host controls

📖 Stories

KingPlay also contains a story platform with:

Story discovery

Story categories

Story reader

Story author

Story creation

Story editing

Story publishing

🏗️ Current Architecture

                    ┌─────────────────────┐
                    │      KingPlay       │
                    │     Web Client      │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
      Firebase Auth       KingPlay API      YouTube APIs
             │                 │                 │
             │                 ▼                 │
             │          Firebase Admin          │
             │                 │                 │
             │                 ▼                 │
             │          PostgreSQL              │
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                    Official YouTube Player

🧰 Technology Stack

Frontend

The current AI Studio project uses a modern React-based frontend.

Depending on the generated project configuration, the main technologies
include:

React

TypeScript / JavaScript

CSS / Tailwind CSS

Firebase Web SDK

YouTube embedded player

Client-side state management

Authentication

Firebase Authentication

Google OAuth

Email/Password authentication

Firebase session persistence

Firebase Admin SDK for server verification

Backend

Node.js

Express / server routes

Firebase Admin SDK

REST API

Authentication middleware

Database

PostgreSQL

Cloud SQL

User/profile data

Playlists

Songs

Likes

History

Stories

Jam data

External Services

Firebase

Google OAuth

YouTube Data API

YouTube IFrame Player API

PostgreSQL / Cloud SQL

Deployment

The application can be deployed using platforms such as:

Vercel for compatible frontend/serverless workloads

Other Node-compatible hosting for a separate backend

🔐 Authentication Architecture

User
  │
  ├── Google Login
  │
  └── Email/Password
          │
          ▼
   Firebase Authentication
          │
          ▼
    Firebase ID Token
          │
          ▼
      KingPlay API
          │
          ▼
 firebase-admin.verifyIdToken()
          │
          ▼
       PostgreSQL

The database does not store user passwords.

Firebase remains responsible for authentication credentials.

🗄️ Database Concept

The PostgreSQL database stores application-level data.

Typical entities include:

users
songs
playlists
playlist_songs
likes
play_history
stories
jam_rooms
jam_participants

A user record is associated with the Firebase UID.

Example relationship:

Firebase User
     │
     │ uid
     ▼
PostgreSQL users
     │
     ├── playlists
     ├── likes
     ├── history
     ├── stories
     └── jam rooms

🎵 YouTube Integration

KingPlay uses YouTube as the playback source.

Stored

KingPlay may store:

YouTube video ID

YouTube URL

Title

Channel/artist

Thumbnail URL

Duration

Metadata

Playlist relationships

Not stored

KingPlay must not store:

Downloaded YouTube audio

Extracted MP3 files

Ripped video files

Proxied YouTube media streams

Playback should use the official YouTube embedded/player mechanism.

📁 Suggested Project Structure

The exact structure depends on the current AI Studio-generated project,
but the application should follow a modular structure similar to:

KingPlay/
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── music/
│   │   ├── player/
│   │   ├── playlists/
│   │   ├── profile/
│   │   ├── jam/
│   │   └── stories/
│   │
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── api.ts
│   │   └── youtube.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── playerStore.ts
│   │
│   ├── pages/
│   └── styles/
│
├── server/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── songs.ts
│   │   ├── playlists.ts
│   │   ├── stories.ts
│   │   └── jam.ts
│   │
│   ├── middleware/
│   ├── services/
│   └── db/
│
├── public/
│
├── .env.example
├── package.json
└── README.md

Keep the actual repository structure authoritative. Do not create
duplicate folders just to match this documentation.

⚙️ Environment Variables

Create a .env.local file for local development.

Example Firebase Web configuration:

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

Other application variables may include:

DATABASE_URL=
YOUTUBE_API_KEY=
API_BASE_URL=

Server-only Firebase Admin credentials must remain private.

Important

Never commit:

.env
.env.local
service-account.json
Firebase Admin private keys
database passwords
API secrets

Commit an .env.example file instead.

🚀 Local Development

1. Clone the repository

git clone <YOUR_GITHUB_REPOSITORY>
cd KingPlay

2. Install dependencies

Use the package manager defined by the project.

For npm:

npm install

3. Configure environment variables

Create:

.env.local

and add the required Firebase, database, YouTube, and backend values.

4. Start development

For a typical frontend project:

npm run dev

If the project contains a separate backend, start it using the backend
script defined in package.json.

Example:

npm run server

5. Open the application

The development URL is normally:

http://localhost:3000

or the port shown by the development server.

🔥 Firebase Setup

Create a Firebase project and add a Web App.

Enable:

Authentication
├── Google
└── Email/Password

Authorized Domains

Add your local development domain:

localhost

Add the production domain after deployment.

Google Login

Firebase:

Authentication
→ Sign-in method
→ Google
→ Enable

The Google OAuth flow is handled by Firebase.

🐘 PostgreSQL Setup

Create a PostgreSQL database / Cloud SQL instance.

Configure:

DATABASE_URL=

Run the project's database migrations or initialization commands defined
by the repository.

Verify that the application can:

Connect to PostgreSQL

Authenticate a Firebase user

Verify the Firebase ID token

Create/find the corresponding PostgreSQL user

Read/write authorized user data

🔑 Authentication Flow

Google

Click Google Login
       ↓
Firebase signInWithPopup()
       ↓
Google authentication
       ↓
Firebase session
       ↓
Firebase ID token
       ↓
KingPlay backend
       ↓
verifyIdToken()
       ↓
Get/create PostgreSQL user
       ↓
KingPlay authenticated

Email/Password

Sign Up
  ↓
Firebase createUserWithEmailAndPassword()
  ↓
Firebase user
  ↓
Profile synchronization
  ↓
PostgreSQL user

🔎 YouTube Song Flow

User Profile
     ↓
Add Song
     ↓
Paste YouTube URL
     ↓
Extract Video ID
     ↓
Fetch metadata
     ↓
Preview
     ↓
Select playlist
     ↓
Save metadata
     ↓
Play through official YouTube player

🌙 Sleep Timer Flow

User selects timer
       ↓
Global player store
       ↓
Store absolute end timestamp
       ↓
Countdown
       ↓
Timer reaches zero
       ↓
Pause YouTube playback
       ↓
Sleep Mode disabled

Use an absolute timestamp rather than relying only on interval tick
counts so browser background throttling does not cause major timer
drift.

🤝 Jam Mode Architecture

A Jam room contains:

Room
├── Host
├── Participants
├── Current Song
├── Playback Position
└── Queue

Playback events may include:

PLAY
PAUSE
SEEK
LOAD_TRACK
QUEUE_UPDATE
JOIN
LEAVE

Clients should synchronize using timestamps/positions rather than
continuously transmitting playback state.

🛡️ Security

KingPlay should:

Verify Firebase ID tokens server-side

Protect private API routes

Validate request bodies

Validate YouTube URLs

Use parameterized database queries

Keep secrets server-side

Apply rate limiting where appropriate

Configure CORS correctly

Avoid exposing Firebase Admin credentials

Prevent users from modifying another user's private data

Never trust a user ID supplied by the browser when the authenticated
Firebase UID is available from the verified token.

📱 Responsive Design

KingPlay should support:

Mobile

Tablet

Desktop

Large desktop displays

Mobile navigation should use a dedicated mobile navigation pattern
rather than simply shrinking the desktop sidebar.

The music player should provide:

Desktop

Persistent bottom player.

Mobile

Compact mini player + full-screen player.

🎨 Design Direction

KingPlay uses a premium dark visual identity.

Style

Dark background

Purple / indigo accents

Glassmorphism used carefully

Rounded cards

Large artwork

Soft borders

Smooth transitions

Clean typography

Responsive layout

Main navigation:

Home
Search
Library
Stories
Jam
Profile

🧪 Testing Checklist

Before production deployment, test:

Authentication

Google Login

Email Sign Up

Email Login

Logout

Forgot Password

Reset Password

Session persistence

Protected routes

Firebase ID-token verification

Music

Search

Play

Pause

Seek

Next

Previous

Queue

Shuffle

Repeat

Like

History

YouTube

Valid URL

Invalid URL

Metadata loading

Unavailable video

Embedded playback

Deleted/private video handling

Playlists

Create

Rename

Add song

Remove song

Reorder

Delete

Profile

View profile

Edit profile

Add YouTube song

Recently added

Sleep Timer

Preset timers

Custom timer

End-of-song

Cancel timer

Timer survives navigation

Player pauses at expiration

Jam

Create room

Join room

Participant list

Play sync

Pause sync

Seek sync

Track-change sync

Reconnection

Stories

Browse

Read

Create

Edit

Publish

☁️ Deployment

Vercel

For a Vercel-compatible frontend:

Push the project to GitHub.

Import the repository into Vercel.

Configure the correct framework/build settings.

Add production environment variables.

Deploy.

Add the production domain to Firebase Authentication → Authorized
domains.

If the backend is a separate long-running Node/Express server, deploy it
to a Node-compatible backend host and configure the frontend API URL
accordingly.

Do not assume a separate Express server can run as a persistent process
on every frontend hosting configuration.

🌐 Production Checklist

Before launch:

Production Firebase project configured

Google provider enabled

Email/Password enabled

Production authorized domain added

Production database configured

Environment variables configured

Firebase Admin credentials stored securely

YouTube API key restricted appropriately

CORS configured

HTTPS enabled

Database backups configured

Authentication tested

Player tested

Jam tested

Mobile UI tested

⚖️ YouTube & Copyright

KingPlay must respect applicable YouTube terms and copyright
requirements.

KingPlay must not:

Download YouTube music

Extract YouTube audio

Convert YouTube videos to MP3

Re-host unauthorized copyrighted audio

Proxy YouTube media streams

Circumvent YouTube restrictions

Remove required YouTube functionality

KingPlay should use official YouTube embedding and permitted YouTube API
functionality.

For independently hosted music, obtain the necessary rights/licenses
before hosting or distributing the content.

🗺️ Development Roadmap

Phase 1 --- Foundation

Core UI

Firebase authentication

Google Login

Email/Password authentication

PostgreSQL user synchronization

Phase 2 --- Music

YouTube search

YouTube player

Global player

Queue

Likes

History

Phase 3 --- Library

Playlists

Add YouTube song

Playlist management

User library

Phase 4 --- Stories

Story discovery

Story reader

Story creation

Story management

Phase 5 --- Jam

Create room

Join room

Realtime synchronization

Shared queue

Host controls

Phase 6 --- Polish

Sleep Timer

Responsive optimization

Accessibility

Performance

Error states

Loading states

Security review

Phase 7 --- Production

Production Firebase

Production PostgreSQL

Environment configuration

Deployment

Domain

Monitoring

Final testing

🐛 Troubleshooting

Google Login doesn't work

Check:

Firebase Authentication → Google is enabled.

Current domain exists under Firebase Authorized Domains.

Firebase Web App configuration matches the correct project.

Browser popup permissions are not blocking the login.

The application is using the intended Firebase project.

User appears in PostgreSQL but not Firebase

Check that registration/login is actually calling Firebase
Authentication.

A PostgreSQL user record alone does not prove that a Firebase Auth
account exists.

Verify the Firebase UID and Firebase project ID.

Authentication works locally but not after deployment

Check:

Production Firebase authorized domain

Production environment variables

Firebase project configuration

Google OAuth configuration

Backend Firebase Admin credentials

CORS settings

🤝 Contributing

For development:

git checkout -b feature/your-feature

Make your changes, test them locally, and submit a pull request.

Keep features modular and avoid breaking existing KingPlay
functionality.

📄 License

Add the project's chosen license here before public distribution.

If KingPlay uses third-party APIs, libraries, media, or assets, comply
with their respective licenses and terms.

👑 KingPlay

Music. Stories. Together.

Built as a modern web platform for discovering music through YouTube,
managing personal libraries, reading stories, and listening together
with friends.
