# Manifest Agent Update: Fallback & Claude Code Hanging

## 1. O Fallback e o Erro 429 no Playground
A mensagem `"Provider returned 429: ..."` que você enviou é gerada pelo **Playground** do Manifest. 
O Playground é uma ferramenta projetada para testar uma conexão de provedor *específica* e direta. Por causa disso, ele **ignora intencionalmente o roteador** (e suas regras de fallback). O objetivo do Playground é dizer se a configuração daquele provedor específico está funcionando ou falhando. 

Se você quiser testar o comportamento de fallback (que muda automaticamente de um modelo/provedor para outro em caso de falha), você deve fazer a requisição através do endpoint de **Proxy** (usando o Claude Code, cURL, ou outra aplicação que aponte para o endpoint principal do Manifest). O Proxy irá interceptar o 429 e executar o fallback corretamente.

## 2. Claude Code Travando (Harness Hanging)
Investiguei o motivo de o Claude Code "travar" ao usar os provedores customizados que você configurou (como o `custom-deepseek`).

**A Causa:** 
Quando o modelo decide usar uma ferramenta (tool call), a API oficial da Anthropic exige que a resposta termine com um evento indicando `stop_reason: "tool_use"`. 
No entanto, alguns provedores customizados ou proxies compatíveis com OpenAI não enviam o motivo de parada correto (eles enviam `finish_reason: "stop"` ou omitem o motivo). Quando o Manifest convertia esse evento para o formato da Anthropic, ele gerava um `stop_reason: "end_turn"`.
Ao receber `"end_turn"` logo após declarar uma ferramenta, o Claude Code achava que o modelo tinha "desistido" da ferramenta ou terminado de falar, e ficava aguardando entrada do usuário no terminal (pendurado, sem avançar).

**A Solução:**
Modifiquei o adaptador de streaming da Anthropic (`anthropic-messages-adapter.ts`) para ser mais resiliente. Agora, o Manifest verifica ativamente se o modelo tentou chamar alguma ferramenta durante o stream. Se ferramentas foram chamadas, o Manifest **força** o `stop_reason` a ser `"tool_use"`, independentemente do que o provedor customizado enviou. 

Isso garante que o Claude Code sempre receba o sinal correto e avance para a execução da ferramenta automaticamente.

### Arquivos Modificados
- [`packages/backend/src/routing/proxy/anthropic-messages-adapter.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/anthropic-messages-adapter.ts) (Atualizado a lógica de fechamento do stream `closeStream`).
