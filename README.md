# 🔍 Advanced Code Smell Detection (ACSD)

**ACSD** is a premium full-stack static analysis platform designed to empower developers to write cleaner, more maintainable code. By leveraging advanced AST-based detection and a sophisticated weighted quality engine, ACSD identifies architectural flaws and "code smells" with high precision.

---

## ✨ Key Features & Recent Updates

- **🚀 Multi-Language Support**: Analysis engine for **Python**, **Java**, **C++**, **JavaScript**, and more.
- **⚖️ Weighted Quality Scoring (New)**: A high-accuracy scoring system that penalizes issues based on severity:
  - **Critical Smells (High)**: -7 pts
  - **Structural Smells (Medium)**: -3 pts
  - **Minor Issues (Low)**: -1 pt
- **🛡️ Hardened Registration**: Secure onboarding restricted to verified **@gmail.com** domains.
- **🎨 Premium UI/UX**: Completely overhauled interface featuring:
  - **Glassmorphism** authentication cards.
  - **Modern Dashboard** with real-time health metrics.
  - **Enhanced Profile Management** for technical skill tracking and coding presence.
- **🕵️ Precise Smell Detection**:
  - **Long Method**: Overly complex functions.
  - **Large Class**: "God Objects" with excessive responsibility.
  - **Duplicate Code**: Locates redundant logic (DRY principle).
  - **Excessive Parameters**: Methods with too many arguments.

---

## 🛠️ Technology Stack

### Frontend
- **React.js 18** (Vite-powered)
- **TailwindCSS** with high-end abstract backgrounds
- **Heroicons** for sleek iconography
- **Framer Motion & Custom Transitions** for a premium feel

### Backend
- **Node.js & Express.js**
- **MongoDB** with Mongoose ODM
- **CORS Management**: Seamless support for multiple development environments (Port 3000/3001)
- **Security**: JWT, Bcrypt, Helmet, and Rate Limiting

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: v16+
- **MongoDB**: Local or Atlas instance
- **Python 3.x**: For deep Python analysis

### Setup
1. **Backend**:
   ```bash
   cd backend && npm install && npm run dev
   ```
2. **Frontend**:
   ```bash
   cd frontend && npm install && npm run dev
   ```

---

## 📖 Modern Workflow

1. **Secure Access**: Register with a **@gmail.com** account.
2. **Analysis**: Upload code files to trigger the AST analysis engine.
3. **Health Metrics**: View your **Quality Score** (0-100%) and **Status** (Clean, Minor Issues, or Needs Refactoring).
4. **Refactor**: Use the provided line-by-line suggestions to improve your score.
5. **Track Progress**: Monitor historical reports to visualize your code quality evolution.

---

Developed with 💻 & ❤️ by the ACSD Team.
