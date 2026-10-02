# Tracking — Skills de Bolso

## IDs e arquitetura

- Página principal: `https://skillsdebolso.com.br/`
- Catálogo futuro: `https://skillsdebolso.com.br/packs/`
- GTM web container: `GTM-MFMP9Z2P` (conta `6379195381`, container `265348564`)
- GA4 web stream: `G-MN88MFE9CB` (propriedade `556145475`, fluxo `15854553749`)
- O site instala somente o GTM. A Google tag e os eventos GA4 pertencem ao container.
- `index.html` define Consent Mode antes do snippet GTM. `script.js` concentra os eventos e a escolha de analytics. Não criar outro default de consentimento no GTM.
- Todas as tags GA4 precisam de **Additional Consent Checks: Require additional consent for tag to fire → `analytics_storage`**. Isso impede hits GA4 antes da aceitação, inclusive pings sem cookie.

## Consentimento

O cookie próprio `sdb_analytics_consent` guarda `granted` ou `denied` por 180 dias, no caminho `/`. Sem escolha válida, o Consent Mode inicia com `analytics_storage=denied` e o aviso aparece. `ad_storage`, `ad_user_data` e `ad_personalization` permanecem `denied`. Aceitar ou rejeitar atualiza o consentimento e recarrega a página; no novo carregamento, o estado salvo é aplicado antes do GTM. “Configurar analytics”, no rodapé, permite mudar a escolha. A rejeição não bloqueia a navegação. Na revogação, o recarregamento impede novos disparos das tags GA4.

O aviso de privacidade fica na seção `#privacidade`. Contato: `skillsdebolso@gmail.com`. O GTM carrega mesmo sem consentimento; as tags GA4 devem respeitar a verificação adicional acima. Não adicionar tags de publicidade sem rever texto, opções e configurações de consentimento.

## Taxonomia do site

Nomes de eventos e parâmetros usam inglês, lowercase e `snake_case`. A fonte dos atributos de tracking são `data-track` e os demais atributos `data-*` nos links. URLs das redes continuam centralizadas em `script.js`.

| Evento | Disparo | Parâmetros |
| --- | --- | --- |
| `cta_click` | Clique em “Ver os packs” | `cta_name=view_packs`, `cta_location=main_links` |
| `section_view` | Seção `#packs` com pelo menos 50% visível pela primeira vez na página | `section_name=packs` |
| `social_click` | Clique em botão ou ícone de rede | `platform` (`instagram`, `tiktok`, `youtube`, `github`, `x`, `threads`, `facebook`), `link_url`, `link_location` (`main_links` ou `social_icons`) |

O link `#packs` não gera `page_view` manual. O Google tag envia `page_view` ao carregar a página. O Enhanced Measurement do GA4 deve capturar cliques externos como evento automático `click`, com `outbound=true`, `link_url` e `link_domain`. Não criar `outbound_click` nem cadastrar uma dimensão personalizada para `link_url`. Um clique social produzirá `social_click` **e** o evento automático `click`; são visões complementares da mesma interação. Para total de saídas, analisar apenas `click` filtrado por `outbound=true`.

## Configuração do GTM

O container novo foi inspecionado via API e estava vazio. As tags, triggers e variables abaixo foram criadas no `Default Workspace` (ID `2`). Antes de editar novamente, conferir o estado atual via API ou interface e reaproveitar recursos existentes.

| Tag | Tipo | Valor | Trigger | Consentimento adicional |
| --- | --- | --- | --- | --- |
| `GA4 - Google Tag` | Google tag | Tag ID `G-MN88MFE9CB` | `Initialization - All Pages - GA4` | `analytics_storage` |
| `GA4 - Event - CTA Click` | Google Analytics: GA4 Event | Measurement ID `G-MN88MFE9CB`, event name `cta_click`, parâmetros `cta_name`, `cta_location` | `CE - cta_click` | `analytics_storage` |
| `GA4 - Event - Section View` | Google Analytics: GA4 Event | Measurement ID `G-MN88MFE9CB`, event name `section_view`, parâmetro `section_name` | `CE - section_view` | `analytics_storage` |
| `GA4 - Event - Social Click` | Google Analytics: GA4 Event | Measurement ID `G-MN88MFE9CB`, event name `social_click`, parâmetros `platform`, `link_url`, `link_location` | `CE - social_click` | `analytics_storage` |

Cada trigger `CE - ...` é **Custom Event**, com nome exato igual ao evento, acionado em **All Custom Events**. Criar Data Layer Variables (Version 2) `DLV - cta_name`, `DLV - cta_location`, `DLV - section_name`, `DLV - platform`, `DLV - link_url` e `DLV - link_location`, cada uma com Data Layer Variable Name igual ao sufixo. Mapear cada parâmetro da tag à DLV correspondente. Não criar um trigger de clique baseado em texto/CSS.

No fluxo GA4, a API confirmou `streamEnabled=true` e `outboundClicksEnabled=true` em Enhanced Measurement. Conferir no Preview se mudanças de histórico não geram `page_view` extra ao clicar em `#packs`. Não configurar `debug_mode=true` globalmente.

## GA4

Custom dimensions de escopo **Event** criadas via GA4 Admin API: `platform`, `cta_name`, `cta_location`, `section_name`, `link_location`. O nome do parâmetro é exatamente o da tabela. `link_url` e `link_domain` já têm dimensões nativas para cliques de saída. As dimensões personalizadas podem demorar 24–48 horas para aparecer nos relatórios e não retroagem.

Nenhum evento atual é Key Event: visitar a seção ou clicar num link ainda não representa compra ou lead qualificado. Quando houver catálogo/checkout real, planejar `view_item`, `begin_checkout` e `purchase` com parâmetros de e-commerce verdadeiros e escolher Key Events a partir do objetivo de negócio. Não enviar PII, incluindo nomes, e-mails ou IDs pessoais, em eventos ou URLs.

## UTM para divulgação

Usar nos links **das redes para o site**, nunca nos links do site para as redes:

`https://skillsdebolso.com.br/packs/?utm_source=<plataforma>&utm_medium=social&utm_campaign=<slug_da_campanha>`

`utm_source`: `instagram`, `tiktok`, `youtube`, `facebook`, `threads` ou `x`. Usar sempre lowercase. `utm_campaign` é o mesmo slug para a mesma campanha em todas as redes. `utm_content` é opcional para distinguir uma peça ou posição, como `bio` e `story`. Não incluir dados pessoais nos valores de UTM.

## Teste antes de publicar o container

1. Abrir a URL de produção no GTM **Preview / Tag Assistant**. Testar sem cookie de escolha: consentimento negado, aviso visível e nenhuma tag/hit GA4.
2. Aceitar: página recarrega, Google tag dispara uma vez e `page_view` aparece uma vez no Tag Assistant e GA4 DebugView.
3. Clicar “Ver os packs”: um `cta_click` com `view_packs`/`main_links`; ao chegar à seção, um `section_view` com `packs`. Subir/descer sem duplicar `section_view`.
4. Clicar em rede na lista principal e em ícone: `social_click` com plataforma, URL exata e `link_location` correta; um `click` automático por saída, sem `outbound_click` manual.
5. Rejeitar/revogar: após recarregar, nenhuma tag/hit GA4. Verificar desktop, mobile, console, rede e ausência de overflow.
6. Publicar o container apenas depois que o Preview mostrar tags e parâmetros corretos. Repetir o teste na versão publicada e registrar o número da versão GTM.

Para adicionar novo evento: definir um nome semântico e parâmetros úteis; adicionar `data-track` ou um único `track()` em `script.js`; criar as DLVs/trigger/tag no GTM; testar consentimento, contagem e parâmetros no Preview e DebugView; atualizar esta tabela. Criar dimensão personalizada só se o parâmetro for necessário para análise recorrente.
