const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const AUTH_USER = {
  email: 'user@promptpilot.com',
  password: 'Password123'
};

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

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`PromptPilot login running at http://localhost:${PORT}`);
});
