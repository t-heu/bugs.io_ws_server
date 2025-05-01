# Servidor WebSocket para Jogo Multiplayer do BUGS.IO

Este é um servidor WebSocket em TypeScript para gerenciar a posição dos jogadores em um jogo multiplayer em tempo real. O servidor é responsável por receber as atualizações de posição dos jogadores e enviá-las para todos os outros jogadores na mesma sala.

## Funcionalidade

- O servidor aceita conexões WebSocket.
- Os jogadores podem "entrar" em uma sala e atualizar sua posição.
- O servidor retransmite as atualizações de posição para todos os outros jogadores na mesma sala.
- Quando um jogador se desconecta, ele é removido da sala e, se necessário, a sala é excluída.

## Pré-requisitos

Antes de rodar o servidor, você precisará dos seguintes itens:

- **Node.js** e **npm** instalados na sua máquina.
  - Você pode instalar o Node.js [aqui](https://nodejs.org/).

## Instalação

1. Clone o repositório ou baixe os arquivos do projeto.
2. Navegue até a pasta do projeto no terminal.
3. Instale as dependências do projeto:

```bash
npm install
```