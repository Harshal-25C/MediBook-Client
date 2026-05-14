<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0ea5e9,40:6366f1,80:8b5cf6,100:0ea5e9&height=230&section=header&text=🏥%20MediBook%20Frontend&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=40&desc=React.js%20·%20Vite%20·%20Axios%20·%20React%20Router%20v6%20·%20Lucide%20Icons&descAlignY=60&descAlign=50" width="100%"/>

<br/>

![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router_v6-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)

<br/>

![Dev Port](https://img.shields.io/badge/Dev_Port-5173-blue?style=flat-square)
![API Gateway](https://img.shields.io/badge/API_Gateway-localhost:8080-blueviolet?style=flat-square)
![Pages](https://img.shields.io/badge/Pages-40+-success?style=flat-square)
![Roles](https://img.shields.io/badge/Roles-Patient_%7C_Provider_%7C_Admin-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Build](https://img.shields.io/badge/Build-Vite_Production-brightgreen?style=flat-square)

</div>

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 📋 Table of Contents

- [Overview](#-overview)
- [Full Stack Architecture](#-full-stack-architecture)
- [All Backend Services Reference](#-all-backend-services-reference)
- [Project Structure](#-project-structure)
- [All Pages & Routes](#-all-pages--routes)
- [API Layer — api.js](#-api-layer--apijs)
- [Authentication Flows](#-authentication-flows)
  - [Normal Login + OTP](#flow-1-normal-login--otp-verification)
  - [Google OAuth2](#flow-2-google-oauth2--otp)
  - [Forgot Password / Reset](#flow-3-forgot-password--reset-flow)
- [Three Dashboards](#-three-role-dashboards)
- [Razorpay Payment Integration](#-razorpay-payment-integration)
- [Environment Variables](#-environment-variables--security)
- [API Testing Examples](#-api-testing-via-browser--curl)
- [Running the Frontend](#-running-the-frontend)
- [Build for Production](#-build-for-production)
- [Troubleshooting](#-troubleshooting)
- [Author](#-author)

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🌐 Overview

**MediBook Frontend** is the React.js / Vite single-page application that provides the complete user interface for the MediBook Online Appointment Booking System. It connects to the MediBook Microservices backend through the **API Gateway** at `http://localhost:8080`.

**What it covers:**
- Public pages: Landing, Find Doctors, Doctor Profile
- **Patient** portal: Dashboard, Book Appointment, Appointments, Medical Records, Payments, Profile
- **Provider (Doctor)** portal: Dashboard, Schedule Management, Appointments, Medical Records, Earnings, Profile
- **Admin** portal: Dashboard, User Management, Provider Management, Appointments, Payments, Reviews, Profile
- **Auth flows**: Register, Login with OTP, Google OAuth2, Forgot Password, Reset Password, Add Phone
- **Razorpay** payment integration with `.env` secured API key
- **Dark mode** support via `ThemeContext`
- **JWT auth** persisted in `localStorage` with auto-logout on 401

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🏗️ Full Stack Architecture

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    MEDIBOOK FULL STACK OVERVIEW                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝

  ┌──────────────────────────────────────────────────────────────────────────────┐
  │                    FRONTEND  (Vite + React 18)                               │
  │                    http://localhost:5173                                     │
  │                                                                              │
  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐   ┌─────────────────────┐  │
  │  │ Public     │  │  Patient   │  │  Provider    │   │  Admin              │  │
  │  │ Pages      │  │  Portal    │  │  Portal      │   │  Portal             │  │
  │  │            │  │            │  │              │   │                     │  │
  │  │ Landing    │  │ Dashboard  │  │ Dashboard    │   │ Dashboard           │  │
  │  │ FindDoctors│  │ Book Appt  │  │ Schedule     │   │ Users               │  │
  │  │ DoctorProf │  │Appointments│  │ Appointments │   │ Providers           │  │
  │  │ Login      │  │ Records    │  │ Records      │   │ Appointments        │  │
  │  │ Register   │  │ Payments   │  │ Earnings     │   │ Payments            │  │
  │  │ OTP        │  │ Profile    │  │ Profile      │   │ Reviews             │  │
  │  │ OAuth2     │  └────────────┘  └──────────────┘   │ Profile             │  │
  │  │ ForgotPwd  │                                     └─────────────────────┘  │
  │  └────────────┘                                                              │
  │                                                                              │
  │  src/utils/api.js  ─── Axios instance ─── JWT interceptor ─── Retry logic    │
  └──────────────────────────────────┬───────────────────────────────────────────┘
                                     │ All HTTP → http://localhost:8080
                                     ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                     API GATEWAY  :8080                                      │
  │   • JWT Auth Filter  → injects X-User-Id, X-User-Role, X-User-Email         │
  │   • Routes all traffic to microservices via Eureka (lb://)                  │
  │   • CORS: localhost:5173, localhost:5174                                    │
  └────────────┬─────────────────────────────────────────────────────┬──────────┘
               │                                                     │
    ┌──────────▼──────────────────────────────────────────────────┐  │
    │           MICROSERVICES (Eureka-Discovered)                 │  │
    │                                                             │  │
    │  auth-service       :8081  ── /auth/**                      │  │
    │  provider-service   :8082  ── /providers/**                 │  │
    │  schedule-service   :8083  ── /slots/**                     │  │
    │  appointment-service:8084  ── /appointments/**              │  │
    │  payment-service    :8085  ── /payments/**                  │  │
    │  review-service     :8086  ── /reviews/**                   │  │
    │  notification-service:8087 ── /notifications/**             │  │
    │  record-service     :8088  ── /records/**                   │  │
    └─────────────────────────────────────────────────────────────┘  │
                                                                     │
    ┌────────────────────────────────────────────────────────────────▼──────────┐
    │               EUREKA SERVER  :8761  (Service Registry)                    │
    └───────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────────┐
  │             RAZORPAY (Payment Gateway)                                       │
  │   Frontend initiates → backend verifies → payment-service confirms           │
  │   Key stored in .env (VITE_RAZORPAY_KEY) — never committed to Git            │
  └──────────────────────────────────────────────────────────────────────────────┘
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🗺️ All Backend Services Reference

| Service | Port | Database | Frontend Calls Via |
|---|---|---|---|
| `eureka-server` | **8761** | — | Not called directly |
| `api-gateway` | **8080** | — | **All frontend traffic goes here** |
| `auth-service` | **8081** | `auth_db` | `/auth/**` |
| `provider-service` | **8082** | `provider_db` | `/providers/**` |
| `schedule-service` | **8083** | `schedule_db` | `/slots/**` |
| `appointment-service` | **8084** | `appointment_db` | `/appointments/**` |
| `payment-service` | **8085** | `payment_db` | `/payments/**` |
| `review-service` | **8086** | `review_db` | `/reviews/**` |
| `notification-service` | **8087** | `notification_db` | `/notifications/**` |
| `record-service` | **8088** | `record_db` | `/records/**` |

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 📁 Project Structure

```
medibook-frontend/
├── .env                          # ⚠️ NEVER COMMIT — Razorpay key + secrets
├── .env.example                  # ✅ Safe to commit — template for team
├── .gitignore                    # .env excluded
├── index.html                    # Vite HTML entry point
├── vite.config.js                # Dev proxy → localhost:8080
├── package.json                  # Dependencies
└── src/
    ├── main.jsx                  # ReactDOM.createRoot entry
    ├── App.jsx                   # BrowserRouter + all 40+ Routes + PrivateRoute guard
    ├── assets/
    │   └── medical-logo.png      # Brand logo
    ├── components/
    │   └── Layout.jsx            # Sidebar, TopBar, NotificationBell, ThemeToggle
    ├── context/
    │   └── ThemeContext.jsx      # Dark/Light mode global context
    ├── styles/
    │   └── global.css            # All styles (~45KB) — CSS variables, components
    ├── utils/
    │   └── api.js                # Axios instance, all API modules, helpers
    └── pages/
        ├── LandingPage.jsx       # Public home page
        ├── FindDoctorsPage.jsx   # Doctor search + filter
        ├── DoctorProfilePage.jsx # Doctor public profile view
        ├── AdminSetup.jsx        # First-time admin creation
        ├── auth/
        │   ├── LoginPage.jsx           # Email/password login + forgot link
        │   ├── RegisterPage.jsx        # Patient/Provider registration
        │   ├── OtpPage.jsx             # 6-digit OTP verification (all flows)
        │   ├── AddPhonePage.jsx        # Add phone when missing
        │   ├── ForgotPasswordPage.jsx  # Request reset email
        │   ├── ResetPasswordPage.jsx   # Verify OTP + set new password
        │   ├── OAuth2Callback.jsx      # Google OAuth2 redirect handler
        │   └── OAuth2SelectRole.jsx    # Role selection after Google login
        ├── patient/
        │   ├── PatientDashboard.jsx         # Stats, upcoming appointments
        │   ├── BookAppointmentPage.jsx      # Slot picker + Razorpay payment
        │   ├── PatientAppointments.jsx      # Appointment history + cancel/reschedule
        │   ├── PatientMedicalRecords.jsx    # View medical records + attachments
        │   ├── PatientPayments.jsx          # Payment history + receipts
        │   └── PatientProfile.jsx           # Edit profile, change password
        ├── provider/
        │   ├── ProviderDashboard.jsx        # Stats, today's schedule
        │   ├── ProviderSchedule.jsx         # Add/edit/delete slots (schedule-service)
        │   ├── ProviderAppointments.jsx     # Appointments + mark complete
        │   ├── ProviderRecords.jsx          # Create/edit medical records
        │   ├── ProviderProfile.jsx          # Edit profile, set availability
        │   └── ProviderEarnings.jsx         # Earnings summary
        └── admin/
            ├── AdminDashboard.jsx           # Platform stats overview
            ├── AdminUsers.jsx               # All users management
            ├── AdminProviders.jsx           # Provider verify/manage
            ├── AdminAppointments.jsx        # All appointments oversight
            ├── AdminPayments.jsx            # All payments + revenue
            ├── AdminReviews.jsx             # Review moderation
            ├── AdminProfile.jsx             # Admin profile management
            └── AdminPages.jsx              # Admin page layout helpers
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🗺️ All Pages & Routes

### Public Routes (No Auth Required)

| Route | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Hero, features, CTA — MediBook home |
| `/login` | `LoginPage` | Email + password login with forgot link |
| `/register` | `RegisterPage` | Patient / Provider registration |
| `/otp` | `OtpPage` | 6-digit OTP verification (shared by all auth flows) |
| `/add-phone` | `AddPhonePage` | Phone number collection when missing |
| `/forgot-password` | `ForgotPasswordPage` | Request password reset email |
| `/reset-password` | `ResetPasswordPage` | OTP verify + new password (2-step) |
| `/oauth2/callback` | `OAuth2Callback` | Google OAuth2 redirect handler |
| `/oauth2/select-role` | `OAuth2SelectRole` | Role picker after Google login |
| `/find-doctors` | `FindDoctorsPage` | Search/filter doctors by name, spec, city |
| `/doctor/:providerId` | `DoctorProfilePage` | Doctor public profile + available slots |
| `/admin-setup` | `AdminSetup` | One-time admin account creation |

### Patient Routes (`role = "Patient"` required)

| Route | Component | Description |
|---|---|---|
| `/patient` | `PatientDashboard` | Welcome stats, upcoming appointments |
| `/patient/book/:providerId` | `BookAppointmentPage` | Date picker, slot picker, Razorpay payment |
| `/patient/appointments` | `PatientAppointments` | All appointments, cancel, reschedule |
| `/patient/records` | `PatientMedicalRecords` | Medical records, diagnoses, attachments |
| `/patient/payments` | `PatientPayments` | Payment history and receipts |
| `/patient/profile` | `PatientProfile` | Edit profile, change password, deactivate |

### Provider Routes (`role = "Provider"` required)

| Route | Component | Description |
|---|---|---|
| `/provider` | `ProviderDashboard` | Stats, today's schedule, earnings |
| `/provider/schedule` | `ProviderSchedule` | Add slots, bulk/recurring, block/unblock |
| `/provider/appointments` | `ProviderAppointments` | All appointments, mark complete |
| `/provider/records` | `ProviderRecords` | Create/edit/attach medical records |
| `/provider/earnings` | `ProviderEarnings` | Revenue and earnings summary |
| `/provider/profile` | `ProviderProfile` | Edit profile, set availability, specialisation |

### Admin Routes (`role = "Admin"` required)

| Route | Component | Description |
|---|---|---|
| `/admin` | `AdminDashboard` | Platform-wide stats and analytics |
| `/admin/users` | `AdminUsers` | All users, activate/deactivate |
| `/admin/providers` | `AdminProviders` | Provider list, verify, manage |
| `/admin/appointments` | `AdminAppointments` | All appointments, oversight |
| `/admin/payments` | `AdminPayments` | All payments, refunds, revenue |
| `/admin/reviews` | `AdminReviews` | Review moderation, delete |
| `/admin/profile` | `AdminProfile` | Admin profile management |

### Route Guard — `PrivateRoute`

```jsx
// In App.jsx
function PrivateRoute({ children, role }) {
  const user = getUser();                          // reads from localStorage
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return <Navigate to="/" replace />;            // wrong role → home
  return children;
}
```

- Not logged in → redirects to `/login`
- Wrong role (Patient trying `/admin`) → redirects to `/`
- All protected pages use `<Suspense>` with a branded spinner fallback

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🔌 API Layer — `api.js`

All backend communication is centralized in `src/utils/api.js`.

### Axios Instance

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080',    // → API Gateway
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,                      // 30-second timeout
});
```

### JWT Auto-Inject Interceptor

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medibook_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Global 401 Handler

```javascript
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';   // auto logout
    }
    return Promise.reject(err);
  }
);
```

### Retry Logic with Exponential Backoff

```javascript
// Used on critical endpoints (slots, appointments, providers)
const retryRequest = async (fn, maxRetries = 3, delayMs = 1000)
// Retries on: timeout · network error · 5xx server error
// Backoff: 1s → 2s → 4s
```

### Provider Caching

```javascript
// Provider list: cached for 60 seconds (TTL)
getCachedProviderList(cacheKey, fetcher, ttlMs = 60000)

// Provider profile: cached for 120 seconds
getCachedProviderProfile(providerId, fetcher, ttlMs = 120000)

// Cache invalidated on: create/update/delete/verify provider
```

### All API Modules

| Module | Export | Endpoints Covered |
|---|---|---|
| Auth | `authAPI` | register, login, getProfile, updateProfile, changePassword, deactivate |
| Providers | `providerAPI` | register, getAll, getAvailable, getById, getByUserId, search, update, verify, setAvailability, delete |
| Slots | `slotAPI` | add, addBulk, generateRecurring, getByProvider, getAvailable, getById, update, block, unblock, delete |
| Appointments | `appointmentAPI` | book, getById, getByPatient, getUpcoming, getByProvider, getByProviderDate, cancel, reschedule, complete, updateStatus, getCount |
| Payments | `paymentAPI` | initiate, verify, getByAppointment, getByPatient, getByProvider, refund, getByStatus, getTotalRevenue, updateStatus |
| Reviews | `reviewAPI` | submit, getByProvider, getByPatient, getById, update, delete, getAverage, getCount |
| Notifications | `notifAPI` | send, sendBulk, getByRecipient, getUnreadCount, markRead, markAllRead, delete, getAll |
| Records | `recordAPI` | create, getByAppointment, getByPatient, getByProvider, getById, update, delete, attach, getFollowUps, getTodayFollowUps, getCount |

### Helper Utilities

```javascript
getUser()           // parse medibook_user from localStorage
getToken()          // get medibook_token from localStorage
saveAuth(token, user) // persist token + user to localStorage
clearAuth()         // remove both from localStorage
formatDate(d)       // → "22 Apr 2026" (en-IN locale)
formatTime(t)       // "10:00" → "10:00 AM"
getStatusBadge(s)   // status → CSS badge class
getInitials(name)   // "Arjun Sharma" → "AS"
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🔐 Authentication Flows

### Flow 1: Normal Login + OTP Verification

```
/login
  │ POST /auth/login { email, password }
  │
  ├─── Backend: no phone number?
  │    { requiresPhone: true }
  │         ↓
  │    /add-phone?email=...
  │    POST /auth/add-phone { email, phone: "+91XXXXXXXXXX" }
  │         ↓
  │    /otp?email=...&source=normal
  │
  └─── Backend: phone exists, OTP sent?
       { otpSent: true }
            ↓
       /otp?email=...&source=normal

/otp  (OtpPage)
  │   6-digit inputs, auto-focus, paste support
  │   Countdown timer: 5:00 minutes
  │   POST /auth/verify-otp { email, otp }
  │   → { token, userId, fullName, role }
  │   saveAuth(token, user)
  │
  └─── role === "Patient"   → /patient
       role === "Provider"  → /provider
       role === "Admin"     → /admin
```

### Flow 2: Google OAuth2 + OTP

```
/login
  │  Click "Continue with Google"
  │       ↓
  │  Google OAuth2 authentication
  │       ↓
  /oauth2/callback
  │  Exchanges code for token
  │       ↓
  /oauth2/select-role
  │  User selects: Patient / Provider / Doctor
  │  POST /auth/google/complete { email, fullName, picture, provider, role }
  │       ↓
  /otp?email=...&source=google&name=...

/otp  (same OtpPage, source=google)
  │  POST /auth/verify-otp { email, otp }
  │  saveAuth(token, user)
  └─── Navigate to dashboard by role
```

### Flow 3: Forgot Password / Reset Flow

```
/login
  │  Click "Forgot Password?" link
  │       ↓
/forgot-password  (ForgotPasswordPage)
  │  Enter email address
  │  POST /auth/forgot-password { email }
  │  → success: show "Check your email" message with masked email
  │       ↓ (user clicks email link)
/reset-password?token=xyz  (ResetPasswordPage — 2 steps on same page)

  STEP 1: OTP Verification
  │  6 individual digit inputs (auto-focus, backspace, paste)
  │  Countdown timer: 15:00 minutes (longer than login OTP)
  │  Timer hits 0:00 → "Reset link expired" + button to request new link
  │  POST /auth/verify-reset-otp { token, otp }
  │       ↓ (on success — no navigation, same page transitions)

  STEP 2: New Password
  │  New password + confirm password inputs (show/hide toggle)
  │  Password strength bar:
  │    Red (33%)   < 6 chars
  │    Yellow (66%) 6–8 chars
  │    Green (100%) > 8 chars
  │  POST /auth/reset-password { token, newPassword }
  └─── navigate("/login?reset=success", { replace: true })

/login?reset=success
  │  Success alert shown for 5 seconds
  └─── User logs in with new password
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 👥 Three Role Dashboards

### 🩺 Patient Dashboard

```
/patient  →  PatientDashboard
  Stats cards: Upcoming appointments · Total records · Pending payments
  Quick actions: Book Appointment · View Records

/patient/book/:providerId  →  BookAppointmentPage
  1. Date picker (calendar view)
  2. Slot picker (available slots from schedule-service)
  3. Service type + mode of consultation (IN_PERSON / TELECONSULTATION) + notes
  4. Razorpay payment modal (VITE_RAZORPAY_KEY from .env)
  5. POST /appointments/book → POST /payments/initiate → Razorpay → POST /payments/verify

/patient/appointments  →  PatientAppointments
  All appointments with status badges
  Cancel (PUT /appointments/{id}/cancel)
  Reschedule (PUT /appointments/{id}/reschedule)

/patient/records  →  PatientMedicalRecords
  All medical records from record-service
  View diagnosis, prescription, notes
  Download/view attachments (S3 URLs)
  Upcoming follow-up dates

/patient/payments  →  PatientPayments
  All payment transactions
  Receipt details, amounts, status

/patient/profile  →  PatientProfile
  Edit personal info (PUT /auth/profile/{id})
  Change password
  Deactivate account
```

### 🏥 Provider Dashboard

```
/provider  →  ProviderDashboard
  Today's appointment count
  Total earnings summary
  Quick navigation to schedule/appointments

/provider/schedule  →  ProviderSchedule
  Add single slot (POST /slots/add)
  Add bulk slots (POST /slots/bulk)
  Generate recurring slots — DAILY / WEEKLY (POST /slots/recurring)
  Block/Unblock slots (PUT /slots/{id}/block, /unblock)
  Delete slots (DELETE /slots/{id})
  Calendar view of all slots with status indicators

/provider/appointments  →  ProviderAppointments
  All appointments list
  Filter by date (GET /appointments/provider/{id}/date?date=...)
  Mark appointment COMPLETED (PUT /appointments/{id}/complete)
  View patient notes

/provider/records  →  ProviderRecords
  Create medical record (POST /records/create)
  Only for COMPLETED appointments
  Fields: diagnosis, prescription, notes, followUpDate
  Attach document URL (PUT /records/{id}/attach?url=...)

/provider/profile  →  ProviderProfile
  Edit professional info (specialization, city, bio, fees)
  Set availability toggle (PUT /providers/{id}/availability)
  View verification status

/provider/earnings  →  ProviderEarnings
  Earnings summary from payment-service
```

### 🔧 Admin Dashboard

```
/admin  →  AdminDashboard
  Platform KPIs: total users, providers, appointments, revenue
  Charts and summaries

/admin/users  →  AdminUsers
  All registered users (GET /auth all users)
  Activate / Deactivate accounts

/admin/providers  →  AdminProviders
  All providers list
  Verify provider badge (PUT /providers/{id}/verify)
  Delete provider (DELETE /providers/{id})

/admin/appointments  →  AdminAppointments
  All appointments across all users
  Status management

/admin/payments  →  AdminPayments
  All payment transactions
  Initiate refunds (POST /payments/{id}/refund)
  Total revenue (GET /payments/revenue/total)

/admin/reviews  →  AdminReviews
  All reviews moderation
  Delete inappropriate reviews (DELETE /reviews/{id})

/admin/profile  →  AdminProfile
  Admin personal profile management
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 💳 Razorpay Payment Integration

### How It Works

```
Patient → Book Appointment → Pay → Razorpay → Confirm → Appointment SCHEDULED

Step 1: Frontend
  → POST /payments/initiate { appointmentId, amount, currency: "INR" }
  ← { orderId, amount, currency }

Step 2: Razorpay SDK
  → Opens Razorpay payment modal
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY,   // from .env
    amount: data.amount,
    currency: "INR",
    order_id: data.orderId,
    handler: function(response) { /* Step 3 */ }
  }
  new window.Razorpay(options).open();

Step 3: Payment Verification
  → POST /payments/verify {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    }
  ← { success: true }
  → PUT /appointments/{id}/status?status=CONFIRMED
  → Appointment confirmed, slot locked, RabbitMQ event fires
```

### Environment Variable Setup

```bash
# .env  (at project root — NEVER commit this file)
VITE_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxx
VITE_RAZORPAY_SECRET=xxxxxxxxxxxxxxxx

# Usage in component:
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
```

If `VITE_RAZORPAY_KEY` is missing:
```
Razorpay key not configured. Contact admin.
❌ VITE_RAZORPAY_KEY is not set in .env file
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🔒 Environment Variables & Security

### Files

| File | Committed? | Purpose |
|---|---|---|
| `.env` | ❌ **Never** (in .gitignore) | Real keys for local dev |
| `.env.example` | ✅ Safe | Template — no real values |
| `.gitignore` | ✅ | Excludes `.env` |

### `.env` contents

```bash
# Razorpay Payment Gateway Key
# Get your test key from: https://dashboard.razorpay.com/app/keys
VITE_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxx
VITE_RAZORPAY_SECRET=xxxxxxxxxxxxxxxx

# Note: In production, use your production key instead
# VITE_RAZORPAY_KEY=rzp_live_xxxxxxxxxxxxx
```

### `.env.example` (safe to share)

```bash
VITE_RAZORPAY_KEY=your_razorpay_test_key_here
VITE_RAZORPAY_SECRET=your_razorpay_secret_here
```

### Vite Access

```javascript
// MUST start with VITE_ prefix to be available in browser
import.meta.env.VITE_RAZORPAY_KEY

// NOT process.env (that's Node.js only)
// Processed at build time — not visible in browser console
```

### For Teams

```bash
# 1. Clone repo
git clone <repo>

# 2. Copy the example file
cp .env.example .env

# 3. Fill in your own keys
nano .env   # or open in VS Code

# 4. Start dev server
npm run dev
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🧪 API Testing via Browser & cURL

All frontend API calls go through `http://localhost:8080` (API Gateway). Below are the actual endpoint calls made by the frontend, mirrored as cURL examples for testing.

---

### 🔐 Auth Endpoints

**Register:**
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Patel",
    "email": "priya@medibook.com",
    "password": "Patient@123",
    "phone": "9876543210",
    "role": "PATIENT"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "priya@medibook.com", "password": "Patient@123" }'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:8080/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{ "email": "priya@medibook.com", "otp": "123456" }'
```

**Add Phone:**
```bash
curl -X POST http://localhost:8080/auth/add-phone \
  -H "Content-Type: application/json" \
  -d '{ "email": "priya@medibook.com", "phone": "+919876543210" }'
```

**Forgot Password:**
```bash
curl -X POST http://localhost:8080/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{ "email": "priya@medibook.com" }'
```

**Verify Reset OTP:**
```bash
curl -X POST http://localhost:8080/auth/verify-reset-otp \
  -H "Content-Type: application/json" \
  -d '{ "token": "xyz_reset_token", "otp": "654321" }'
```

**Reset Password:**
```bash
curl -X POST http://localhost:8080/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{ "token": "xyz_reset_token", "newPassword": "NewPass@123" }'
```

---

### 🏥 Provider / Doctor Endpoints

**Get all providers (public — used by FindDoctorsPage):**
```bash
curl -X GET http://localhost:8080/providers/available
```

**Search providers:**
```bash
curl -X GET "http://localhost:8080/providers/search?keyword=cardiologist"
```

**Get provider by specialization:**
```bash
curl -X GET "http://localhost:8080/providers/specialization/Dermatology"
```

**Get provider profile (public — DoctorProfilePage):**
```bash
curl -X GET http://localhost:8080/providers/1
```

---

### 📅 Slots / Schedule (schedule-service on :8083)

**Get available slots for booking:**
```bash
curl -X GET "http://localhost:8080/slots/available/1?date=2026-05-15"
```

**Doctor adds a slot:**
```bash
curl -X POST http://localhost:8080/slots/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <DOCTOR_TOKEN>" \
  -d '{
    "providerId": 1,
    "date": "2026-05-15",
    "startTime": "10:00",
    "endTime": "10:30",
    "durationMinutes": 30,
    "recurrence": "NONE"
  }'
```

**Doctor generates recurring slots:**
```bash
curl -X POST http://localhost:8080/slots/recurring \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <DOCTOR_TOKEN>" \
  -d '{
    "providerId": 1,
    "date": "2026-05-01",
    "startTime": "09:00",
    "endTime": "09:30",
    "durationMinutes": 30,
    "recurrence": "DAILY",
    "recurrenceEndDate": "2026-05-07"
  }'
```

**Doctor blocks a slot:**
```bash
curl -X PUT http://localhost:8080/slots/5/block \
  -H "Authorization: Bearer <DOCTOR_TOKEN>"
```

---

### 📋 Appointments

**Book appointment:**
```bash
curl -X POST http://localhost:8080/appointments/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PATIENT_TOKEN>" \
  -d '{
    "patientId": 2,
    "providerId": 1,
    "patientEmail": "priya@medibook.com",
    "slotId": 5,
    "serviceType": "General Consultation",
    "appointmentDate": "2026-05-15",
    "startTime": "10:00",
    "endTime": "10:30",
    "modeOfConsultation": "IN_PERSON",
    "notes": "First visit"
  }'
```

**Patient views upcoming appointments:**
```bash
curl -X GET http://localhost:8080/appointments/patient/2/upcoming \
  -H "Authorization: Bearer <PATIENT_TOKEN>"
```

**Cancel appointment:**
```bash
curl -X PUT http://localhost:8080/appointments/1/cancel \
  -H "Authorization: Bearer <PATIENT_TOKEN>"
```

**Doctor marks complete:**
```bash
curl -X PUT http://localhost:8080/appointments/1/complete \
  -H "Authorization: Bearer <DOCTOR_TOKEN>"
```

---

### 💳 Payments

**Initiate payment:**
```bash
curl -X POST http://localhost:8080/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PATIENT_TOKEN>" \
  -d '{ "appointmentId": 1, "amount": 50000, "currency": "INR" }'
```

**Verify payment:**
```bash
curl -X POST http://localhost:8080/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PATIENT_TOKEN>" \
  -d '{
    "razorpay_payment_id": "pay_xxxx",
    "razorpay_order_id": "order_xxxx",
    "razorpay_signature": "xxxx"
  }'
```

**Patient payment history:**
```bash
curl -X GET http://localhost:8080/payments/patient/2 \
  -H "Authorization: Bearer <PATIENT_TOKEN>"
```

---

### ⭐ Reviews

**Submit review:**
```bash
curl -X POST http://localhost:8080/reviews/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PATIENT_TOKEN>" \
  -d '{
    "patientId": 2,
    "providerId": 1,
    "appointmentId": 1,
    "rating": 5,
    "comment": "Excellent consultation, very thorough."
  }'
```

**Get doctor average rating:**
```bash
curl -X GET http://localhost:8080/reviews/provider/1/average
```

---

### 🔔 Notifications (notification-service on :8087)

**Get user notifications (bell icon):**
```bash
curl -X GET http://localhost:8080/notifications/recipient/2 \
  -H "Authorization: Bearer <PATIENT_TOKEN>"
```

**Get unread count (badge number):**
```bash
curl -X GET http://localhost:8080/notifications/unread/count/2 \
  -H "Authorization: Bearer <PATIENT_TOKEN>"
```

**Mark all as read:**
```bash
curl -X PUT http://localhost:8080/notifications/read/all/2 \
  -H "Authorization: Bearer <PATIENT_TOKEN>"
```

---

### 🏥 Medical Records (record-service on :8088)

**Doctor creates record:**
```bash
curl -X POST http://localhost:8080/records/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <DOCTOR_TOKEN>" \
  -d '{
    "appointmentId": 1,
    "patientId": 2,
    "providerId": 1,
    "diagnosis": "Hypertension Stage 1",
    "prescription": "Amlodipine 5mg once daily",
    "notes": "Monitor BP weekly",
    "followUpDate": "2026-06-01"
  }'
```

**Patient views records:**
```bash
curl -X GET http://localhost:8080/records/patient/2 \
  -H "Authorization: Bearer <PATIENT_TOKEN>"
```

**Doctor attaches lab report:**
```bash
curl -X PUT "http://localhost:8080/records/1/attach?url=https://s3.amazonaws.com/medibook/bp-report.pdf" \
  -H "Authorization: Bearer <DOCTOR_TOKEN>"
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🚀 Running the Frontend

### Prerequisites

- Node.js 18+ and npm 9+
- All backend microservices running (especially API Gateway on `:8080`)
- `.env` file configured at project root

### Backend Startup Order (before starting frontend)

```bash
# 1. Start Eureka Server  :8761
cd eureka-server && mvn spring-boot:run

# 2. Start API Gateway  :8080
cd api-gateway && JWT_SECRET=<secret> mvn spring-boot:run

# 3. Start Auth Service  :8081
cd auth-service && JWT_SECRET=<secret> mvn spring-boot:run

# 4. Start Provider Service  :8082
cd provider-service && JWT_SECRET=<secret> mvn spring-boot:run

# 5. Start Schedule Service  :8083
cd schedule-service && JWT_SECRET=<secret> mvn spring-boot:run

# 6. Start Appointment Service  :8084
cd appointment-service && JWT_SECRET=<secret> mvn spring-boot:run

# 7. Start Payment Service  :8085
cd payment-service && JWT_SECRET=<secret> mvn spring-boot:run

# 8. Start Review Service  :8086
cd review-service && JWT_SECRET=<secret> mvn spring-boot:run

# 9. Start Notification Service  :8087
cd notification-service \
  && JWT_SECRET=<secret> MAIL_USERNAME=<gmail> MAIL_PASSWORD=<app-pw> \
  mvn spring-boot:run

# 10. Start Record Service  :8088
cd record-service \
  && JWT_SECRET=<secret> MAIL_USERNAME=<gmail> MAIL_PASSWORD=<app-pw> \
  mvn spring-boot:run
```

### Frontend Setup

```bash
# 1. Clone / navigate to frontend project
cd medibook-frontend

# 2. Install dependencies
npm install

# 3. Create .env file (copy from example)
cp .env.example .env
# Then edit .env and fill in your Razorpay test keys

# 4. Start development server
npm run dev
```

Frontend available at: **http://localhost:5173**

### Vite Dev Proxy

`vite.config.js` proxies all API paths to the gateway:

```javascript
server: {
  proxy: {
    '/auth':          'http://localhost:8080',
    '/providers':     'http://localhost:8080',
    '/slots':         'http://localhost:8080',
    '/appointments':  'http://localhost:8080',
    '/payments':      'http://localhost:8080',
    '/reviews':       'http://localhost:8080',
    '/notifications': 'http://localhost:8080',
    '/records':       'http://localhost:8080',
  }
}
```

This prevents CORS issues during development.

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 📦 Build for Production

```bash
# Build optimized production bundle
npm run build
# Output → dist/

# Preview production build locally
npm run preview
```

Production build output in `dist/`:
- All JS code-split per route (lazy loaded via `React.lazy`)
- CSS bundled into `dist/assets/index-*.css`
- Assets hashed for cache-busting

### Code Splitting

All pages use `React.lazy` + `Suspense` for automatic code splitting:

```jsx
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const ProviderSchedule  = lazy(() => import('./pages/provider/ProviderSchedule'));
// Each route loads its own JS chunk only when visited
```

Result: initial load is fast — user only downloads code for the page they're on.

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🔧 Troubleshooting

### ❌ Cannot reach localhost:8080 / Network Error

```bash
# 1. Verify API Gateway is running
curl http://localhost:8080/providers/available

# 2. Check Eureka dashboard — all services should be UP
open http://localhost:8761

# 3. If CORS errors appear in browser console, check gateway CORS config
# allowedOrigins should include http://localhost:5173
```

### ❌ 401 Unauthorized on all requests

```javascript
// Check localStorage has a valid token
localStorage.getItem('medibook_token')  // should not be null

// On 401 the app auto-clears localStorage and redirects to /login
// This means your token expired → just log in again
```

### ❌ Razorpay key not configured

```bash
# Ensure .env exists in project root (NOT in src/)
ls -la .env

# Ensure key starts with VITE_ prefix
cat .env  # should show: VITE_RAZORPAY_KEY=rzp_test_...

# Restart dev server after editing .env — Vite loads env at startup
npm run dev
```

### ❌ OTP page blank / not working

```
URL must have: /otp?email=...&source=normal
Check browser console for OTP code (printed during dev)
```

### ❌ Slots not loading on BookAppointmentPage

```bash
# schedule-service must be running on :8083
curl "http://localhost:8080/slots/available/1?date=2026-05-15"
```

### ❌ Page shows "Loading page..." forever

```
React.lazy chunk failed to load — check browser DevTools Network tab
Usually caused by a build error or missing route component
```

### Quick Diagnostics Checklist

- [ ] MySQL running with all 8 databases created
- [ ] All 10 services started in correct order
- [ ] Eureka at `http://localhost:8761` shows all services UP
- [ ] API Gateway responds at `http://localhost:8080/providers/available`
- [ ] `.env` exists with `VITE_RAZORPAY_KEY` set
- [ ] RabbitMQ running for notification-service and appointment-service events
- [ ] No red errors in browser DevTools Console

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## Author👨‍💻

[Harshal Choudhary](https://github.com/Harshal-25C) - Software Developer👨‍💻 | Cloud Enthusiast              
B.Tech - `[Computer Science & Engineering]`         
Java | Spring Boot | Maven | JWT & Security | OAuth | React.js | Clean Architecture 

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&customColorList=6,11,20&height=2" width="100%"/>

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-Harshal--25C-181717?style=for-the-badge&logo=github)](https://github.com/Harshal-25C)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-6366F1?style=for-the-badge&logo=globe)](https://github.com/Harshal-25C)

<br/>

| | |
|---|---|
| 🎓 **Degree** | B.Tech — Computer Science & Engineering |
| 💼 **Role** | Software Developer · Cloud Enthusiast |
| ☕ **Backend** | Java · Spring Boot · Maven · JWT & Security · OAuth2 |
| ⚛️ **Frontend** | React.js · Vite · JavaScript · CSS |
| 🏗️ **Architecture** | Microservices · Clean Architecture · REST APIs |
| 🐇 **Messaging** | RabbitMQ · Event-Driven Design |
| ☁️ **Cloud** | Spring Cloud · Eureka · API Gateway |

<br/>

> *"Building scalable, production-grade systems one microservice at a time."*

<br/>

</div>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0ea5e9,40:6366f1,80:8b5cf6,100:0ea5e9&height=120&section=footer" width="100%"/>

**MediBook Frontend — Vite + React 18 + Axios**

`40+ Pages` · `3 Role Portals` · `8 Microservice APIs` · `Razorpay` · `Google OAuth2` · `OTP Auth`

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.1.4-646CFF?style=flat-square&logo=vite)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
[![GitHub](https://img.shields.io/badge/Author-Harshal--25C-181717?style=flat-square&logo=github)](https://github.com/Harshal-25C)

</div>
