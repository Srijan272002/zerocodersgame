Project Summary: GameForge
GameForge is a no-code platform that lets users describe a game idea in plain English. AI agents then autonomously generate storyline, logic, sprites, and export-ready code using Unity or Godot—all through an elegant Next.js interface.

🧠 TECH STACK
🔍 AI & Autonomous Agents
Tool	Purpose
Gemini 1.5 Pro / Flash	LLM used for:
• interpreting game idea
• generating storyline, level design
• writing code in C# (Unity) or GDScript (Godot)
Gemini Vision / Imagen 2 (optional)	Text-to-image generation for sprites/backgrounds
Google Cloud Functions	Orchestrates agents asynchronously and securely

🧩 Backend & Storage
Tool	Purpose
Supabase	• Auth (Google OAuth)
• PostgreSQL database for users & game data
• Storage for assets and game ZIPs
Node.js (optional)	Utility server for zipping files, asset validation
tRPC or REST API routes (Next.js)	Agent requests and task orchestration via Next.js server routes

🎮 Game Engine Integration
Tool	Purpose
Unity CLI / Godot CLI	Compile and preview games locally or via downloadable project
Archiver (e.g., adm-zip)	To bundle generated code + assets into a downloadable ZIP

🌐 Frontend (Modern UI)
Tool	Purpose
Next.js 14 (App Router)	Fullstack frontend framework (SSR + routing + API)
Tailwind CSS	Utility-first styling
ShadCN/UI	Modern component library (cards, modals, tabs, inputs)
Framer Motion	Smooth animations, transitions
Lottie / React Icons / Lucide	Rich UX and micro-interactions
NextAuth.js or Supabase Auth	Google OAuth integration

