# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## i am proposing we use clean scalable architecture 
src/
├── app/
│   ├── App.jsx
│   ├── routes.jsx
│   └── app.css
│
├── models/
│   ├── memeModel.js
│   ├── templateModel.js
│   └── sampleModel.js
│
├── controllers/
│   └── memeController.js
│
├── views/
│   ├── Home/
│   │   ├── Home.jsx
│   │   └── Home.css
│   ├── Generate/
│   │   ├── Generate.jsx
│   │   ├── IntentionStep.jsx
│   │   ├── CandidateSelection.jsx
│   │   └── FinalMeme.jsx
│   ├── Samples/
│   │   ├── Samples.jsx
│   │   └── Samples.css
│   └── HowItWorks/
│       └── HowItWorks.jsx
│
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── PageShell.jsx
│   ├── meme/
│   │   ├── MemeCard.jsx
│   │   ├── CandidateCard.jsx
│   │   └── MemePreview.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Loading.jsx
│       └── StepIndicator.jsx
│
├── hooks/
│   ├── useMemeGeneration.js
│   ├── useNavigation.js
│   └── useLocalStorage.js
│
├── services/
│   ├── memeService.js
│   └── storageService.js
│
├── data/
│   ├── prompts.js
│   ├── templates.js
│   └── samples.js
│
├── utils/
│   ├── canvas.js
│   └── scoring.js
│
└── main.jsx

src/app/App.jsx              # Composes the application and connects views to controllers.
src/app/routes.jsx           # Defines available application pages and navigation.
src/app/app.css              # Contains global styles, theme variables, and shared layout rules.

src/models/memeModel.js       # Defines meme state, data shapes, workflow steps, and validation rules.
src/models/templateModel.js  # Defines template data and template-related behavior.
src/models/sampleModel.js    # Defines sample meme data and sample-related behavior.

src/controllers/memeController.js # Coordinates meme-generation actions and state transitions.
src/views/Home/Home.jsx      # Displays the homepage and prompt-starting actions.
src/views/Generate/Generate.jsx # Displays the complete meme-generation workflow.
src/views/Generate/IntentionStep.jsx # Collects topic, language, intention, and style.
src/views/Generate/CandidateSelection.jsx # Displays selectable image or caption candidates.
src/views/Generate/FinalMeme.jsx # Displays and downloads the completed meme.
src/views/Samples/Samples.jsx # Displays the sample meme gallery.
src/views/HowItWorks/HowItWorks.jsx # Explains the generation process.

src/components/layout/Header.jsx # Displays branding and navigation.
src/components/layout/Footer.jsx # Displays the application footer.
src/components/layout/PageShell.jsx # Provides the shared page layout and structure.
src/components/meme/MemeCard.jsx # Displays a reusable meme preview.
src/components/meme/CandidateCard.jsx # Displays one selectable image or caption candidate.
src/components/meme/MemePreview.jsx # Displays the final generated meme.
src/components/common/Button.jsx # Provides consistent reusable button styles and behavior.
src/components/common/Loading.jsx # Displays loading status during backend operations.
src/components/common/StepIndicator.jsx # Displays the current generation step.

src/hooks/useMemeGeneration.js # Manages generation state, loading, errors, retries, and workflow actions.
src/hooks/useNavigation.js   # Manages page navigation and navigation state.
src/hooks/useLocalStorage.js # Provides reusable localStorage state management.

src/services/apiClient.js    # Configures HTTP requests, headers, errors, and authentication.
src/services/memeService.js   # Calls backend endpoints for meme-related operations.
src/services/generationService.js # Sends prompts to the backend LLM/VLM and normalizes responses.
src/services/storageService.js # Saves and retrieves samples or history.

src/data/prompts.js          # Stores reusable example prompts.
src/data/templates.js        # Stores available meme-template metadata.
src/data/samples.js           # Stores sample-gallery metadata.

src/utils/canvas.js           # Contains canvas rendering and image-export helpers.
src/utils/scoring.js          # Contains candidate scoring and ranking helpers.
src/main.jsx                  # Starts the React application.
