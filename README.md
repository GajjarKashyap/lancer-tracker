<div align="center">

# 🎯 Lancer Tracker v2
**The Ultimate Command Center for Your Coding Journey**

[![Made with JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](#)

*A privacy-first, zero-backend study tracker built for developers who want to learn faster, track smarter, and never lose a brilliant line of code again.*

[**Explore the Features**](#-core-features) • [**Quick Setup**](#-zero-to-hero-local-setup) • [**Deploy Live**](#-deploying-to-the-web)

</div>

---

## 💡 The "Why" Behind Lancer

Ever sat through a brilliant coding lecture, only to forget that one crucial piece of syntax three days later? Or spent hours debugging a problem, just to hit the *exact same bug* a week later and forget how you fixed it? 

**Lancer Tracker v2 is the solution.** It is not just a notepad; it is an organized, heavily structured **second brain** for your programming classes and self-study sessions. It lives entirely in your browser, works offline, and keeps your knowledge neatly categorized and instantly exportable.

---

## 🎨 Visual Sneak Peek
**Small Demo:-**

![Gif To show They Wrok](images/Untitled.gif)
`Newsession`→`Code`→`Snipt`→`Error`→`Tip`→`Learing`→`WhatNext?`→`ToDo`


---

## ✨ Core Features

Lancer isn't just a UI—it's packed with functional tools designed for the modern developer.

### 💻 The Dev-Centric Workspace
* **Integrated Code Editor:** Powered by **CodeMirror**, featuring syntax highlighting, auto-indentation, and autocomplete (just press `Ctrl + Space`) for Python, JavaScript, Java, C++, HTML, and CSS.
* **Snippets Vault:** Stop losing good code. Save specific, tagged code blocks directly from your lectures.
* **Error Logger:** Turn mistakes into lessons. Document the bug you faced and the exact solution you used to fix it.
* **Micro-Tasking:** Built-in To-Do lists to keep you focused on immediate session goals.

### ⏱️ Telemetry & Analytics
* **Live Session Timer:** Hit start, focus on coding, and let Lancer track your exact study duration.
* **Manual Logging:** Forgot to start the timer? No problem. Log retro-active sessions with manual minute entry.
* **Global Dashboard:** Watch your stats grow. Track total study hours, session counts, and total snippets saved over time.

### 🎨 Beautiful, Distraction-Free UI
* **5 Dynamic Themes:** Instantly switch between *Abyss (Default), Dark, Dim (Eye-care), Light,* and *White*.
* **Terminal Bootloader:** An incredibly cool, randomized simulated terminal boot sequence that "loads" your data.

### 🔒 Privacy & Portability
* **100% Local Storage:** No databases. No accounts. Your data lives strictly in your browser's `localStorage`.
* **One-Click Markdown Export:** Click `⬇ Export .md` to instantly compile your entire session (notes, snippets, errors, and todos) into a beautifully formatted Markdown file. Perfect for GitHub, Obsidian, or Notion!

---

## 🛠️ The Tech Stack

Lancer proves you don't need heavy frameworks to build powerful applications:
* **Frontend:** Pure HTML5, CSS3, and Vanilla JavaScript (ES5/ES6).
* **State Management:** Browser `localStorage` JSON serialization.
* **Editor Engine:** CodeMirror 5 (loaded via CDN).
* **Styling:** Modular CSS with dynamic custom variables (`var(--theme)`) for instant theme swapping.

---

## 🚀 Zero to Hero: Local Setup

Want to try it right now? It takes less than 10 seconds. No Node.js, no `npm install`, no setup.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/GajjarKashyap/lancer-tracker.git](https://github.com/GajjarKashyap/lancer-tracker.git)
    cd lancer-tracker
    ```
2.  **Run the app:**
    Simply double-click `index.html` to open it in your favorite browser. 
    *That's it. You're ready to track!*

---

## 🌐 Deploying to the Web (Free Hosting)

Want to access your tracker from anywhere? Let's host it for free on GitHub Pages using your account.

### Step 1: Push your code to GitHub
Open your terminal inside the project folder and run:
```bash
# Initialize git and commit your files
git init
git add .
git commit -m "🚀 Initial commit: Lancer Tracker v2 is alive!"

# Link to your GitHub repository and push
git branch -M main
git remote add origin [https://github.com/GajjarKashyap/lancer-tracker.git](https://github.com/GajjarKashyap/lancer-tracker.git)
git push -u origin main