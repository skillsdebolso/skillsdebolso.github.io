# Tracking — Skills de Bolso

## Estado e arquitetura

- Site: `https://skillsdebolso.com.br/`; os caminhos antigos devem levar ao domínio novo.
- GTM: container `GTM-MFMP9Z2P` (conta `6379195381`, container `265348564`). Versão publicada: **2**. Rascunho em `medicao_pt_br` (workspace `4`), aguardando testes e publicação.
- GA4: propriedade `556145475`, fluxo web `15854553749`, ID `G-MN88MFE9CB`, fuso `America/Sao_Paulo`, moeda `BRL`.
- Caminho: ação no site → `dataLayer` → gatilho GTM → tag GTM → GA4. O site instala apenas o GTM. A tag principal do GA4 fica no GTM.
- Nomes próprios: pt-BR, minúsculas, sem acentos e `snake_case`. Tags, gatilhos e variáveis começam com `tag_`, `gatilho_` e `variavel_`. Nomes técnicos do Google (`event`, `analytics_storage`, `page_view`, `scroll`, `click`) não são traduzidos.

## Consentimento

`index.html` e as páginas internas definem o Consent Mode **antes** do GTM. O cookie `sdb_analytics_consent` guarda `granted` ou `denied` por 180 dias. Sem aceitação, `analytics_storage` começa em `denied`; os tipos de consentimento para anúncios também permanecem negados. A escolha recarrega a página. “Configurar analytics” permite alterá-la.

Todas as quatro tags GA4 do GTM exigem a verificação adicional `analytics_storage`. Não adicionar outro default de consentimento no GTM. No Preview, confirmar que não há requisições GA4 sem aceitação e que a revogação cessa novos envios após recarregar.

## Mapa oficial dos eventos

| Evento | Finalidade e momento | Origem e parâmetros | Tag / gatilho | Onde consultar | Principal? | Responsável pelo dado | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `page_view` (Google) | Visita a cada página | GA4; parâmetros nativos | `tag_ga4_base` / `gatilho_todas_paginas` | GA4 > Eventos e Páginas | Não | Google tag | Produção v2; nome da tag novo no rascunho |
| `scroll` (Google) | Indicação simples de leitura | Medição automática do GA4 | Sem tag própria | GA4 > Eventos | Não | GA4 | Ativo; conferir no teste |
| `clique_ver_packs` | Clique em “Ver os packs” | `script.js` envia `{event}` | `tag_clique_ver_packs` / `gatilho_clique_ver_packs` | GA4 > Eventos | Não | Site | Código local + GTM rascunho |
| `visualizacao_secao` | Metade de `#packs` visível uma vez por carregamento | `script.js`: `secao=produtos` | `tag_visualizacao_secao` / `gatilho_visualizacao_secao` | GA4 > Eventos; dimensão `secao` | Não | Site | Código local + GTM rascunho |
| `click` (Google) | Clique em link externo | Medição automática; `outbound`, `link_url` etc. | Sem tag própria | GA4 > Eventos | Não | GA4 | Ativo; conferir no teste |
| `clique_rede_social` | Comparar redes e posições dos links | `script.js`: `rede_social`, `posicao` | `tag_clique_rede_social` / `gatilho_clique_rede_social` | GA4 > Eventos; dimensões `rede_social` e `posicao` | Não | Site | Código local + GTM rascunho |

`click` e `clique_rede_social` podem descrever a mesma saída. Para o total de saídas, analisar apenas `click` com `outbound=true`; não somar os dois. O salto para `#packs` não recebe `page_view` manual.

## Dados enviados pelo site

| Chave | Tipo | Quando e valores |
| --- | --- | --- |
| `event` | Texto | Nome da ação em cada `dataLayer.push`; chave técnica exigida pelo GTM |
| `secao` | Texto | `visualizacao_secao`: `produtos` |
| `rede_social` | Texto | `clique_rede_social`: `instagram`, `tiktok`, `youtube`, `github`, `x`, `threads` ou `facebook` |
| `posicao` | Texto | `clique_rede_social`: `lista_principal` ou `icones_sociais` |

As três variáveis GTM de camada de dados usam versão 2: `variavel_secao`, `variavel_rede_social` e `variavel_posicao`. Os três gatilhos de evento personalizado comparam `{{_event}}` ao nome exato do evento. A tag principal usa o gatilho de inicialização em todas as páginas. Não criar gatilhos de clique por texto ou CSS.

## Configuração do GA4

As dimensões personalizadas de escopo **Evento** `secao`, `rede_social` e `posicao` foram criadas pela API. As cinco dimensões antigas (`section_name`, `link_location`, `cta_name`, `platform`, `cta_location`) permanecem para consulta histórica. Seus nomes técnicos não podem ser alterados. A aparição das dimensões novas nos relatórios pode levar até 48 horas e não é retroativa.

Manter a medição automática, sem tags extras de aquisição. Campanhas usam UTMs nos **links de divulgação que chegam ao site**, por exemplo `https://skillsdebolso.com.br/?utm_source=instagram&utm_medium=social&utm_campaign=nome_campanha`. Não usar UTM em links que saem do site. Não enviar nomes, e-mails ou outros dados pessoais nos eventos, parâmetros ou UTMs.

Não marcar os eventos atuais como principais. `purchase`, `qualify_lead` e `close_convert_lead` já existem no GA4 como eventos principais criados pelo sistema, mas não representam funções atuais do site e não receberam eventos nos dados auditados. Só configurar leads, checkout, vendas ou receita quando essas funções e seus dados reais existirem. Nesse momento, avaliar os nomes oficiais do Google `generate_lead`, `view_item`, `begin_checkout` e `purchase`.

## Testes antes de publicar

1. Usar a prévia da branch `migracao-cloudflare-pages` e o Preview do workspace GTM `medicao_pt_br` (ID `4`). O site de produção ainda carrega a versão 2.
2. Sem aceitar analytics: nenhuma tag GA4 e nenhuma requisição GA4. Depois de aceitar: uma tag principal e um `page_view` por carregamento, inclusive nas páginas internas.
3. Clicar “Ver os packs”: um `clique_ver_packs`, sem `page_view` extra. Ao mostrar metade da seção, um `visualizacao_secao` com `secao=produtos`. Subir e descer não deve repetir o evento.
4. Clicar em uma rede na lista e em um ícone: um `clique_rede_social` por clique, com `rede_social` e `posicao` corretos. Conferir `click` automático separadamente.
5. No Preview, conferir `dataLayer`, gatilhos, variáveis e tags. No DebugView, conferir eventos e parâmetros recebidos. Após rejeitar ou revogar analytics e recarregar, não deve haver novos envios GA4.
6. Testar desktop e celular. Depois dos testes, publicar o código e uma versão GTM nomeada. Repetir o essencial em produção e registrar aqui o número da versão.

Para um novo evento, primeiro definir sua utilidade e a origem dos dados. Depois alterar `script.js`/`dataLayer`, ajustar o GTM, testar e atualizar este mapa. Só criar nova dimensão se o parâmetro for útil em relatórios recorrentes.

## Registro da publicação

- Código de produção: **pendente**.
- Versão GTM: **2 em produção; nova versão pendente**.
- Teste de Preview e DebugView: **pendente**.
- Conferência por API dos eventos no domínio novo: **pendente**.