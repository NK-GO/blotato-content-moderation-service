# Content Moderation Service

This project is a modular, extensible content moderation service built with Next.js and TypeScript. It provides an API endpoint that analyzes text content against a series of moderation rules, including a blocklist, PII detection, and AI-powered analysis using the OpenAI API.

## ✨ Features

-   **Modular Architecture**: Easily add or remove moderation modules by implementing the `IModerationModule` interface.
-   **Parallel Processing**: All moderation modules run in parallel for maximum efficiency.
-   **Blocklist Filtering**: Rejects content containing specific forbidden words or phrases.
-   **PII Detection**: Flags content that may contain Personally Identifiable Information (PII) like emails, phone numbers, and credit card numbers.
-   **AI-Powered Moderation**: Leverages OpenAI's GPT models to analyze text for policy violations like hate speech, spam, and unprofessional language.
-   **Configurable Decision Logic**: The service aggregates results, prioritizing `REJECT` decisions over `FLAG` decisions.

## 📂 Project Structure

The project is organized into logical directories to separate concerns.

```
/
├── pages/api/
│   └── moderate.ts      # The API route handler for the moderation endpoint.
├── src/
│   ├── modules/         # Contains individual moderation modules.
│   │   ├── BlocklistModule.ts
│   │   ├── PIIModule.ts
│   │   └── AITextModerationModule.ts
│   ├── services/
│   │   └── ContentModerationService.ts # Orchestrates the moderation modules.
│   └── types/
│       └── index.ts     # Core TypeScript types and interfaces.
├── public/              # Static assets.
├── package.json         # Project dependencies and scripts.
└── tsconfig.json        # TypeScript configuration.
```

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   Node.js (v20 or later)
-   npm, yarn, or pnpm
-   An OpenAI API Key

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project and add your OpenAI API key:

    ```env
    # .env.local
    OPENAI_API_KEY="your_openai_api_key_here"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

## ⚙️ API Usage

The service exposes a single API endpoint to handle content moderation.

### Endpoint: `POST /api/moderate`

This endpoint processes a given text payload and returns a final moderation decision.

**Request Body** (`ContentPayload`):

```json
{
  "text": "The content you want to moderate.",
  "authorId": "A unique identifier for the user posting the content."
}
```

**Responses**:

-   **`200 OK` (Approved):** Returned when the content is approved by all modules.
    ```json
    {
      "finalDecision": "APPROVE",
      "reasons": []
    }
    ```
-   **`400 Bad Request` (Flagged or Rejected):** Returned when the content violates one or more policies.
    ```json
    {
      "error": "Content was rejected with decision: REJECT",
      "reasons": [
        "Content contains forbidden phrase: \"get rich quick\"."
      ]
    }
    ```
-   **`400 Bad Request` (Invalid Payload):**
    ```json
    {
      "error": "Missing required fields: text and authorId"
    }
    ```

## 🛠️ How It Works

1.  A `POST` request with a `ContentPayload` is sent to the `/api/moderate` endpoint.
2.  The `ContentModerationService` receives the payload.
3.  The service invokes the `execute` method on all registered modules (`BlocklistModule`, `PIIModule`, `AITextModerationModule`) concurrently.
4.  It aggregates the results:
    -   If any module returns a `REJECT` decision, the final decision is `REJECT`.
    -   Otherwise, if any module returns a `FLAG` decision, the final decision is `FLAG`.
    -   If all modules `APPROVE`, the final decision is `APPROVE`.
5.  The final `ModerationResult` is returned to the client with an appropriate HTTP status code.

## 💻 Technologies Used

-   **Framework**: Next.js 15
-   **Language**: TypeScript
-   **AI**: OpenAI Node.js Library
-   **Styling**: Tailwind CSS
-   **Linting**: ESLint