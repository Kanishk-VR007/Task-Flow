# TaskFlow — Modern Team & Task Management Platform

TaskFlow is a modern, full-stack enterprise collaboration platform designed to help software development teams, project managers, and organizations manage their teams, daily tasks, team communication, and work reports in one unified dashboard.

Whether you are managing multiple developer teams, onboarding new members, distributing tasks, or reviewing submitted deliverables, TaskFlow provides an intuitive, high-performance workspace built for modern engineering workflows.

---

## 🌟 Why TaskFlow?

Traditional task trackers are often scattered across disconnected tools—one app for chat, another for tickets, another for reporting, and spreadsheets for tracking workload. 

TaskFlow brings everything together under one roof:
* **Multi-Company Privacy**: Every registered organization operates inside its own private, isolated workspace. Teams, tasks, messages, and reports never collide across companies.
* **Role-Based Workflows**: Distinct permissions and user interfaces tailored for Project Managers, Team Leads, Developers, and Interns.
* **Smart Team Onboarding**: Managers can create teams and add members on the fly. The system automatically creates company email addresses and default passwords, with built-in password change prompts on first login.
* **Intelligent Domain-Based Suggestions**: When assigning tasks, TaskFlow recommends the most suitable engineers by matching technical domains and ranking candidates by real-time workload to prevent burnout and ensure domain expertise.
* **Interactive Task Tracking**: Real-time task board with priority badges, progress sliders, deadlines, and direct assignees.
* **Private Multi-Tier Chat**: Isolated communication channels for Leadership, individual Teams, and Task-specific discussions.
* **Task Report Submissions & Review**: Developers submit rich reports with file attachments, and leads can approve, request changes, or reject with feedback.
* **Workload Telemetry**: Dynamically calculates developer workload scores from GitHub pull request review activity to prevent developer burnout.
* **Futuristic Avatar Profile Builder**: Team members can customize and export a personalized sci-fi avatar representing their digital identity in the workspace.

---

## 👥 User Roles & How They Work

| Role | Description | Key Capabilities |
| :--- | :--- | :--- |
| **Project Manager (PM) / Admin** | Organization leader and company account creator | • Creates unlimited teams and assigns Team Leads.<br>• Onboards developers and interns with generated credentials.<br>• Creates, assigns, and tracks company-wide tasks.<br>• Participates in the Leadership Chat channel.<br>• Reviews, approves, or rejects task reports.<br>• Views high-level productivity analytics and timelines. |
| **Team Lead** | Technical lead managing a specific team | • Leads day-to-day sprint execution.<br>• Assigns and updates tasks within their team.<br>• Accesses both Leadership Chat and Team Chat channels.<br>• Reviews daily/weekly reports submitted by team members. |
| **Developer / Junior Dev** | Core engineering team member | • Views personal tasks and updates progress status (Todo, In Progress, Review, Done).<br>• Participates in Team Chat and Task-level discussions.<br>• Submits detailed task reports with PDF/document attachments.<br>• Updates profile and personalized avatar. |
| **Intern** | Trainee or junior contributor | • Fast-tracked onboarding directly into assigned teams.<br>• Submits task completion reports for review.<br>• Interacts within Team Chat and task discussions. |

---

## 🚀 Key Features

### 1. Multi-Tenant Company Isolation
When a Project Manager registers with a company name, a dedicated workspace is established. All subsequent teams, tasks, reports, and messages created under that company are tagged and secured by the company ID. Cross-company access is strictly forbidden at both the database and REST API layers.

### 2. Team Building & Automated Onboarding
* Create teams by domain (Frontend, Backend, DevOps, QA, Mobile, AI/ML).
* Select existing members or add new members directly with a single click.
* The system automatically generates professional email addresses (`firstname.lastname@company.com`) and default temporary passwords.
* When new members log in for the first time, a password change prompt is displayed so they can personalize their credentials securely.

### 3. Task Management & Sprint Tracking
* Create tasks with priority indicators: **Low**, **Medium**, **High**, **Critical**.
* Track task status through standardized stages:
  * `TODO`
  * `IN_PROGRESS`
  * `IN_REVIEW`
  * `COMPLETED`
* Filter tasks by assignee, status, or search query.
* Real-time progress percentage updates and deadline indicators.

### 4. Intelligent Domain-Based Task Suggestions (Major Advantage)
One of the standout competitive advantages of TaskFlow is its **smart domain-based recommendation engine** for assigning tasks:
* **Automatic Domain Recognition**: When creating or editing a task, managers select an engineering domain (e.g. `FRONTEND`, `BACKEND`, `FULLSTACK`, `DEVOPS`, `QA`, `MOBILE`, `AI/ML`).
* **Real-Time Recommendation Engine (`/tasks/suggestions/{domain}`)**: The backend evaluates available engineers in the organization using a multi-factor ranking algorithm:
  1. **Domain Skill Affinity**: Matches the technical expertise of developers (`primaryDomain`) with the task requirements, ensuring the right specialist handles the job (e.g., assigning UI/UX engineers to frontend tasks, and database/Spring specialists to backend services).
  2. **Workload Capacity Balancing**: Ranks qualified engineers by their real-time workload score (`getEffectiveWorkload()`). Engineers with lower active commitments and fewer pending pull request reviews are promoted to the top of the suggestion list.
  3. **Role & Team Scope Security**: Strictly respects organizational boundaries—Team Leads only receive suggestions from their assigned team members, and developers can seamlessly delegate tasks to the interns they supervise.
* **Why It Matters**: Eliminates management guesswork, prevents developer burnout, stops mismatched skill assignments, and ensures balanced productivity across all sprint cycles.

### 5. Secure, Segmented Communication Channels
* **Global Leadership Channel**: A private channel accessible only to Project Managers and Team Leads to discuss roadmaps, staffing, and blockers.
* **Team Channels**: Dedicated chat rooms for each team where leads, developers, and interns collaborate on sprint goals.
* **Task Discussions**: Leave focused comments and feedback tied directly to specific tasks.

### 6. Task Reports & Deliverables Review
* Developers submit formal work reports upon task completion.
* Supports file uploads (PDFs, design specs, documentation, logs) up to 50MB.
* Reviewers (PMs and Team Leads) can:
  * **Approve**: Marks the report approved and transitions the task to complete.
  * **Request Changes**: Returns feedback and allows the developer to submit an updated version.
  * **Reject**: Marks deliverable rejected with actionable comments.

### 7. Workload Telemetry & GitHub Integration
* Automated workload score calculation via GitHub webhooks (`/api/telemetry/github`).
* When a developer is requested for a pull request review (`review_requested`), their workload score increases.
* When reviews are completed or PRs are closed, the score automatically decreases.
* Helps managers maintain balanced team workloads and prevent burnout.

### 8. Interactive Project Calendar & Visual Analytics
* **Project Calendar**: Displays scheduled task start and end dates with color-coded priority dots and interactive date inspection.
* **Analytics Dashboard**: Real-time charts powered by Recharts showing task distribution by status, team performance trends, and active workloads.

### 9. 3D/2D Avatar Customizer
* An interactive avatar customization studio.
* Customize skin tone, hairstyle, hair color, techwear outfits, footwear (such as Ion Mag-Boots), holographic headwear, communication headsets, digital companions, and aura effects.
* Save avatar configurations directly to the user profile and export high-resolution canvas portraits.

---

## 🛠️ Technology Stack

### Backend
* **Language & Framework**: Java 21+ / Spring Boot 4
* **Security**: Spring Security 6 with stateless JWT (JSON Web Tokens) and BCrypt password encryption
* **Persistence**: Spring Data JPA & Hibernate
* **Database**: MySQL 8.0+
* **Documentation**: OpenAPI 3 / Swagger (`/swagger-ui/index.html`)
* **Utilities**: Jackson JSON, Java Cryptography (HMAC-SHA256 for GitHub webhooks)

### Frontend
* **Core**: React 19, JavaScript (ES6+)
* **Styling**: Tailwind CSS with custom cyber-dark theme palette, glassmorphism, and responsive layouts
* **Routing**: React Router DOM v7
* **Charts & Visualizations**: Recharts
* **Icons**: Lucide React
* **3D Effects**: React Parallax Tilt
* **HTTP Client**: Custom Axios / Fetch API client with automatic JWT token management

---

## 📁 Project Structure

```
TeamManager/
├── backend/
│   ├── src/main/java/com/example/TeamManger/
│   │   ├── component/        # DataSeeder (initial demo data)
│   │   ├── config/           # CORS & OpenAPI Swagger configurations
│   │   ├── controller/       # REST API endpoints (Auth, Teams, Tasks, Chat, Reports, Telemetry)
│   │   ├── dto/              # Request & Response Data Transfer Objects
│   │   ├── entity/           # JPA Entities (Users, Team, Task, TaskReport, CommunicationLog, etc.)
│   │   ├── repository/       # Spring Data JPA database interfaces
│   │   ├── security/         # JWT filter, JwtUtil, and Spring Security rules
│   │   ├── service/          # Business logic services & implementations
│   │   └── TeamMangerApplication.java
│   ├── src/main/resources/
│   │   └── application.properties # Server port, database connection, upload limits
│   ├── pom.xml               # Maven dependencies and build plugins
│   └── mvnw / mvnw.cmd       # Maven wrapper
│
├── frontend/
│   ├── public/               # Background videos, textures, and static web assets
│   ├── src/
│   │   ├── components/       # UI modules:
│   │   │   ├── Dashboard.jsx        # Main overview and quick statistics
│   │   │   ├── Tasks.jsx            # Kanban task board and task modal
│   │   │   ├── Team.jsx             # Team creation and member onboarding
│   │   │   ├── Reports.jsx          # Report submissions and review panel
│   │   │   ├── Chat.jsx             # Multi-channel team & leadership chat
│   │   │   ├── Calendar.jsx         # Project timeline and schedule
│   │   │   ├── Analytics.jsx        # Performance and workload charts
│   │   │   ├── Profile.jsx          # User profile settings and security
│   │   │   ├── TaskFlowAvatar.jsx   # SVG canvas avatar renderer
│   │   │   ├── AvatarCustomizer.jsx # Full-featured avatar studio
│   │   │   ├── LandingPage.jsx      # Public welcome landing page
│   │   │   ├── Login.js             # User login screen
│   │   │   ├── Register.js          # Company manager registration
│   │   │   └── Layout.jsx           # Sidebar and header navigation wrapper
│   │   ├── utils/
│   │   │   └── api.js        # Centralized HTTP client with JWT interceptors
│   │   ├── App.js            # Route definitions
│   │   ├── index.css         # Tailwind directives and custom animation classes
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── .gitignore
```

---

## ⚙️ Getting Started (Local Development)

Follow these steps to run the application locally on your machine.

### Prerequisites
* **Java**: JDK 21 or higher installed (`java -version`)
* **Node.js**: Node.js 18 or higher and npm installed (`node -v`, `npm -v`)
* **MySQL**: MySQL Server 8.0+ running locally (`mysql -u root -p`)
* **Maven**: Maven 3.8+ (or use the included `./mvnw` wrapper)

---

### Step 1: Database Setup
1. Open your MySQL client or terminal:
   ```sql
   CREATE DATABASE taskflowdb2;
   ```
2. Verify your MySQL credentials. By default, the application is configured for:
   * **Host**: `localhost:3306`
   * **Database**: `taskflowdb2`
   * **User**: `root`
   * **Password**: `Kani@1234`
3. If your local credentials differ, edit `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/taskflowdb2?createDatabaseIfNotExist=true
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

---

### Step 2: Start the Backend Server
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run the Spring Boot application using Maven:
   * **On Windows (PowerShell / Command Prompt)**:
     ```bash
     .\mvnw.cmd spring-boot:run
     ```
   * **On macOS / Linux**:
     ```bash
     ./mvnw spring-boot:run
     ```
3. The backend will start on **`http://localhost:9005`**.
   * Interactive Swagger API documentation: `http://localhost:9005/swagger-ui/index.html`

---

### Step 3: Start the Frontend Application
1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the necessary Node packages:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

---

## 🔐 Default Demo Accounts

The application automatically seeds initial demo accounts on first run:

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Project Manager** | `priya@taskflow.com` | `password` | TaskFlow Corp |
| **Team Lead** | `arun@taskflow.com` | `password` | TaskFlow Corp |
| **Developer** | `anaya@taskflow.com` | `password` | TaskFlow Corp |
| **Intern** | `rahul@taskflow.com` | `password` | TaskFlow Corp |

> **Tip**: You can also click **Get Started** on the Landing Page to register a brand new organization with its own dedicated Project Manager account.

---

## 📡 Key API Endpoints

### Authentication
* `POST /auth/register` — Register a new Project Manager and organization.
* `POST /auth/login` — Authenticate user and receive a JWT token.
* `POST /auth/change-password` — Change password for the authenticated user.

### Teams & Members
* `GET /api/users/teams` — List all teams belonging to the user's organization.
* `POST /api/users/teams` — Quick create a team.
* `POST /api/users/teams/build` — Full team setup with designated lead, developers, and interns.
* `GET /api/users/all` — Fetch all users registered under the organization.

### Tasks
* `GET /tasks/GetallData` — Retrieve all company tasks.
* `GET /tasks/suggestions/{domain}` — Fetch intelligent, workload-ranked developer and intern suggestions matched to a technical domain.
* `POST /tasks/save` — Create and assign a new task with priority and deadline.
* `PUT /tasks/update/{id}` — Update task details, status, or progress.
* `DELETE /tasks/delete/{id}` — Delete a task.

### Reports & Deliverables
* `POST /api/reports/submit` — Submit a completion report with optional file attachment.
* `GET /api/reports/all` — Retrieve submitted reports for the organization.
* `POST /api/reports/review/{id}` — Review, approve, or reject a submitted report.

### Communication & Chat
* `POST /api/chat/send` — Send a message to a channel (Leadership, Team, or Task).
* `GET /api/chat/global-leads` — Fetch messages from the Leadership channel.
* `GET /api/chat/team/{teamId}` — Fetch messages for a specific team.
* `GET /api/chat/task/{taskId}` — Fetch messages for a specific task.

### Telemetry & Webhooks
* `POST /api/telemetry/github` — Receive GitHub webhook payloads to update developer workload scores.
