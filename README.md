# PetTrack

O sistema operacional da saúde contínua do seu pet.

---

## Sobre o projeto

O PetTrack é uma plataforma mobile desenvolvida em React Native com Expo que transforma a relação entre tutor, pet e clínica veterinária. O objetivo é mudar o modelo episódico e reativo de cuidado animal para uma experiência contínua, preventiva e inteligente.

O ponto central da plataforma é o **Health Score**: um indicador dinâmico de 0 a 100 que acompanha a saúde do pet ao longo do tempo, atualizado com base em dados clínicos, comportamentais e histórico de vacinas e medicamentos.

---

## Funcionalidades

- Cadastro de pets com espécie, raça, idade e peso
- Health Score dinâmico por pet
- Alertas de vacinas, vermífugos e consultas
- Agenda de eventos clínicos
- Perfil do tutor com estatísticas
- Armazenamento local com AsyncStorage
- Navegação por abas e entre telas com Expo Router

---

## Tecnologias utilizadas

- React Native
- Expo SDK 55
- Expo Router
- TypeScript
- AsyncStorage (`@react-native-async-storage/async-storage`)
- Expo Vector Icons (`@expo/vector-icons`)
- React Navigation (Bottom Tabs)

---

## Estrutura do projeto

```
pettrack/
├── app/
│   ├── _layout.tsx               # Layout raiz com Stack
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar com 4 abas
│   │   ├── index.tsx             # Home - dashboard principal
│   │   ├── meus-pets.tsx         # Lista de pets cadastrados
│   │   ├── agenda.tsx            # Agenda de eventos
│   │   └── perfil.tsx            # Perfil do tutor
│   └── cadastro-pet/
│       └── index.tsx             # Formulário de cadastro de pet
├── assets/
│   ├── logo.png
│   └── logo2.png
├── constants/
│   └── Colors.ts                 # Paleta de cores do tema
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## Como rodar o projeto

### Pré-requisitos

- Node.js 20 ou superior
- Expo CLI instalado globalmente ou via `npx`
- Aplicativo Expo Go no celular (iOS ou Android)

### Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/pettrack.git
cd pettrack
npm install
```

Instale as dependências do Expo:

```bash
npx expo install @react-native-async-storage/async-storage @expo/vector-icons expo-router
```

### Executando

```bash
npx expo start
```

Escaneie o QR Code com o aplicativo Expo Go ou rode direto no emulador:

```bash
# Android
npx expo start --android

# iOS
npx expo start --ios
```

---

## Requisitos atendidos

| Requisito | Implementacao |
|---|---|
| Navegacao entre telas | Expo Router com Stack e Bottom Tabs (4 abas + tela de cadastro) |
| Prototipo visual completo | Tema dark, paleta laranja da marca, Health Score, cards e alertas |
| Formulario com manipulacao de estado | useState com validacao de campos obrigatorios e feedback de erros |
| Armazenamento local com AsyncStorage | Leitura e gravacao de pets e usuario em todas as telas |
| Demonstracao em video narrada | Gravacao realizada pela equipe |

---

## Arquitetura

O app segue o modelo de navegacao do Expo Router com file-based routing. Os dados sao persistidos localmente via AsyncStorage sem necessidade de backend. A paleta de cores e centralizada em `constants/Colors.ts` para consistencia visual em todo o projeto.

---

## Integrantes

Nome | RM
--- | ---
Thiago Rodrigues da Mota | 563650
Moisés Waidemann Molinillo Júnior | 563719
Gabriel Sbrana Campos | 565849
Richard Freitas | 566127

---

## Licenca

Este projeto foi desenvolvido para fins academicos na FIAP.
