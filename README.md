# Personal Gemini Journal

> Built for the **Google AI Studio Secure AI Application Ideathon**.  
> A private, introspective journaling companion powered by **Gemini 3.6 Flash** and **Cloud Firestore** featuring strict user-isolated security, zero cross-user data leakage, and the original **Gemini Reflection Engine**.

---

## Architecture & Security Highlights

1. **Firebase Authentication (Google Sign-In)**: Passwordless, federated identity handling. Unauthenticated users are strictly quarantined to the landing view.
2. **Strict Firestore ABAC Security Rules**: Isolated paths at `users/{userId}/journals/{journalId}` and subcollections enforced by `request.auth.uid == userId`. No user can ever query or inspect another user's private reflections.
3. **Server-Side Gemini API Proxy**: Zero client-side API key exposure. All LLM calls run through an Express server using the `@google/genai` SDK with input validation, prompt injection defense, and request body bounds.
4. **Resilient Model Fallback Ladder**: Automated multi-tier fallback protocol (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash`) recovering gracefully from transient upstream outages.
5. **Original Feature — Gemini Reflection Engine**: Cross-journal longitudinal synthesis analyzing recurring themes, emotional evolution, repeated concerns, breakthrough insights, and personal growth milestones.

---

## 1. Prerequisites & Environment Setup

### Install Tools
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)

### Enable Google Cloud APIs
```bash
# Set your active Google Cloud Project
gcloud config set project YOUR_PROJECT_ID

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

---

## 2. Secret Manager Configuration

To guarantee zero hardcoding of API credentials, configure the Gemini API key in Google Cloud Secret Manager and grant Cloud Run accessor permissions.

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant the default Cloud Run runtime service account permission to access the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration (Cloud Firestore)

Deploy the strict user-isolation security rules ensuring zero cross-user data leakage:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Healthcheck test document
    match /test/connection {
      allow read: if true;
      allow write: if false;
    }

    // STRICT USER DATA ISOLATION
    match /users/{userId}/journals/{journalId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /messages/{messageId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Default deny all other paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy rules using Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (.env)
cp .env.example .env
# Set GEMINI_API_KEY=your_gemini_api_key

# 3. Launch local dev server (Express + Vite on Port 3000)
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

---

## 5. Google Cloud Run Deployment

Build and deploy the application container to Google Cloud Run:

```bash
# 1. Build and deploy to Cloud Run with Secret Manager binding
gcloud run deploy personal-gemini-journal \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest

# 2. Apply the mandatory campaign verification label
gcloud run services update personal-gemini-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 6. Functional Verification Walkthrough

Follow these concrete steps to verify all core capabilities:

1. **Authentication Flow**:
   - Access the root URL while logged out. Verify that only the Landing Page is visible.
   - Click "Sign in with Google". Complete the popup flow. Verify redirect into the private dashboard.
2. **Multi-Turn Gemini Journaling**:
   - In "Active Session", select a reflection starter chip (or type a personal reflection).
   - Click "Send". Observe the optimistic state update and Gemini 3.6 Flash streaming/reflective response.
   - Send follow-up replies to verify multi-turn context retention.
   - Inspect Firestore in Firebase Console: verify documents are stored under `users/{YOUR_UID}/journals/{JOURNAL_ID}/messages`.
3. **Structured Reflection Synthesis**:
   - Click "Generate Summary". Observe structured AI output: Title, Summary, Mood, Topics tags, Key Realization, Action Items, and Reflection Question.
4. **Journal History & Deletion**:
   - Switch to the "Journal History" tab. Verify your new entry appears with date, mood badge, and topic chips.
   - Test the search bar by typing a keyword or selecting a mood filter.
   - Click "Details" to open the conversation modal. Test deleting the entry with confirmation.
5. **Gemini Reflection Engine & Growth Timeline**:
   - Switch to the "Growth Timeline" tab.
   - Click "Run Reflection Engine". Observe multi-journal synthesis: Personal Growth Narrative, Recurring Themes with trend statuses, Mood Patterns, Persistent Concerns with reframings, and Suggested Next Phase Actions.
   - Verify the interactive chronological milestone timeline.
6. **Security Audit Page**:
   - Click the "Security Audit" tab to review the 10 Threat Zones, countermeasures, and active Firestore rules.
