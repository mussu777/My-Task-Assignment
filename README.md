# 📱 My Task App

A beautifully simple yet powerful **Task‑App** built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/).  
Manage your day with timers, scheduled reminders, and a clean UI that keeps completed and pending tasks neatly separated.

---

## 🚀 Features

- 📝 **Add, edit & delete** tasks with an intuitive interface  
- 🕒 **Timer‑based notifications** that alert you the instant time’s up  
- 🗓️ **Scheduled notifications** for future reminders  
- 📂 **Two‑tab view** – ✅ Completed | ❌ Incomplete  
- 💾 **AsyncStorage** persistence so your tasks survive app restarts  
- 🚨 **Custom alerts** after every add / edit / delete action  
- 🧭 **Expo Router** for smooth file‑based navigation  
- 🌍 Runs on **Android, iOS & Web**

---

## 📸 Screenshots

| Home | Task Details |
| :---: | :---: |
| ![Home Screen](assets/screenshots/home.jpg) | ![Task Added](assets/screenshots/Task.jpg) | ![Completed Task](assets/screenshots/completed.jpg) |



---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | **React Native 0.79** |
| Runtime | **Expo ~53** |
| Storage | **@react‑native‑async‑storage/async‑storage 2.1** |
| Navigation | **Expo Router** & **@react‑navigation/bottom‑tabs** |
| Notifications | **expo‑notifications ~0.31** |
| UI / UX | **@expo/vector‑icons**, **react‑native‑reanimated**, **expo‑haptics** |
| Language | **JavaScript** (with TypeScript tooling configured) |

---

## 📦 Installation

> **Prerequisites:** Node ≥ 18, npm ≥ 9 (or Yarn / pnpm).

```bash
# 1. Install Expo CLI globally
npm install -g expo-cli

# 2. Clone the repository
git clone https://github.com/mussu777/My-Task-Assignment.git
cd My-Task-Assignment

# 3. Install dependencies
npm install         # or: yarn

# 4. Start the development server
npm start           # opens Expo DevTools
