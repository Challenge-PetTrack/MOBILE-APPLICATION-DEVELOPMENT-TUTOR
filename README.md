<div align="center">
  <img src="https://img.icons8.com/fluent/120/000000/dog.png" alt="PetTrack Logo" width="100"/>
  <h1>🐾 PetTrack</h1>
  <p><strong>O ecossistema definitivo para a saúde contínua do seu pet.</strong></p>

  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
  [![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](#)
  [![Spring Boot API](https://img.shields.io/badge/Java_API-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](#)

  <p>
    <a href="#sobre-o-projeto">Sobre</a> •
    <a href="#sprint-3---entregáveis">Sprint 3</a> •
    <a href="#arquitetura">Arquitetura</a> •
    <a href="#como-rodar">Como Rodar</a> •
    <a href="#equipe">Equipe</a>
  </p>
</div>

---

## 📖 Sobre o projeto

O **PetTrack** não é apenas um aplicativo de agenda. É uma plataforma mobile completa de ponta a ponta desenvolvida em React Native (Expo) que revoluciona a conexão entre **Tutores** e **Clínicas Veterinárias**. 

Com um sistema de login inteligente que detecta o perfil do usuário, o aplicativo adapta completamente sua interface e ferramentas: oferecendo desde um "Diário do Pet" afetuoso para o tutor, até um robusto "Dashboard Financeiro e Clínico" para o veterinário.

---

## 🎯 Sprint 3 - Entregáveis

Esta versão do aplicativo marca a integração completa com a API Java (Backend), atendendo a todos os requisitos da Sprint 3:

* **Integração Real com API:** O app consome a API Spring Boot desenvolvida no repositório `JAVA-ADVANCED`.
* **Gerenciamento de Estado Server-Side:** Utilização rigorosa do `TanStack Query` (`@tanstack/react-query`) com `useQuery` e `useMutation` para cache, estados de loading, tratativa de erros e auto-refresh (sem re-renders desnecessários e sem useState manual).
* **2 Funcionalidades com CRUD Completo:**
  * **Pets:** Criação, Listagem, Edição e Exclusão de Pets integrados à API.
  * **Medicamentos:** Controle total de histórico médico.
  * *(Bônus)* **Consultas/Agenda Vet:** Gestão de agenda integrada.
* **Autenticação Real (JWT):** O fluxo de login e cadastro bate na API real e o token é gerenciado via `AuthContext` com interceptors do `axios`.
* **Proteção de Rotas Eficiente:** Bloqueio direto nos `_layout.tsx` do `expo-router` e bloqueio imediato pós-logout.

> **Vídeo de Demonstração (YouTube):** [Assistir no YouTube](https://youtu.be/m7xLWDiZS-o?si=J_YzZHFyeTqDLjfu)

---

## 🏗️ Arquitetura

A arquitetura foi dividida em 3 camadas principais (Service -> Hooks -> UI) garantindo total isolamento de regras de requisições.

```text
src/
├── app/
│   ├── _layout.tsx              # Providers: QueryClient, Auth, Theme
│   ├── index.tsx                # Dispatcher de Sessão
│   ├── (auth)/                  # 🔓 Telas deslogadas (Login API)
│   ├── (tutor)/                 # 🧑🦱 Telas protegidas do Tutor
│   │   └── _layout.tsx          # Guard de Rota
│   └── (vet)/                   # 🩺 Telas protegidas do Veterinário
│       └── _layout.tsx          # Guard de Rota
├── components/                  # 🧩 Componentes de UI (LoadingScreen, ErrorScreen)
├── config/                      # ⚙️ Instância do QueryClient
├── context/                     # 🧠 AuthContext (Token) e ThemeContext
├── hooks/                       # 🪝 Camada de Lógica (usePets, useMedicamentos)
└── service/                     # 🌐 Camada HTTP (Axios + JWT interceptors)
