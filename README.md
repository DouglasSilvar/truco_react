
# Truco React App

Este projeto é uma aplicação React que consome uma API Ruby on Rails para gerenciar salas, jogadores e partidas de truco.

## Índice

- [Descrição](#descrição)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Endpoints Consumidos](#endpoints-consumidos)
  - [Jogadores](#jogadores)
  - [Salas](#salas)
  - [Jogos](#jogos)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Capturas de Tela](#capturas-de-tela)

---

## Descrição

O Truco React App é uma interface amigável para interagir com a API de Truco, permitindo a criação de salas, a entrada e saída de jogadores, a organização de partidas e a jogabilidade em tempo real. 

---

## Pré-requisitos

- Node.js 14+ e npm 6+
- Um servidor backend Ruby on Rails em execução ([Truco API](#)).

---

## Instalação e Execução

1. Clone o repositório do projeto:
   ```sh
   git clone https://github.com/seu-usuario/truco-react-app.git
   ```
2. Entre no diretório do projeto:
   ```sh
   cd truco-react-app
   ```
3. Instale as dependências:
   ```sh
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```sh
   npm start
   ```
5. Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## Estrutura do Projeto

A estrutura do projeto é baseada na arquitetura padrão do Create React App, com os seguintes diretórios principais:

- `src/components`: Componentes React reutilizáveis.
- `src/pages`: Páginas principais do aplicativo (e.g., Home, Sala, Jogo).
- `src/services`: Serviços para chamadas à API.
- `src/styles`: Arquivos CSS e temas personalizados.

---

## Endpoints Consumidos

### Jogadores

- **Listar Jogadores:** `GET /players`
- **Criar Jogador:** `POST /players`
- **Validar Jogador:** `GET /players/valid`

### Salas

- **Listar Salas:** `GET /rooms`
- **Criar Sala:** `POST /rooms`
- **Entrar em uma Sala:** `POST /rooms/:uuid/join`
- **Sair de uma Sala:** `POST /rooms/:uuid/leave`
- **Alterar Cadeira:** `POST /rooms/:uuid/changechair`
- **Expulsar Jogador:** `POST /rooms/:uuid/kick`
- **Alterar Status de Pronto:** `POST /rooms/:uuid/ready/:boolean`
- **Iniciar Partida:** `POST /rooms/:uuid/start`

### Jogos

- **Exibir Jogo:** `GET /games/:uuid`
- **Fazer Jogada:** `POST /games/:uuid/play_move`
- **Realizar Chamada:** `POST /games/:uuid/call`
- **Coletar Cartas:** `POST /games/:uuid/collect`

---

## Funcionalidades Principais

1. **Home Page:**
   - Listagem de salas disponíveis com paginação.
   - Criação de uma nova sala.

2. **Sala:**
   - Exibe os jogadores e suas cadeiras.
   - Permite que jogadores entrem, saiam, mudem de cadeira ou alterem o status de pronto.
   - Exibe informações do dono da sala e os times.

3. **Jogo:**
   - Exibe o estado atual da partida, incluindo as cartas jogadas e os placares.
   - Permite aos jogadores realizar jogadas ou chamadas.

---

## Capturas de Tela

### Página Inicial
(Adicione aqui a imagem da página inicial)

### Tela de Sala
(Adicione aqui a imagem da tela de sala)

### Tela de Jogo
(Adicione aqui a imagem da tela de jogo)

---

## Scripts Disponíveis

O projeto inclui os seguintes scripts padrão do Create React App:

- `npm start`: Executa o servidor de desenvolvimento.
- `npm test`: Executa os testes em modo interativo.
- `npm run build`: Cria o build otimizado para produção.
- `npm run eject`: Remove as dependências internas para maior customização.

---

## Contribuição

Se você quiser contribuir com o projeto, sinta-se à vontade para abrir issues ou enviar pull requests.

