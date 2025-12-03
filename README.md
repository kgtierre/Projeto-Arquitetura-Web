# Trabalho 4 - Implementando Defesas Arquiteturais

**Aluno:** Kaylon Gutierre Peres Gonçalves  
**Matrícula:** 2022007075  
**Disciplina:** DCC 704 – Arquitetura e Tecnologias de Sistemas WEB  
**Universidade Federal de Roraima – UFRR**  
**Departamento de Ciência da Computação – DCC**  
**Professor:** Jean Bertrand

## Objetivo
Fortificar o projeto web contra vulnerabilidades críticas (XSS, CSRF e Força Bruta) aplicando middlewares essenciais na camada de arquitetura.

## Vulnerabilidades Mitigadas

### 1. SQL Injection Prevention
- **Status:** ✅ Mitigado
- **Técnica:** Queries parametrizadas do Mongoose
- **Localização:** `controllers/authController.js`, `controllers/userController.js`
- **Evidência:** Nenhuma concatenação manual de strings SQL encontrada
- **Comprovação:** Mongoose utiliza prepared statements automaticamente

### 2. Cross-Site Scripting (XSS) Protection
- **Status:** ✅ Mitigado
- **Técnica:** Output escaping automático do EJS
- **Views verificadas e protegidas:**
  - `views/login.ejs` - Uso correto de `<%= %>`
  - `views/register.ejs` - Uso correto de `<%= %>`
  - `views/usersList.ejs` - Uso correto de `<%= %>`
  - `views/editUsuario.ejs` - Uso correto de `<%= %>`
  - `views/formUsuario.ejs` - Uso correto de `<%= %>`
- **Teste prático:** Dados maliciosos (`<script>alert()</script>`) são renderizados como texto, não executados

### 3. Força Bruta (Rate Limiting)
- **Status:** ✅ Implementado
- **Middleware:** `express-rate-limit`
- **Arquivo:** `middleware/rateLimit.js`
- **Rota protegida:** POST `/login`
- **Configuração:** 5 tentativas em 15 minutos
- **Mensagem de bloqueio:** "Muitas tentativas de login. Tente novamente em 15 minutos."
- **Teste confirmado:** Bloqueio efetivo na 6ª tentativa consecutiva

### 4. CSRF (Cross-Site Request Forgery) Protection
- **Status:** ✅ Implementado
- **Middleware:** `csurf`
- **Configuração:** `server.js` (após sessão, antes das rotas)
- **Tokens CSRF adicionados em:**
  - `views/login.ejs` - Formulário de login
  - `views/register.ejs` - Formulário de registro
  - `views/editUsuario.ejs` - Formulário de edição
  - `views/formUsuario.ejs` - Formulário de criação
- **Formato do token:** `<input type="hidden" name="_csrf" value="<%= csrfToken %>">`

### 5. HTTP Hardening & Security Headers
- **Status:** ✅ Implementado
- **Middleware:** `helmet`
- **Headers de segurança aplicados:**
  - `Content-Security-Policy` - Política de segurança de conteúdo
  - `X-Frame-Options: SAMEORIGIN` - Proteção contra clickjacking
  - `X-Content-Type-Options: nosniff` - Previne MIME sniffing
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Referrer-Policy: no-referrer`
  - `X-XSS-Protection: 0` (substituído pelo CSP moderno)

### 6. Environment Variables & Secrets Protection
- **Status:** ✅ Implementado
- **Pacote:** `dotenv`
- **Variáveis protegidas:**
  - `SESSION_SECRET` - Chave secreta para sessões
  - `MONGODB_URI` - String de conexão do MongoDB
  - `PORT` - Porta do servidor
  - `NODE_ENV` - Ambiente de execução
- **Arquivo:** `.env` (adicionado ao `.gitignore`)

## Testes de Segurança Realizados

### ✅ Teste 1: Verificação de CSRF Tokens
- **Método:** Inspeção visual via DevTools
- **Resultado:** Todos os formulários POST contêm campo `_csrf` com token válido
- **Forms testados:** Login, Registro, Edição, Criação

### ✅ Teste 2: Rate Limiting Funcional
- **Método:** 6 tentativas de login consecutivas com credenciais inválidas
- **Resultado:** 
  - 1ª a 5ª tentativa: Processadas normalmente
  - 6ª tentativa: Bloqueada com mensagem de erro configurada
- **Tempo de bloqueio:** 15 minutos

### ✅ Teste 3: HTTP Security Headers
- **Método:** `Invoke-WebRequest -Method Head`
- **Comando:** `curl -I http://localhost:3000/login`
- **Resultado:** Todos os headers de segurança do Helmet presentes

### ✅ Teste 4: Authentication Middleware
- **Método:** Acesso direto a rota protegida (`/users`) sem login
- **Resultado:** Redirecionamento automático para `/login`
- **Middleware:** `middleware/auth.js`

### ✅ Teste 5: XSS Output Escaping
- **Método:** Análise de código fonte das views
- **Resultado:** Todas as views utilizam `<%= %>` para escape automático
- **Teste prático:** Inserção de tags HTML/JS renderizadas como texto

### Passos de Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/kgtierre/Projeto-Arquitetura-Web.git
cd Projeto-Arquitetura-Web

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
# Copie o arquivo de exemplo e ajuste os valores
cp .env.example .env

# 4. Edite o arquivo .env com suas configurações:
# SESSION_SECRET=sua_chave_secreta_muito_longa_e_aleatoria
# MONGODB_URI=mongodb://127.0.0.1:27017/arquiteturaWeb
# PORT=3000
# NODE_ENV=development

# 5. Certifique-se que o MongoDB está rodando
# Para MongoDB local:
mongod

# 6. Inicie a aplicação
npm start

# 7. Acesse no navegador
http://localhost:3000