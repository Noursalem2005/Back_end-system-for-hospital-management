# 🚑 Back_end-system-for-hospital-management

A comprehensive backend system for managing hospital operations including appointments, billing, departments, staff, patients, rooms, and equipment, with strong authentication and role-based authorization.  
Designed for scalability, security, and real-world hospital workflow needs.

---

## 📚 About

This project provides the **backend** for a **Hospital Management System (HMS)** built with **Node.js** and **Express.js**.  
The backend API handles:
- Patient management
- Doctor and staff management
- Room and equipment tracking
- Appointment scheduling
- Billing and payment processing
- Authentication and security
- Admin settings and role permissions

Technologies used:
- **Node.js** + **Express.js** (Server and API development)
- **MongoDB** (Database)
- **JWT** (Authentication tokens)
- **bcrypt** (Password hashing)
- **Swagger** (API documentation)
- **Rate limiting**, **Caching**, and **Security headers** for production readiness

---

## 🏗️ Project Structure

| Folder / File       | Purpose |
|---------------------|---------|
| `config/`            | Database connections, cache setup, security settings, API docs (swagger) |
| `controllers/`       | Request handlers for settings and other resources |
| `middlewares/`       | Auth, error handling, logging, rate limiting, role-based auth, validation |
| `routes/`            | API route definitions (appointments, auth, billing, departments, doctors, equipment, patients, rooms, settings, staff) |
| `scripts/`           | Helper scripts to manage users/admins and test the database |
| `services/`          | Logic for authentication, caching, email, error handling, payments, SMS |
| `test/`              | Unit tests for authentication and other services |
| `utils/`             | Helpers, constants, response formatters, token generation, transaction helpers |
| `.gitignore`         | Git ignore rules |
| `index.js`           | Main entry point to the server |
| `package.json`       | Project dependencies and scripts |

---

## 🚀 API Documentation

- Swagger docs are available for all major endpoints.
- To view:
  - Start the server.
  - Visit `http://localhost:3000/api-docs` in your browser.

---

## 🌟 Key Features

- Secure authentication (JWT)
- Password hashing (bcrypt)
- Role-based access control (Admin, Doctor, Staff)
- Rate limiting to prevent brute-force attacks
- API Request validation and security headers
- Modular services (auth, email, SMS, payments)
- Centralized error handling and logging
- Test scripts and utilities
- Ready for production deployment

---

## 🎯 How to Run Locally

1. **Clone the repository**  
   👉 [GitHub Repository Link](https://github.com/Noursalem2005/Back_end-system-for-hospital-management)

   ```bash
   git clone https://github.com/Noursalem2005/Back_end-system-for-hospital-management.git
   cd Back_end-system-for-hospital-management
