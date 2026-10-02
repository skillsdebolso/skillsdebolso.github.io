# Consentimento e mensuração — diagnóstico de 2026-10-02

## O que acontece hoje

O site carrega o container `GTM-MFMP9Z2P` em todas as cinco páginas. Antes disso, define `analytics_storage=denied` para quem não aceitou analytics; também mantém `ad_storage`, `ad_user_data` e `ad_personalization` negados. O cookie próprio `sdb_analytics_consent` guarda a escolha por 180 dias. Aceitar ou rejeitar atualiza a escolha e recarrega a página.

A versão **2** publicada do GTM contém quatro tags GA4: uma Google tag e três tags de eventos. Todas têm a verificação adicional que exige `analytics_storage=granted`. Por isso, nenhuma delas dispara antes do aceite ou depois de uma rejeição. O JavaScript do site ainda pode enviar ações ao `dataLayer`, mas isso, por si só, não envia um evento ao GA4. Não foi encontrada tag de publicidade no container.

O workspace `medicao_pt_br` (ID `4`) é um rascunho separado e conserva a mesma exigência de consentimento. Sua publicação continua pendente dos testes de Preview e DebugView.

## O que é regra e o que é escolha

A LGPD não exige consentimento para absolutamente toda medição. A ANPD admite legítimo interesse para medição de audiência em certos contextos, sobretudo quando os dados são agregados, limitados a tendências e não combinados com perfis ou outros rastreamentos. Isso depende de avaliação e documentação específicas; não libera automaticamente o GA4 atual. Cookies estritamente necessários podem ter outra base legal. Publicidade e perfis comportamentais apresentam riscos maiores.

O bloqueio completo das tags GA4 antes do aceite é a escolha conservadora feita neste projeto. O Consent Mode avançado permitiria sinais sem cookies mesmo com `analytics_storage=denied`, mas esses sinais ainda seriam enviados ao Google. Não presumir que ausência de cookies equivale a ausência de dados pessoais ou a conformidade automática. A modelagem comportamental do GA4 depende de volume mínimo e não é garantida.

**Recomendação atual:** manter o bloqueio. Antes de considerar outro modelo, identificar os dados efetivamente enviados, definir finalidade e base legal, fazer a avaliação de legítimo interesse quando aplicável, ajustar o aviso e testar aceite, rejeição e revogação no Preview/DebugView. Não remover a verificação adicional apenas para elevar a contagem de eventos.

## Fontes

- [ANPD — Guia de cookies e proteção de dados pessoais](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file)
- [ANPD — Guia de legítimo interesse](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-lanca-guia-orientativo-sobre-legitimo-interesse)
- [Google — Verificações adicionais de consentimento no GTM](https://support.google.com/tagmanager/answer/10718549?hl=pt-BR)
- [Google — Consent Mode básico e avançado](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [Google — Critérios da modelagem comportamental no GA4](https://support.google.com/analytics/answer/11161109?hl=pt-BR)