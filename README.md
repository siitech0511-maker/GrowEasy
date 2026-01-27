\# GrowEasy 🚀



GrowEasy is a \*\*modular ERP platform for SMEs\*\*, designed to handle accounting, compliance, operations, and analytics in a scalable and developer-friendly way.



The project is built as a \*\*monorepo\*\*, supporting web, backend, and mobile applications under a single codebase.



---



\## 🧩 Tech Stack



\### Frontend (Web)

\- \*\*Next.js 14+\*\* (App Router)

\- \*\*TypeScript\*\*

\- \*\*Tailwind CSS\*\*

\- Modular feature-based structure



\### Backend (API)

\- \*\*FastAPI (Python)\*\*

\- Service + Schema + DB Model layers

\- Ready for PostgreSQL / MySQL

\- JWT-based authentication (planned)



\### Mobile

\- Planned (React Native / Expo)



---



\## 📁 Monorepo Structure



GrowEasy/
├── apps/
│ ├── web/ # Next.js frontend
│ │ ├── app/
│ │ │ ├── accounting/
│ │ │ ├── compliance/
│ │ │ └── layout.tsx
│ │ ├── components/
│ │ ├── lib/
│ │ └── package.json
│ │
│ ├── backend/ # FastAPI backend
│ │ ├── main.py
│ │ ├── db_models/
│ │ ├── schemas/
│ │ ├── services/
│ │ └── requirements.txt
│ │
│ └── mobile/ # Mobile app (future)
│
├── .gitignore
└── README.md


---

## ▶️ Running the Project Locally

### 1️⃣ Web App (Next.js)

cd apps/web
npm install
npm run dev

App runs at:
👉 http://localhost:3000

2️⃣ Backend API (FastAPI)
cd apps/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload


API runs at:
👉 http://localhost:8000

Docs:
👉 http://localhost:8000/docs

🤝 Contributing

This project is under active development.
PRs, discussions, and suggestions are welcome.

📜 License

MIT License (to be finalized)


---




