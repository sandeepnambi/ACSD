# 🔍 Automated Code Smell Detection (ACSD)

**ACSD** is a sophisticated full-stack static analysis tool designed to help developers identify and eliminate "code smells" in their software. By automating the detection of common design flaws, ACSD empowers teams to maintain high code quality, reduce technical debt, and streamline the code review process.

---

## ✨ Key Features

- **🚀 Multi-Language Support**: Analysis engine supports **Python** (via AST), **Java**, and generic analysis for **C++**, **JavaScript**, and more.
- **🕵️ Precise Smell Detection**:
  - **Long Method**: Identifies overly complex functions that should be refactored.
  - **Large Class**: Detects "God Objects" that take on too many responsibilities.
  - **Duplicate Code**: Locates redundant code blocks to encourage DRY principles.
  - **Excessive Parameters**: Flags methods with too many arguments.
- **📊 Interactive Dashboard**: Visualize code health metrics, smell distributions, and historical trends.
- **📄 Detailed Reporting**: Generate comprehensive reports with specific file locations and refactoring suggestions.
- **👤 User Management**: Secure authentication and profile management.
- **📂 History Tracking**: Maintain a record of all analyzed files and their quality scores over time.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18 (Vite-powered)
- **Styling**: TailwindCSS for modern, responsive UI
- **State Management**: React Query (TanStack Query)
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT Authentication, Bcrypt encryption, Helmet, and Rate Limiting
- **Analysis Engine**: Python AST (for deep Python analysis) and JavaParser

---

## 🏗️ Project Structure

```text
ACSD/
├── frontend/             # React application (Vite)
│   ├── src/
│   │   ├── components/   # Shared UI components
│   │   ├── pages/        # View components
│   │   └── services/     # API integration layer
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Data schemas
│   │   └── services/     # Code analysis & smell detection
├── Sample Codes/         # Example files for testing analysis
└── Sample Reports/       # Example output reports
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: v16 or higher
- **MongoDB**: Local instance or Atlas URI
- **Python 3.x**: Required for Python source code analysis

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set your `PORT`, `MONGODB_URI`, and `JWT_SECRET`.
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📖 Usage

1. **Login/Register**: Create an account or log in to access the dashboard.
2. **Upload Code**: Navigate to the **Upload** page and drop your source files (Python, Java, etc.).
3. **Analyze**: Click "Analyze" to trigger the static analysis engine.
4. **View Report**: Once complete, view the detailed breakdown of detected smells and code metrics.
5. **Manage History**: Access the **Reports** page to see past analyses and track improvements.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Developed with ❤️ by the ACSD Team.
