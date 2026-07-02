const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const AUTH_USER = {
  email: 'user@promptpilot.com',
  password: 'Password123'
};

function analyzePrompt(prompt) {
  const text = (prompt || '').trim();
  const lower = text.toLowerCase();
  const issues = [];

  if (!text) {
    issues.push('Prompt is empty. Add a clear instruction or question so the debugger can understand the task.');
    return { summary: 'No prompt provided.', analysis: issues };
  }

  if (text.length < 30) {
    issues.push('Prompt is very short. Add more context and expected output details.');
  }

  if (/\b(something|some stuff|whatever|anything)\b/.test(lower)) {
    issues.push('Avoid vague terms like "something" or "anything". Be specific about the task and expected output.');
  }

  if (!/\b(write|create|generate|summarize|describe|explain|compare|translate|analyze|list|fix|improve|review)\b/.test(lower)) {
    issues.push('Include an explicit action verb so the model knows exactly what to do.');
  }

  if (!/\b(format|json|markdown|yaml|bullet|table|plain text|email|code|steps)\b/.test(lower) && text.length > 80) {
    issues.push('Consider specifying the desired response format, such as JSON, markdown, bullets, or a code block.');
  }

  if (!/\b(context|background|information|details|example|for example|e\.g\.|such as)\b/.test(lower) && text.length > 100) {
    issues.push('Add clearer context, background, or examples to help the model answer correctly.');
  }

  if (/\b(don't know|do not know|not sure|maybe|unclear)\b/.test(lower)) {
    issues.push('Remove uncertainty words and make your prompt more direct to improve model confidence.');
  }

  if (!issues.length) {
    return { summary: 'Prompt looks clear and well-structured.', analysis: ['The prompt is well formed and should work effectively with a prompt model.'] };
  }

  return {
    summary: 'The prompt has a few weaknesses that could cause poor or inconsistent results.',
    analysis: issues
  };
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: 'promptpilot-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 }
  })
);

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === AUTH_USER.email && password === AUTH_USER.password) {
    req.session.user = { email };
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false, error: 'Invalid email or password.' });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  return res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/analyze', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { prompt } = req.body;
  const result = analyzePrompt(prompt);
  return res.json({ success: true, ...result });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`PromptPilot login running at http://localhost:${PORT}`);
});
