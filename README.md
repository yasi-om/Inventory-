# Uganda Railway Corporation (URC) - ICT Asset Registry

An elegant, secure, and modern digital inventory and service registry designed for the **Uganda Railway Corporation (URC)**. This application enables comprehensive management of institutional hardware, network nodes, and software licenses, alongside a full-scale maintenance desk and robust security configuration.

---

## 🚀 Key Features

*   **Secure Multi-Tier Access:** Custom login portal separating standard **Staff** members (authorized via a customizable 4-digit PIN) and **Administrators** (full dashboard credentials).
*   **Administrative Control Center:** Real-time metrics tracking, active audit log trail for security transparency, and custom credential updates (change PIN/passwords) with persistence.
*   **Dynamic Asset Registry:** Live inventory tables featuring smart filtering by department, operational status, and type, with visual indicators and direct detail views.
*   **Maintenance & Tickets Desk:** Active workflow managers for logging repair activities, tracking costs in Ugandan Shillings (UGX), and generating printable service stickers or QR codes.
*   **Offline-First & Local Storage Persistence:** Automatic state synchronization with client-side localStorage to prevent data loss.

---

## 🛠️ Local Installation & Setup

This project is built using **React 19**, **Vite**, and **Tailwind CSS v4**. Follow the instructions below to get the app running locally on your computer.

### 📋 Prerequisites

Before starting, ensure you have **Node.js** and **npm** installed on your operating system:
*   **Recommended Version:** Node.js v18.0.0 or higher.
*   Verify your installation by running these commands in your command line terminal:
    ```bash
    node -v
    npm -v
    ```
    *If these commands return errors, download and run the installer for your OS from the official website: [nodejs.org](https://nodejs.org/).*

---

### 💻 Operating System Specific Guides

#### 🪟 Windows Setup Guide

1.  **Open Terminal:**
    Press the `Win + X` keys on your keyboard and select **PowerShell** or **Command Prompt**, or open **Windows Terminal**.
2.  **Navigate to the Project Directory:**
    Change directory to the folder where you extracted the project source code:
    ```cmd
    cd C:\path\to\your\extracted\project-folder
    ```
3.  **Install Dependencies:**
    Download and set up the required packages using npm:
    ```cmd
    npm install
    ```
4.  **Launch the Development Server:**
    Run the Vite development script:
    ```cmd
    npm run dev
    ```
5.  **Access the App:**
    Open your web browser of choice (Chrome, Edge, Firefox) and navigate to:
    ```text
    http://localhost:3000
    ```

---

#### 🍎 macOS Setup Guide

1.  **Open Terminal:**
    Press `Cmd + Space` to open Spotlight, search for **Terminal**, and press `Enter`.
2.  **Navigate to the Project Directory:**
    Use the `cd` command to enter the project folder (you can also type `cd ` and drag-and-drop the folder into your terminal window):
    ```bash
    cd /path/to/your/extracted/project-folder
    ```
3.  **Install Dependencies:**
    Run npm package installer:
    ```bash
    npm install
    ```
4.  **Start the Local Development Server:**
    Spin up the dev environment:
    ```bash
    npm run dev
    ```
5.  **Access the App:**
    Open Safari or Chrome and navigate to the address:
    ```text
    http://localhost:3000
    ```

---

## ⚡ Available Development Scripts

The following helper scripts are configured inside your `package.json`:

*   `npm run dev` — Launches the application in local development mode with hot-reloading on port `3000`.
*   `npm run build` — Compiles and optimizes the entire application into highly performant static assets inside the `/dist` directory, ready to be hosted on production servers.
*   `npm run preview` — Locally hosts the compiled production build from `/dist` to test performance before deploying.
*   `npm run lint` — Runs TypeScript diagnostics checking without emitting files to verify type-safety and ensure no code bugs exist.

---

## 🔐 Default Access Credentials

For instant offline testing, use the following preloaded credential registry:

*   **Staff Authorization PIN Code:** `1234`
*   **Administrator Username:** `admin`
*   **Administrator Password:** `adminpassword`

> 💡 *Note: To update these passwords, log in as an administrator, head over to the **Admin Panel** on the sidebar menu, enter your preferred credentials, and click **Save New Credentials**. This writes and locks your custom access keys into your computer's persistent storage.*
