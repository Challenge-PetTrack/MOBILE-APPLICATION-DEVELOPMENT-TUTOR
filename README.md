<div align="center">
  <img src="https://img.icons8.com/fluent/120/000000/dog.png" alt="PetTrack Logo" width="100"/>
  <h1>🐾 PetTrack</h1>
  <p><strong>O ecossistema definitivo para a saúde contínua do seu pet.</strong></p>

  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
  [![Lottie](https://img.shields.io/badge/Lottie-0FDF8F?style=for-the-badge&logo=lottiefiles&logoColor=white)](#)

  <p>
    <a href="#sobre-o-projeto">Sobre</a> •
    <a href="#funcionalidades">Funcionalidades</a> •
    <a href="#arquitetura-e-estrutura">Arquitetura</a> •
    <a href="#como-rodar">Como Rodar</a> •
    <a href="#equipe">Equipe</a>
  </p>
</div>

---

## 📖 Sobre o projeto

O **PetTrack** não é apenas um aplicativo de agenda. É uma plataforma mobile completa de ponta a ponta desenvolvida em React Native (Expo) que revoluciona a conexão entre **Tutores** e **Clínicas Veterinárias**. 

Com um sistema de login inteligente que detecta o perfil do usuário, o aplicativo adapta completamente sua interface e ferramentas: oferecendo desde um "Diário do Pet" afetuoso para o tutor, até um robusto "Dashboard Financeiro e Clínico" para o veterinário.

---

## ✨ Funcionalidades "Cabulosas"

O aplicativo foi desenhado com foco em **UI/UX Premium**, contendo micro-animações, suporte completo a **Dark Mode** e fluxos independentes.

### 🧑‍🦱 Para o Tutor (O Dono do Pet)
* 📊 **Health Score Dinâmico**: Uma pontuação de 0 a 100 que resume o estado geral do pet com base em vacinas, peso e histórico.
* 📸 **Carteira de Identidade (RG do Pet)**: Gere e compartilhe o RG do seu pet em PDF direto pelo WhatsApp!
* 🏥 **Gestão de Saúde**: Controle completo de carteira de vacinação, medicamentos e histórico de consultas.
* 💸 **Dashboard Financeiro**: Controle os gastos com alimentação, brinquedos e veterinário, gerando gráficos visuais.
* 🗓️ **Agendamento Prático**: Marque consultas com clínicas parceiras em apenas 3 cliques.

### 🩺 Para o Veterinário (O Profissional)
* 📈 **Visão Geral e Faturamento**: Um dashboard financeiro automático que calcula o lucro mensal baseado nas consultas concluídas.
* 📝 **Prontuário com Anexos**: Adicione fotos (raio-x, exames de sangue) diretamente pelo celular na ficha do paciente.
* 🖨️ **Receituário em PDF**: Escreva a prescrição no app e clique em "Gerar PDF" para enviar o receituário oficial carimbado direto para o WhatsApp do cliente.
* 📞 **CRM Integrado**: Lista completa de clientes (tutores) cadastrados com atalho de discagem rápida.

### 🎨 Experiência de Uso
* 🎢 **Onboarding Interativo**: Carrossel explicativo animado (via Lottie Animations) para novos usuários.
* 🌗 **Theme Engine**: Sistema de mudança entre modo claro e escuro em tempo real.

---

## 🏗️ Arquitetura e Estrutura

O aplicativo foi recentemente refatorado para suportar escala de nível empresarial. O roteamento foi construído sob o **Expo Router v3**, utilizando a organização em grupos (Groups) para separar os domínios da aplicação, além de uma camada dedicada de Serviços.

```text
pettrack/
├── src/
│   ├── app/
│   │   ├── _layout.tsx           # Provedor de Temas e Root Navigation
│   │   ├── index.tsx             # Dispatcher Central de Sessão
│   │   ├── (auth)/               # 🔒 Mundo Deslogado (Login, Onboarding)
│   │   ├── (tutor)/              # 🧑‍🦱 Mundo do Tutor (Dashboard, Pets, Financeiro)
│   │   └── (vet)/                # 🩺 Mundo do Veterinário (Consultas, PDFs, Agenda)
│   ├── components/               # 🧩 Componentes Visuais Reutilizáveis (Ex: ActionCard)
│   ├── context/                  # 🧠 Gerenciamento de Estado Global (ThemeContext)
│   └── service/                  # 💾 Camada de Acesso a Dados (storage.ts)
├── assets/                       # Ícones e Fontes
└── refactor.js                   # Script de manutenção estrutural
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
Certifique-se de ter o **Node.js (v20+)** e o **Aplicativo Expo Go** instalado no seu smartphone.

### Instalação
1. Clone este repositório mágico:
   ```bash
   git clone https://github.com/Challenge-PetTrack/MOBILE-APPLICATION-DEVELOPMENT-TUTOR.git
   cd MOBILE-APPLICATION-DEVELOPMENT-TUTOR
   ```
2. Instale as dependências com NPM ou Yarn:
   ```bash
   npm install
   ```

### Levantando voo 🦅
Inicie o servidor Metro Bundler com o cache limpo para evitar problemas de roteamento:
```bash
npx expo start -c
```
Após o servidor rodar, leia o **QR Code** com a câmera do seu iPhone (ou app Expo Go no Android) ou pressione `a` para abrir no emulador Android local.

---

## 🎓 Equipe (A Mente por trás da Magia)

Este projeto foi desenvolvido com paixão e litros de café para a avaliação da **FIAP**.

| Nome | RM |
| :--- | :--- |
| **Gabriel Sbrana Campos** | RM 565849 |
| **Moisés Waidemann Molinillo Júnior** | RM 563719 |
| **Richard Freitas** | RM 566127 |
| **Thiago Rodrigues da Mota** | RM 563650 |

<br/>
<div align="center">
  <sub>Feito com ❤️ para mudar a vida dos pets.</sub>
</div>
