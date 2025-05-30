APP FLOW
🟢 1. Landing Page
Route: /

CTA: “Describe Your Game” → leads to login or builder

Animations, sample games, how-it-works section

🔐 2. Auth (Google OAuth via Supabase)
Routes: /login / /signup

Users authenticate with Google

On success → redirect to /dashboard

🧭 3. Dashboard
Route: /dashboard

Features:

“Create Game” button

List of previously generated games (with preview/download links)

Option to delete, duplicate, or edit games

✍️ 4. Game Builder
Route: /create

User describes the game: e.g., “A 2D cyberpunk platformer with AI bosses and gravity flips”

Trigger AI pipeline:

Agent 1 (Narrative Generator) → story + level objectives

Agent 2 (Code Synthesizer) → platformer logic (Unity/Godot)

Agent 3 (Asset Generator) → prompts + images via Gemini Vision

Show status (e.g., generating sprites, writing logic...)

👁️ 5. Preview Game
Route: /preview/[gameId]

Show:

Narrative structure

Game logic (editable code preview)

Generated sprite thumbnails

Quickplay GIF (optional)

“Download” and “Remix” buttons

🛠️ 6. (Optional) Game Editor
Route: /edit/[gameId]

Users can tweak code, upload custom assets

Save updated version or fork

📦 7. Downloads
Route: /downloads

List of games ready to export

Download Unity/Godot ZIP

Option to regenerate assets

👤 8. Profile Page
Route: /profile

Update user info, auth options

View quota, usage stats (if freemium)

ℹ️ 9. About / Terms / Privacy
Routes: /about, /terms, /privacy

Legal + project info

