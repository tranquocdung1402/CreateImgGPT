# CreateImgGPT

Local web app for building a structured tour-brochure image prompt, generating an image through the OpenAI API, previewing it, and downloading the result.

## Setup

1. Put your OpenAI API key in `.env.local`:

```env
OPENAI_API_KEY=sk-proj-...
```

2. Start the local server:

```bash
npm start
```

3. Open:

```text
http://localhost:3000
```

## Notes

- The API key is only read by `server.js`; it is not exposed in frontend code.
- The default orchestrator model is `gpt-5.5`.
- The default image model field is `gpt-image-2`, editable directly in the UI.
- Uploading a logo adds it as a reference image in the generation request.

