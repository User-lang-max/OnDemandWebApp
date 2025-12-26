Full-Stack Web Application

 ASP.NET Core Web API + React.js

A modern **full-stack web application** built with **ASP.NET Core** on the backend and **React.js** on the frontend.
The project follows **clean architecture**, RESTful principles, and modern frontend practices.

---

 Table of Contents

* [Overview](#-overview)
* [Tech Stack](#-tech-stack)
* [Prerequisites](#-prerequisites)
* [Installation & Setup](#-installation--setup)
* [Running the Application](#-running-the-application)
* [Environment Variables](#-environment-variables)
* [API Documentation](#-api-documentation)
* [Git & Version Control](#-git--version-control)
* [Best Practices](#-best-practices)
* [Future Improvements](#-future-improvements)
* [Author](#-author)


---
 Overview

This project is a **full-stack web platform of ondemand services** composed of:

* **Backend**: ASP.NET Core Web API
* **Frontend**: React.js (Vite / CRA / custom setup)

The backend exposes REST APIs that handle business logic, authentication, and database access.
The frontend consumes these APIs to provide a responsive and user-friendly interface.

---

## 🛠 Tech Stack

### Backend

* **ASP.NET Core**
* **C#**
* **Entity Framework Core**
* **RESTful APIs**
* **JWT Authentication** (if applicable)
* **SQL Server / PostgreSQL / MySQL**

### Frontend

* **React.js**
* **JavaScript (ES6+)**
* **Axios**
* **React Router**
* **CSS / Tailwind / Material UI**

### Tools

* **Visual Studio** (Backend)
* **VS Code** (Frontend)
* **Git & GitHub**



 Prerequisites

Make sure you have the following installed:

* **.NET SDK 7+**
* **Node.js 18+**
* **npm or yarn**
* **Git**
* **Visual Studio**
* **VS Code**

Check versions:

```bash
dotnet --version
node --version
npm --version
git --version
```

---

## ⚙ Installation & Setup

 Clone the Repository

```bash
git clone https://github.com/User-lang-max/OnDemandWebApp
cd OnDemandWebApp
```

---

### 2️ Backend Setup (ASP.NET Core)

```bash
cd backend
dotnet restore
dotnet build
```

If using EF Core:

```bash
dotnet ef database update
```

---

###  Frontend Setup (React)

```bash
cd frontend
npm install
```

---

## ▶ Running the Application

### Start Backend

```bash
cd backend
dotnet run
```

Backend will run on:

```
https://localhost:5234
```

(or another port depending on configuration)

---

### Start Frontend

```bash
cd frontend
npm start
```

or (Vite):

```bash
npm run dev


##  Environment Variables

Create a `.env` file in the frontend folder:

```env
VITE_API_BASE_URL=https://localhost:5234/api
```

Backend `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=AppDb;Trusted_Connection=True;"
  },
  "Jwt": {
    "Key": "your-secret-key",
    "Issuer": "your-app"
  }
}
```


## 📑 API Documentation

API endpoints follow REST conventions:

```
GET    /api/users
POST   /api/auth/login
POST   /api/auth/register
PUT    /api/users/{id}
DELETE /api/users/{id}
```

Swagger available at:

```
https://localhost:5001/swagger
```

---

## 🔁 Git & Version Control

Recommended workflow:

```bash
git checkout -b feature/feature-name
git add .
git commit -m "feat: add new feature"
git push origin feature/feature-name
```

Main branches:

* `main` → production
* `develop` → development

---

## ✅ Best Practices

* Separation of concerns (Backend / Frontend)
* Clean Architecture (Domain, Application, Infrastructure)
* Environment-based configuration
* Secure API calls
* Reusable React components
* Meaningful commit messages

---



##  Author

**Your Name**
Computer Engineering Student – Software & Networks
📧 Email: alaouidrai.zineb4@gmail.com
🔗 LinkedIn: https://www.linkedin.com/in/zineb-alaoui-drai/


