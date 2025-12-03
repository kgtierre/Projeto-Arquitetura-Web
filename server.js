require('dotenv').config();

const express = require('express');
const session = require('express-session'); 
const helmet = require('helmet');
const csrf = require('csurf');
const mongoose = require('mongoose'); 
const userController = require('./controllers/userController');
const isAuth = require('./middleware/auth');
const authController = require('./controllers/authController');
const app = express();
const loginLimiter = require('./middleware/rateLimit');

app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware para ler dados de formulários
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// 1. SESSÃO PRIMEIRO (obrigatório para csurf)
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: true, // Alterado para true para CSRF funcionar
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000 // 1 hora
    }
}));

// 2. CSRF DEPOIS da sessão
const csrfProtection = csrf();
app.use(csrfProtection);

// 3. Passar token para todas as views
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/arquiteturaWeb')
  .then(() => console.log('🔥 Conectado ao MongoDB!'))
  .catch(err => console.error('Erro ao conectar no Mongo:', err));

// --- ROTAS PÚBLICAS ---
app.get('/login', (req, res) => {
    res.render('login', { erro: req.query.erro, sucesso: req.query.sucesso });
});
app.post('/login', loginLimiter, authController.login);
app.get('/logout', authController.logout);

app.get('/register', authController.getRegisterForm);
app.post('/register', authController.registerUser);

// --- ROTAS PROTEGIDAS ---
app.get('/', (req, res) => res.redirect('/users'));
app.get('/users', isAuth, userController.getAllUsers);
app.get('/users/new', isAuth, userController.getNewUserForm);
app.post('/users/delete/:id', isAuth, userController.deleteUser);
app.get('/users/edit/:id', isAuth, userController.getEditUserForm);
app.post('/users/update/:id', isAuth, userController.updateUser);

app.listen(process.env.PORT || 3000, () => {
    console.log(`✅ Servidor rodando na porta ${process.env.PORT || 3000}`);
});