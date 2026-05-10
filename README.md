# CloudMind 🚀
### AI-Powered Intelligent Cloud Deployment Platform

CloudMind is a mini cloud orchestration platform inspired by platforms like Vercel and Render, built with intelligent autoscaling capabilities using Machine Learning.

It allows users to deploy GitHub repositories automatically using Docker containers, monitor deployed services, and apply AI-based scaling decisions.

---

# ✨ Features

## 🚀 Automated GitHub Deployment
- Connect a GitHub repository
- Automatically clone the repo
- Detect project type
- Generate Dockerfile dynamically
- Build Docker image
- Deploy container automatically

---

## 🐳 Docker-Based Infrastructure
- Containerized backend
- Containerized ML service
- Dynamic container creation
- Dynamic port allocation
- Docker Compose orchestration

---

## 🧠 AI-Powered Scaling Engine
CloudMind includes a Machine Learning service that analyzes:
- CPU usage
- Memory usage
- Latency

And predicts:
- `scale_up`
- `scale_down`
- `no_action`

---

## 📊 Monitoring System
- Track deployed services
- Track replicas
- Service status monitoring
- Metrics generation
- Intelligent decision engine

---

## ⚡ Async Deployment Pipeline
Deployments happen in the background:
- Instant API response
- Background cloning
- Background Docker builds
- Real deployment workflow

---

# 🏗️ Architecture

```text
User
  ↓
Backend API (Node.js + Express)
  ↓
GitHub Repo Cloning
  ↓
Dockerfile Generation
  ↓
Docker Image Build
  ↓
Docker Container Deployment
  ↓
ML Service (Python + TensorFlow)
  ↓
Scaling Decision
```

---

# 🛠️ Tech Stack

## Backend
- Node.js
- Express.js
- Dockerode
- Docker Compose

## Machine Learning Service
- Python
- Flask
- TensorFlow

## Infrastructure
- Docker
- Docker Compose

## Future Frontend
- Angular

---

# 📂 Project Structure

```text
CloudMind/
│
├── backend/
│   ├── server.js
│   ├── Dockerfile
│   ├── projects/
│   └── package.json
│
├── ml-service/
│   ├── app.py
│   ├── model/
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml
│
└── README.md
```

---

# 🚀 Getting Started

## 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/CloudMind.git
cd CloudMind
```

---

## 2️⃣ Start Platform

```bash
docker compose up --build
```

This starts:
- Backend API → Port 3000
- ML Service → Port 5000

---

# 🔥 Deploy an Application

## API Endpoint

```http
POST /deploy
```

---

## Request Body

```json
{
  "repoUrl": "https://github.com/heroku/node-js-getting-started.git",
  "projectName": "myapp"
}
```

---

## Example Response

```json
{
  "message": "Deployment started 🚀",
  "projectName": "myapp"
}
```

---

# 📊 Check Running Services

## Endpoint

```http
GET /services
```

---

## Example Response

```json
[
  {
    "serviceId": "2af8dcd28f726cd5360b708fc5016a141c599e686eae075d1fb74b319f91a650",
    "name": "myapp",
    "repoUrl": "https://github.com/heroku/node-js-getting-started.git",
    "port": 38731,
    "status": "running",
    "replicas": 1
  }
]
```

---

# 🧠 Intelligent Scaling Endpoint

## Endpoint

```http
GET /intelligence/:serviceId
```

---

## Example Response

```json
{
  "serviceId": "123",
  "metrics": {
    "cpu": 78,
    "memory": 65,
    "latency": 120
  },
  "intelligence": {
    "scaling_decision": "scale_up"
  }
}
```

---

# 🐳 Docker Compose

CloudMind uses Docker Compose for orchestration.

## Start All Services

```bash
docker compose up
```

## Rebuild Containers

```bash
docker compose up --build
```

## Stop Containers

```bash
docker compose down
```

---

# ⚙️ Current Features Implemented

| Feature | Status |
|---|---|
| Backend API | ✅ |
| ML Service | ✅ |
| Docker Integration | ✅ |
| GitHub Repo Cloning | ✅ |
| Dynamic Dockerfile Generation | ✅ |
| Dynamic Container Deployment | ✅ |
| Dynamic Port Allocation | ✅ |
| Async Deployment Pipeline | ✅ |
| Service Tracking | ✅ |
| AI Scaling Logic | ✅ |

---

# 🚧 Upcoming Features

- Real Docker metrics collection
- Live deployment logs
- Angular dashboard
- Real-time monitoring
- Database integration
- Kubernetes orchestration
- WebSocket-based logs streaming
- GitHub OAuth integration
- One-click deployment UI
- ML-based autoscaling with real metrics

---

# 🧠 Future Vision

CloudMind aims to become an:
## AI-Powered Cloud Orchestration Platform

Where users can:
- Connect repositories
- Deploy applications
- Monitor services
- Scale intelligently using AI

---

# 📸 Example Workflow

```text
GitHub Repo
    ↓
CloudMind Backend
    ↓
Clone Repository
    ↓
Generate Dockerfile
    ↓
Build Docker Image
    ↓
Run Docker Container
    ↓
Expose Public Port
    ↓
ML Service Monitoring
    ↓
Autoscaling Decision
```

---

# 🔥 Why CloudMind is Unique

| Feature | Traditional Platforms | CloudMind |
|---|---|---|
| Deployment | ✅ | ✅ |
| Monitoring | ✅ | ✅ |
| Autoscaling | Rule-based | AI-based 🔥 |
| ML Intelligence | ❌ | ✅ |
| Custom Scaling Logic | Limited | Fully Customizable |

---

# 👨‍💻 Author

Built by Hardik Makkar 🚀

---

# 📄 License

MIT License

---

# ⭐ Future Goal

Transform CloudMind into a fully functional AI-driven cloud platform capable of:
- Intelligent deployments
- Predictive scaling
- Real-time orchestration
- Autonomous infrastructure management 🚀
