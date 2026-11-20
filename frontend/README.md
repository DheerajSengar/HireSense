# HireSense

## Run locally

1. Make sure MongoDB is running, then configure `backend/.env` using `backend/.env.example`.
   `MONGODB_URI` and a private `JWT_SECRET` are required for account creation and login.
2. In one terminal, start the API:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

3. In another terminal, start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

The frontend sends login and registration requests to `http://localhost:5000/api` by default.
Create `frontend/.env` from `frontend/.env.example`; set `VITE_API_URL` if the API uses a
different address (for example, `https://api.example.com/api`), and set
`VITE_GOOGLE_CLIENT_ID` to enable Google sign-in. Restart Vite after changing environment
variables.

## Google sign-in setup

1. In Google Cloud Console, create or select a project and configure the Google Auth Platform
   consent screen.
2. Create an OAuth 2.0 Client ID for a **Web application**. Add the frontend origin to
   **Authorized JavaScript origins** (for local Vite, `http://localhost:5173`; add your
   production frontend origin when deploying).
3. Put that same Client ID in `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` and
   `GOOGLE_CLIENT_ID` in `backend/.env`. The Client ID is public configuration, not a secret;
   do not put a client secret in the frontend. This implementation verifies Google's ID
   token on the backend and does not require a client secret or redirect URI.
4. Restart both development servers. Google sign-in appears on the login and registration
   pages once the frontend Client ID is configured.

Existing email/password login and registration continue to work. Google sign-in creates an
account on first use or links a matching email account after Google verifies that email.

## API keys and secrets

Keep credentials in `backend/.env`; never paste them into frontend code, `frontend/.env`,
or any variable beginning with `VITE_`. Frontend environment variables are included in
public browser code. Add values to the matching entries in `backend/.env` without sharing
them in chat or committing the file.

MongoDB access and `JWT_SECRET` are required for login and account creation. Use a strong,
private `JWT_SECRET` outside local development.

## Dashboard career insights

Set `GEMINI_API_KEY` in `backend/.env` to enable Gemini resume analysis, career suggestions,
skill-gap analysis, and semantic job matching. The backend uses this key to create profile
and job embeddings, then calculates cosine similarity for match percentages. Embeddings and
generated insights are cached in MongoDB and refreshed when their source profile/job text
changes. Without the key, the dashboard still displays MongoDB data and labels its fallback
skill-overlap matches; Gemini-only suggestions remain unavailable. Profile and resume-derived
text is sent to Google's Gemini API when these features are used.

## Resume analyzer

Candidates can upload a text-based PDF from the Resume workspace (maximum 5 MB and
30 pages). The backend validates the PDF signature, extracts a bounded amount of text,
and sends that text to Gemini using the private `GEMINI_API_KEY`. The structured report
is saved in the authenticated user's MongoDB profile and loaded again when the page is
reopened. Scanned/image-only PDFs are not OCR'd and are reported as unreadable. Do not
place the Gemini key in frontend environment variables.

## Applications

Candidate applications are stored in MongoDB and tied to the authenticated account.
The application list, sidebar count, and application status use the protected
`/api/applications` endpoints. The unique job/candidate index prevents repeat
applications; candidates can cancel an application while it is still in the Applied
stage. Recruiters can update application status to Applied, Shortlisted, Interview,
Selected, or Rejected. Optional per-application Gemini analysis compares saved profile
and resume-derived information with the applied job and is stored with the application
for display after refresh. Profile and job text is sent to Gemini only when a user
requests this analysis.

## Job details and AI matching

Job detail pages load the selected published job from `GET /api/jobs/:id`. Candidate
accounts can apply through the protected applications API, save/unsave jobs, and fetch
their per-job application/saved state. Duplicate applications are rejected by the
backend and the MongoDB unique job/candidate index. The protected `GET /api/match/:id`
endpoint compares the saved profile and resume with the job using cached Gemini
embeddings and cosine similarity, then asks Gemini for a short evidence-based
explanation. If embedding generation is unavailable, the response identifies the
skill-overlap estimate instead of presenting it as semantic matching. Gemini keys and
all profile/job analysis requests remain on the backend.
