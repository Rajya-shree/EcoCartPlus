# SustainaFix: The AI Repair & Eco-Shopping Assistant

SustainaFix is a full-stack MERN application built for our Final Year Project. It's designed to combat e-waste by empowering users with two key tools: a **Personalized Device Maintenance Hub** and an **AI-Powered Repair & Green Shopping Assistant**.

This project promotes the "Right to Repair" by providing users with real-world iFixit repair guides and a custom-built database of sustainable product alternatives.

---

## ✨ Core Features

- **Secure User Authentication:** Users can register, log in, and log out with a secure, token-based (JWT) system.
- **Private Device Dashboard:** A protected route where logged-in users can add their personal electronic devices to track their lifecycle.
- **Lifecycle Maintenance:** Automatically generates a list of maintenance reminders (e.g., "Clean fans," "Check battery") based on the device's purchase date.
- **AI Repair Assistant:** A public-facing chatbot that uses a proxy to the live **iFixit API** to fetch real, professional repair guides for user queries.
- **Green Shopping Assistant:** A separate search page that queries a custom MongoDB database for products with "Eco-Scores." Scores are calculated in the backend based on material, repairability, and company sustainability ratings.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js & Express.js
- **Database:** MongoDB (Atlas)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **External APIs:** iFixit Public API
- **Deployment:** Render (Backend) & Netlify (Frontend)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### 1. Clone the Repository

First, clone the project from GitHub to your local machine:

````sh
git clone https://github.com/Rajya-shree/EcoCartPlus.git
cd ai-repair-assistant


You're right, a good name makes a big difference. And yes, you can absolutely make your repository private.

Here are some project name ideas and the complete README.md file you requested.

💡 Project Name Ideas
Your project combines two main ideas: Repair/Sustainability and Smart Assistance. Here are a few names that try to capture that:

SustainaFix (Short, modern, combines "Sustain" and "Fix")

EcoRepair Assistant (Clear and professional)

GreenTech Toolkit (Focuses on the "green" and "tool" aspects)

RepairAdvisor (This is what you've used, and it's very strong and clear!)

The Right-to-Repair Hub (Focuses on the project's mission)

🔒 GitHub Privacy & Teamwork
Yes, you can and should make your repository private.

The free plans on GitHub, Render, and Netlify all support private repositories. You just have to grant them access.

How to Share with Teammates:

On your GitHub repository page, go to Settings.

In the left menu, click "Collaborators and teams".

Click the "Add people" button.

Add your teammates using their GitHub usernames or emails. They will get an invitation.

Once they accept, they can clone, push, and pull from the same private repository.

📄 Your Project README.md File
Here is a complete, professional README.md file. Copy and paste this into a new file named README.md in your project's root folder (the ai-repair-assistant folder).

(You will need to replace your-github-url and a few other placeholders.)

Markdown

# SustainaFix: The AI Repair & Eco-Shopping Assistant

SustainaFix is a full-stack MERN application built for our Final Year Project. It's designed to combat e-waste by empowering users with two key tools: a **Personalized Device Maintenance Hub** and an **AI-Powered Repair & Green Shopping Assistant**.

This project promotes the "Right to Repair" by providing users with real-world iFixit repair guides and a custom-built database of sustainable product alternatives.

---

## ✨ Core Features

* **Secure User Authentication:** Users can register, log in, and log out with a secure, token-based (JWT) system.
* **Private Device Dashboard:** A protected route where logged-in users can add their personal electronic devices to track their lifecycle.
* **Lifecycle Maintenance:** Automatically generates a list of maintenance reminders (e.g., "Clean fans," "Check battery") based on the device's purchase date.
* **AI Repair Assistant:** A public-facing chatbot that uses a proxy to the live **iFixit API** to fetch real, professional repair guides for user queries.
* **Green Shopping Assistant:** A separate search page that queries a custom MongoDB database for products with "Eco-Scores." Scores are calculated in the backend based on material, repairability, and company sustainability ratings.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Node.js & Express.js
* **Database:** MongoDB (Atlas)
* **Authentication:** JSON Web Tokens (JWT) & bcrypt
* **External APIs:** iFixit Public API
* **Deployment:** Render (Backend) & Netlify (Frontend)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### 1. Clone the Repository

First, clone the project from GitHub to your local machine:

```sh
git clone [your-github-repo-url]
cd ai-repair-assistant
This project is a "monorepo" containing two separate apps: backend and frontend. You will need to run them in two separate terminals.

2. Backend Setup
The backend server connects to the database and serves the API.

Bash

# 1. Navigate to the backend folder
cd backend

# 2. Install all required packages
npm install

# 3. Create your environment file
# Create a new file named .env in the /backend folder
touch .env

# 4. Add your secret keys to the .env file
# (You must get these from your team or create your own)
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_for_tokens

# 5. Start the backend server
npm start
Your backend server should now be running on http://localhost:5001


3. Frontend Setup
The frontend is the React app that your users see.

Bash

# 1. Open a NEW terminal
# 2. Navigate to the frontend folder
cd frontend

# 3. Install all required packages
npm install

# 4. Start the frontend development server
npm run dev
Your frontend server should now be running on http://localhost:5173 (or a similar port). You can now access the app in your browser!
````

🤝 How to Work as a Team (Git Workflow)
To prevent breaking the project, we never push code directly to the main branch. We use a "Feature Branch" workflow.

This is the most important rule: The main branch is our "golden copy." It must always be stable.

Your Daily Workflow (Step-by-Step)
Follow these steps every time you start working on a new feature or bug fix.

Step 1: Get the Latest Code Before you write a single line, make sure you have the most up-to-date version of the project.

Bash

# 1. Make sure you are on the main branch

git checkout main

# 2. Pull the latest changes from GitHub

git pull origin main
Step 2: Create Your New Branch Create a new "branch" for your task. This is your personal sandbox. Nothing you do here will affect the main project until you're ready.

Good branch names are descriptive (e.g., fix-login-css, feature-delete-device, update-readme).

Bash

# This command creates the branch AND switches to it

git checkout -b your-branch-name
Step 3: Do Your Work This is where you code!

Build your feature.

Fix your bug.

Test it on your local machine.

Step 4: Save and Push Your Branch Once you're happy with your changes, save them to Git and push your branch (not main) to GitHub.

Bash

# 1. Add all the files you changed

git add .

# 2. Save a "commit" with a clear message

git commit -m "feat: added delete button to dashboard"

# 3. Push your new branch to GitHub

git push -u origin your-branch-name
Step 5: Open a Pull Request (PR)

Go to your GitHub repository in your browser.

You will see a yellow box: "your-branch-name had recent pushes. Compare & pull request".

Click that button.

Write a brief description of what you did and why.

Click "Create pull request".

Step 6: Review and Merge This is the team part.

Ask your teammates to review your PR. They can look at your code and make comments.

Once your PR is approved by at least one teammate, you (or a team lead) can click the "Merge pull request" button.

Your feature is now safely added to the main branch!

Everyone else on the team can now run git pull origin main to get your new feature.
