# DFF AI Program Assistant — Deployment Guide

## What is in this folder

```
dff-proxy/
├── api/
│   └── chat.js        ← Backend proxy (hides your API key)
├── public/
│   └── index.html     ← The chatbot frontend
├── vercel.json        ← Vercel deployment config
├── package.json       ← Project info
└── README.md          ← This file
```

## How to deploy to Vercel (FREE — 5 minutes)

### Step 1 — Create a GitHub account
Go to github.com and sign up (free).

### Step 2 — Upload this folder to GitHub
1. Click the + button → "New repository"
2. Name it: dff-ai-assistant
3. Click "Create repository"
4. Upload all files from this folder (drag and drop)

### Step 3 — Create a Vercel account
Go to vercel.com → Sign up with GitHub (free).

### Step 4 — Deploy
1. Click "Add New Project"
2. Import your GitHub repository "dff-ai-assistant"
3. Click Deploy (Vercel auto-detects the config)

### Step 5 — Add your API key (the secret step)
1. In Vercel dashboard → your project → Settings → Environment Variables
2. Click "Add New"
3. Name:  ANTHROPIC_API_KEY
4. Value: sk-ant-api03-xxxxxxxxxx  (paste your key here)
5. Click Save
6. Go to Deployments → click "Redeploy"

### Step 6 — Your app is live!
Vercel gives you a URL like:
https://dff-ai-assistant.vercel.app

That is your production chatbot — shareable, secure, no API key visible.

---

## How the security works

BEFORE (broken - key exposed):
Browser → Anthropic API (CORS blocked + key visible in HTML)

AFTER (correct - key hidden):
Browser → Your Vercel proxy → Anthropic API
         (no key in browser)  (key safe on server)

---

## Cost
- Vercel hosting: FREE (hobby plan)
- Anthropic API: pay per use (~$0.003 per conversation)
- Domain (optional): FREE subdomain from Vercel, or ~$10/yr custom domain
