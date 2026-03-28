# Brokai Labs — Lead Intelligence Pipeline

A multi-agent lead intelligence system that takes a list of companies, autonomously researches each one, finds contact information, and generates a personalised cold outreach message.

**Live demo:** `<your-deployed-url-here>`

---

## How it works

Three specialised agents run in sequence for each company:

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| 01 Researcher | Searches the web to build a business profile | Company name + location | Structured profile (what they do, size, digital presence, tools) |
| 02 Contact Finder | Locates contact details across public directories | Business profile | Phone, email, WhatsApp + source URL |
| 03 Outreach Writer | Writes a personalised WhatsApp-style cold message | Profile + contact card | Ready-to-send outreach message |

Each agent has its own file (`src/agents/`), its own system prompt, and a clearly defined input/output contract. State is passed explicitly between agents via the pipeline orchestrator (`src/pipeline.js`).

---

## Project structure

```
src/
├── agents/
│   ├── researcher.js       # Agent 01
│   ├── contactFinder.js    # Agent 02
│   └── outreachWriter.js   # Agent 03
├── components/
│   ├── FileUpload.jsx
│   └── ResultRow.jsx
├── lib/
│   ├── claudeClient.js     # Shared Anthropic API wrapper
│   └── excelParser.js      # Excel/CSV file parser
├── pipeline.js             # Orchestrates agent handoffs + error handling
├── App.jsx
└── main.jsx
```

---

## Running locally

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/brokai-pipeline
cd brokai-pipeline

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your Anthropic API key

# 4. Start the dev server
npm run dev
# Open http://localhost:3000
```

---

## Environment variables

See `.env.example`:

```
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key at [console.anthropic.com](https://console.anthropic.com/).

---

## Deploying to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add `VITE_ANTHROPIC_API_KEY` as an environment variable in your Vercel project settings.

---

## Input format

Upload an Excel file (`.xlsx`, `.xls`, or `.csv`):
- **Column A** — Company name (required)
- **Column B** — Location (optional, defaults to "India")

---

## Failure handling

Every company row always produces an output, even if agents encounter errors:
- Agent failures are caught individually — a failed contact lookup doesn't stop the outreach writer
- Rows with partial results are clearly marked
- Missing contact info shows "No contact information found" instead of a blank or crash

---

## Tech stack

- **Frontend:** React + Vite
- **AI:** Anthropic Claude (claude-sonnet-4) with web search tool
- **File parsing:** SheetJS (xlsx)
- **Deployment:** Vercel (free tier)
