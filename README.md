<div align="center">
  <h1>🐾 PetTrack</h1>
  <p><strong>Plataforma mobile completa que conecta Tutores de Pets e Clínicas Veterinárias em tempo real.</strong></p>

  [![React Native](https://img.shields.io/badge/React_Native-0.86-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Expo](https://img.shields.io/badge/Expo_SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
  [![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](#)
  [![Firebase](https://img.shields.io/badge/Firebase_Auth_%26_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](#)

  <p>
    <a href="#-sobre-o-projeto">Sobre</a> •
    <a href="#-sprint-4--entregáveis">Sprint 4</a> •
    <a href="#️-arquitetura-e-organização">Arquitetura</a> •
    <a href="#-notificações-reais">Notificações</a> •
    <a href="#-publicação-firebase-app-distribution">Publicação</a> •
    <a href="#-como-executar">Como Executar</a> •
    <a href="#-equipe">Equipe</a>
  </p>
</div>

---

## 📖 Sobre o Projeto

O **PetTrack** é uma aplicação mobile multiplataforma desenvolvida em **React Native (Expo Router + TypeScript)** voltada à gestão contínua da saúde de animais de estimação e ao atendimento clínico veterinário.

A partir de uma autenticação unificada no **Firebase Authentication** com perfis distintos sincronizados no **Cloud Firestore**, o aplicativo entrega duas experiências integradas ponta a ponta:

* **Área do Tutor:** cadastro e edição de pets com foto comprimida, carteira digital de vacinação, controle de tratamentos medicamentosos e cuidados preventivos, agendamento e acompanhamento de consultas com acesso ao prontuário e download de receituário em PDF, diário ilustrado do pet, emissão do RG do Pet em PDF, Score diário de bem-estar, gestão financeira por categorias, FAQ, SAC com abertura real de chamados e suporte via WhatsApp.
* **Área do Veterinário:** painel clínico com busca instantânea de pacientes, métricas mensais reais de atendimentos e faturamento, agenda clínica multi-dias em tempo real, registro de prontuários com diagnóstico, prescrição, anexos de exames e emissão de receituário veterinário em PDF, diretório de tutores com contato direto via WhatsApp e configuração dos dados da clínica.

Todas as telas contam com suporte completo a **Modo Claro e Modo Escuro** persistido localmente.

---

## 🚀 Sprint 4 — Entregáveis

1. **Funcionalidade Real de Todas as Telas:** 100% das telas possuem persistência real em nuvem (**Cloud Firestore — projeto `pettrack-20299`**), estados de carregamento, tratamento de erros, estados vazios e fluxo contínuo entre Tutor e Veterinário sem dados fictícios ou telas estáticas.
2. **Publicação no Firebase App Distribution:** pacote Android `com.pettrack.app` publicado no **Firebase App Distribution** com correspondência exata ao código-fonte do repositório.
3. **Tela "Sobre o App" (`/sobre`):** acessível pelos menus e ajustes de ambos os perfis (e na tela de login), exibindo versão, build, canal de distribuição, projeto Firebase e o **hash SHA-1 exato do commit Git** injetado automaticamente em tempo de build via `app.config.js`.
4. **Notificações Reais (`expo-notifications`):** lembretes agendados por eventos reais do usuário e alertas reativos disparados por atualizações em tempo real no Firestore, conduzindo o usuário diretamente à tela e ao registro correspondente ao tocar na notificação.
5. **Arquitetura Limpa em Camadas:** separação rigorosa entre **UI (`app/` e `components/`)**, **Lógica e Cache Server-State (`hooks/` com TanStack Query)** e **Acesso a Dados / Serviços Nativos (`services/`)**.

> **Vídeo de Demonstração (Sprint 3):** [Assistir no YouTube](https://youtu.be/m7xLWDiZS-o?si=J_YzZHFyeTqDLjfu)
>
> **Vídeo de Apresentação Final (Sprint 4):** *(inserir link do vídeo da Sprint 4)*

---

## 🏗️ Arquitetura e Organização

Nenhum componente de tela realiza chamadas diretas ao Firestore, `AsyncStorage`, `expo-notifications`, `expo-print`, `expo-image-picker` ou hooks brutos do `@tanstack/react-query`. Toda regra de negócio e acesso externo reside nas camadas dedicadas:

```text
src/
├── app/                         # Camada de Apresentação e Rotas (Expo Router)
│   ├── _layout.tsx              # Providers globais (QueryClient, Theme, Auth e NotificationObserver)
│   ├── index.tsx                # Dispatcher inicial de sessão e onboarding
│   ├── sobre.tsx                # Tela "Sobre o App" (versão + hash exato do commit Git)
│   ├── auth/                    # Fluxo público: Onboarding, Login e Cadastro de Usuário
│   ├── tutor/                   # Fluxo protegido do Tutor (13 telas funcionais)
│   └── vet/                     # Fluxo protegido do Veterinário (8 telas funcionais)
├── components/                  # Componentes visuais reutilizáveis (Header, PetCard, PetForm,
│                                # PetSelectorBar, ScoreGauge, VacinaItem, FaqListScreen, SacSupportScreen...)
├── constants/                   # Catálogos de domínio (vacinas, preventivos, gastos, rotina, FAQ)
├── config/                      # Inicialização do Firebase (Auth + Firestore) e QueryClient
├── context/                     # Contextos globais de Autenticação e Tema (Claro/Escuro)
├── hooks/                       # Camada de Negócio e isolamento do TanStack Query
│                                # (usePets, useVacinas, useMedicamentos, useConsultas, useClinica,
│                                #  useGastos, useRotina, useDiario, useChamados, useNotifications...)
├── services/                    # Camada de Acesso a Dados e Integrações Nativas
│   ├── documents/               # Geração e compartilhamento de PDFs (RG do Pet e Receituário)
│   ├── firestore.ts             # Referências tipadas e utilitários do Cloud Firestore
│   ├── *Service.ts              # Repositórios por entidade (user, pet, consulta, medicamento, vacina...)
│   ├── notificationService.ts   # Agendamento, canais Android e disparo de notificações locais
│   ├── imageService.ts          # Captura e compressão de imagens em base64
│   ├── externalLinkService.ts   # Integração externa com WhatsApp
│   ├── preferencesStorage.ts    # Preferências locais do dispositivo (tema, onboarding, notificações)
│   └── appInfoService.ts        # Leitura de versão nativa e hash do commit Git
├── types/                       # Interfaces e modelos TypeScript de domínio
└── utils/                       # Formatadores puros de datas, moeda e validações
```

---

## 🔔 Notificações Reais

O sistema implementa **notificações locais reais (`expo-notifications`)** integradas a eventos legítimos de domínio:

| Evento Real Gerador | Notificação Disparada | Ação ao Tocar na Notificação |
| :--- | :--- | :--- |
| Tutor cadastra um **Medicamento** com horário e frequência (`6h`, `8h`, `12h`, `24h`) | Lembretes diários automáticos nos horários exatos de cada dose | Abre `/tutor/medicamentos` no pet e destaca o medicamento para registrar a dose |
| Tutor solicita **Agendamento de Consulta** | Alerta em tempo real no aparelho do Veterinário + lembrete prévio de 1h para o Tutor | Abre `/vet/agenda` diretamente no dia e no modal de prontuário da consulta solicitada |
| Veterinário **confirma, conclui ou cancela** a consulta no prontuário | Alerta em tempo real para o Tutor informando confirmação ou liberação do receituário | Abre `/tutor/agendar-consulta` na aba *Minhas Consultas* destacando o prontuário e o PDF |
| Tutor registra aplicação de **Vacina** ou **Cuidado Preventivo** | Lembrete agendado para a data de reforço / próxima aplicação | Abre `/tutor/vacinas` ou `/tutor/medicamentos` no pet correspondente |

O usuário pode ativar ou desativar as notificações a qualquer momento na tela de **Ajustes**, que cancela ou reagenda automaticamente os lembretes ativos.

---

## 📦 Publicação (Firebase App Distribution)

O arquivo `app.config.js` captura automaticamente o hash do commit (`git rev-parse HEAD`) no momento do bundle, garantindo que o APK distribuído exiba na tela **Sobre o App** exatamente o mesmo commit entregue no GitHub:

```bash
# 1. Garantir que a árvore Git esteja limpa no commit final de entrega
git status

# 2. Gerar projeto Android nativo e compilar APK de release
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease && cd ..

# 3. Publicar no Firebase App Distribution e liberar acesso ao professor (tester)
firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
  --app <FIREBASE_ANDROID_APP_ID> \
  --testers "<EMAIL_INSTITUCIONAL_DO_PROFESSOR>" \
  --release-notes "Sprint 4 - Release oficial ($(git rev-parse --short HEAD))"
```

Para publicar as regras de segurança do Cloud Firestore (`firestore.rules`):

```bash
firebase deploy --only firestore:rules --project pettrack-20299
```

---

## 💻 Como Executar Localmente

### Pré-requisitos
* **Node.js** 20+
* Dispositivo Android/iOS (Development Build / APK) ou **Android Studio Emulator**

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/Challenge-PetTrack/MOBILE-APPLICATION-DEVELOPMENT-TUTOR.git
cd MOBILE-APPLICATION-DEVELOPMENT-TUTOR

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npx expo start -c
```

---

## 👨‍💻 Equipe

Projeto acadêmico desenvolvido para o curso de **Análise e Desenvolvimento de Sistemas — FIAP (2TDS)**.

| Integrante | RM |
| :--- | :--- |
| **Gabriel Sbrana Campos** | RM 565849 |
| **Moisés Waidemann Molinillo Júnior** | RM 563719 |
| **Richard Freitas** | RM 566127 |
| **Thiago Rodrigues da Mota** | RM 563650 |
