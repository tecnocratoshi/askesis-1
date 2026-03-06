# Relatório de Maturidade por Arquivo (sem testes)

## Resumo Executivo

- O workspace mostra boa maturidade geral, com forte base de segurança no backend (`api/`) e boa cobertura de erros em serviços críticos.
- Pontos fortes: rate limit robusto, validações de payload, fallback seguro, uso consistente de Web Crypto e retries de rede.
- Principal dívida técnica está na camada de UI render/listeners, com uso intenso de `innerHTML` e arquivos muito grandes/acoplados.
- A modularização de `services/habitActions/*`, `services/dataMerge/*` e `listeners/modals/*` reduziu acoplamento em pontos críticos.
- Tipagem: `services/cloud.ts`, `services/sync.worker.ts`, `services/selectors.ts`, `services/migration.ts`, `data/predefinedHabits.ts`, `index.tsx` e `state.ts` zerados de `any`.
- `render/modals.ts` endurecido com `sanitizeHtmlToFragment()` — XSS via modal eliminado; `openEditModal` tipado como `Habit | HabitTemplate | null` (zero `any`); 13 `.textContent =` migrados para `setTextContent()` (API consistente).
- `services/crypto.ts` com 5 guards de validação de entrada em `decrypt()`.
- `services/analysis.ts` e `listeners/swipe.ts` com `catch` tipados como `unknown`; `listeners/swipe.ts` não possui mais `any` residuais.
- `render/calendar.ts`: 3 `.textContent =` em `renderFullCalendar` migrados para `setTextContent()`; `firstElementChild!` substituído por encadeamento opcional seguro.
- `scripts/dev-api-mock.js`: `KEY_HASH_RE` para validação de formato do header, `lastModified` validado como `number`, mensagem genérica em respostas 500.
- `sw.js`: `Promise.all` → `Promise.allSettled` no install — asset indisponível não aborta mais toda a instalação do SW.
- `types/global.d.ts` com `showFatalError` e `CSSTranslate` declarados na `interface Window`.
- `state.ts` com interface `DaySummary` exportada; `originalData` tipado como `Habit`.
- `render/calendar.ts`, `listeners/sync.ts` e `render/chart.ts` sem `innerHTML`; zero `any` confirmado.
- `listeners/cards.ts` sem `innerHTML`; usa `replaceChildren` e `cloneNode` (padrão seguro).
- `render/rotary.ts` e `render/chart.ts` sem `(window as any).CSSTranslate` — declarado em `global.d.ts`.
- `listeners/chart.ts` e `render/habits.ts` auditados: zero `any`, zero `innerHTML`.
- `render.ts` zerado de `any`: `Document.startViewTransition`, `scheduler`, `OneSignal` e `Notification.permission` declarados.
- `listeners/calendar.ts` e `services/badge.ts` auditados: zero `any`, zero `innerHTML`.
- Performance está razoável: existem caches, debounce e agendamento; hot paths de DOM usam `setTrustedSvgContent` e `sanitizeHtmlToFragment`.
- Priorização recomendada: simplificar drag e swipe, consolidar helpers duplicados.

## Escala

- **L5 Excelente**: 86-100
- **L4 Maduro**: 76-85
- **L3 Sólido**: 66-75
- **L2 Em evolução**: 51-65
- **L1 Frágil**: 0-50

## Ponderação por arquivo

| Arquivo | Score | Nível | Justificativa |
| --- | ---: | --- | --- |
| api/_httpSecurity.ts | 89 | L5 Excelente | Rate limit híbrido, validação de origem/IP e fallback resiliente. |
| api/analyze.ts | 86 | L5 Excelente | Timeout, limites, CORS estrito e sanitização de erro bem tratados. |
| api/sync.ts | 85 | L4 Maduro | Validações fortes e concorrência otimista; fluxo Lua é complexo. |
| build.js | 78 | L4 Maduro | Script robusto; copia o app shell sem transformação por regex e valida presença do bundle. |
| constants.ts | 84 | L4 Maduro | Constantes centralizadas, sem lógica arriscada e boa legibilidade. |
| i18n.ts | 82 | L4 Maduro | Fallbacks, cache Intl e timeout; módulo extenso. |
| index.css | 72 | L3 Sólido | Estilo pequeno e direto; baixo risco estrutural. |
| index.html | 70 | L3 Sólido | Estrutura simples; pouca lógica e risco moderado. |
| index.tsx | 76 | L4 Maduro | Boot resiliente; `(window as any)` eliminado via declaração em `global.d.ts`. |
| listeners.ts | 77 | L4 Maduro | Orquestração clara de eventos com debounce e proteções. |
| manifest.json | 78 | L4 Maduro | Configuração PWA direta e estável. |
| metadata.json | 68 | L3 Sólido | Metadado simples, sem validação formal de schema. |
| package-lock.json | 60 | L2 Em evolução | Arquivo gerado e volumoso, difícil auditoria manual. |
| package.json | 80 | L4 Maduro | Configuração de projeto consistente e scripts claros. |
| render.ts | 78 | L4 Maduro | Zero `any`; `Document.startViewTransition`, `scheduler`, `OneSignal` declarados em `global.d.ts`. |
| state.ts | 82 | L4 Maduro | `DaySummary` interface exportada; `originalData` tipado como `Habit`; zero `any` no schema público. |
| sw.js | 78 | L4 Maduro | `Promise.allSettled` no install — asset indisponível não aborta instalação; Workbox + fallback manual sólido. |
| tsconfig.json | 83 | L4 Maduro | Configuração TypeScript estável e adequada ao projeto. |
| utils.ts | 76 | L4 Maduro | Utilitários robustos, sanitização e helpers performáticos. |
| vercel.json | 76 | L4 Maduro | Deploy config enxuta e sem riscos aparentes. |
| vitest.config.ts | 77 | L4 Maduro | Critérios de cobertura e timeout bem definidos. |
| css/base.css | 74 | L3 Sólido | Base consistente, baixo risco de manutenção. |
| css/calendar.css | 72 | L3 Sólido | Estilos específicos, complexidade moderada. |
| css/charts.css | 73 | L3 Sólido | Focado em visualização; manutenção média. |
| css/components.css | 72 | L3 Sólido | Organização razoável, sem sinais críticos. |
| css/forms.css | 72 | L3 Sólido | Escopo claro e pouca superfície de risco. |
| css/habits.css | 71 | L3 Sólido | Arquivo funcional, provável acoplamento com classes dinâmicas. |
| css/header.css | 74 | L3 Sólido | Simples e previsível para manutenção. |
| css/layout.css | 74 | L3 Sólido | Estrutura estável, risco baixo. |
| css/modals.css | 70 | L3 Sólido | Maior complexidade visual e acoplamento com JS. |
| css/variables.css | 80 | L4 Maduro | Tokens centralizados melhoram consistência e manutenção. |
| data/icons.ts | 83 | L4 Maduro | Repositório controlado de ícones com sanitização associada. |
| data/predefinedHabits.ts | 76 | L4 Maduro | Zero `any`; `HabitGoal` e `Frequency` tipados explicitamente. |
| data/quotes.ts | 69 | L3 Sólido | Grande massa de dados; pouca lógica, difícil revisão manual. |
| listeners/calendar.ts | 76 | L4 Maduro | Zero `any`, zero `innerHTML`; eventos bem definidos; fluxo de interação extenso. |
| listeners/cards.ts | 74 | L3 Sólido | Zero `innerHTML`; usa `replaceChildren` e `cloneNode`; padrão seguro de restauração DOM. |
| listeners/chart.ts | 76 | L4 Maduro | Zero `any`; `(window as any).CSSTranslate` eliminado; interações via pointer events sem leaks. |
| listeners/drag.ts | 62 | L2 Em evolução | Máquina de estado complexa e alto acoplamento ao DOM. |
| listeners/modals.ts | 76 | L4 Maduro | Handlers extraídos para aiHandlers, fullCalendarHandlers, formHandlers. |
| listeners/modals/aiHandlers.ts | 80 | L4 Maduro | `sanitizeHtmlToFragment` nos 2 paths; offline quote e online message seguros. |
| listeners/modals/fullCalendarHandlers.ts | 80 | L4 Maduro | Navegação bem encapsulada; navegateToDate privada. |
| listeners/modals/formHandlers.ts | 79 | L4 Maduro | Handlers de form/pickers bem isolados; validateAndFeedback privada. |
| listeners/swipe.ts | 71 | L3 Sólido | Zero `any`; 3 `catch` sem tipo → `catch(_e: unknown)` / `catch(e: unknown)`; listener lifecycle sem leaks. |
| listeners/sync.ts | 76 | L4 Maduro | Zero `any`; `catch (unknown)` + `instanceof Error`; manipulação HTML via `textContent` e `escapeHTML`. |
| locales/en.json | 78 | L4 Maduro | Catálogo estruturado e consistente para runtime. |
| locales/es.json | 77 | L4 Maduro | Boa cobertura textual, manutenção manual inevitável. |
| locales/pt.json | 76 | L4 Maduro | Base principal estável, risco baixo de execução. |
| render/calendar.ts | 80 | L4 Maduro | Zero `innerHTML`; `setTextContent` consistente; template cloning; `firstElementChild?.` seguro; cache de nós DOM. |
| render/chart.ts | 76 | L4 Maduro | Zero `any` e zero `innerHTML`; SVG via `setAttribute`; `setTextContent` e `setTrustedHtmlFragment` usados. |
| render/constants.ts | 83 | L4 Maduro | Constantes de render bem isoladas e seguras. |
| render/dom.ts | 84 | L4 Maduro | `sanitizeHtmlToFragment` com blocklist explícita; único `innerHTML` interno é o parser sandbox. |
| render/habits.ts | 78 | L4 Maduro | Zero `any`, zero `innerHTML`; `setTrustedSvgContent` em todos os 10 sinks de ícone. |
| render/icons.ts | 79 | L4 Maduro | Catálogo central e coerente com sanitização de uso. |
| render/modals.ts | 80 | L4 Maduro | Zero `any`; `openEditModal` tipado como `Habit \| HabitTemplate \| null`; `setTextContent()` em todos os 13 sinks; `sanitizeHtmlToFragment()` implementado. |
| render/rotary.ts | 77 | L4 Maduro | Zero `any`; `(window as any).CSSTranslate` eliminado; interação via pointer events bem estruturada. |
| render/ui.ts | 77 | L4 Maduro | Mapeamento UI centralizado e previsível. |
| scripts/dev-api-mock.js | 80 | L4 Maduro | `KEY_HASH_RE` valida formato do header; `lastModified` validado como `number`; 500 sem expor `e.message`. |
| services/HabitService.ts | 82 | L4 Maduro | Lógica bitmask sólida e foco claro de responsabilidade. |
| services/analysis.ts | 78 | L4 Maduro | `catch (e: unknown)` em todos os paths assíncronos; tratamento de erro robusto. |
| services/api.ts | 84 | L4 Maduro | Timeout, retries e hash de chave bem implementados. |
| services/badge.ts | 78 | L4 Maduro | `NavigatorWithBadging` interface local; zero `any`; falha silênciosa bem documentada. |
| services/cloud.ts | 83 | L4 Maduro | Zero `any`; DecryptedCore type guard; erro tipado com instanceof. |
| services/crypto.ts | 86 | L5 Excelente | AES-GCM/PBKDF2 correto; 5 guards de validação de entrada em `decrypt()`. |
| services/dataMerge.ts | 86 | L4 Maduro | Barrel estável para API pública; merge modular em `services/dataMerge/*`. |
| services/habitActions.ts | 84 | L4 Maduro | Barrel estável para API pública; lógica modular em `services/habitActions/*`. |
| services/migration.ts | 80 | L4 Maduro | Zero `any`; `Object.assign` para campos `readonly`; parâmetro `unknown`. |
| services/persistence.ts | 78 | L4 Maduro | Persistência resiliente com debounce e fallback adequados. |
| services/quoteEngine.ts | 76 | L4 Maduro | Zero `any`; algoritmo rico com cobertura de testes parcial. |
| services/selectors.ts | 76 | L4 Maduro | Zero `any`; `source` tipado com `HabitSchedule \| PredefinedHabit \| Habit`. |
| services/sync.worker.ts | 80 | L4 Maduro | Zero `any`; isRecord() guard; payloads tipados. |
| types/global.d.ts | 85 | L4 Maduro | `showFatalError`, `CSSTranslate`, `Document.startViewTransition` e `ViewTransition` declarados; sem `any`. |

## Top 10 para priorizar melhoria

1. listeners/drag.ts — simplificar máquina de estado e reduzir complexidade ciclomática (score 62, maior dívida técnica).
2. listeners/swipe.ts — fragmentar funções longas; extrair `_renderFrame` e `_onPointerMove` para sub-módulos (score 71).
3. render/modals.ts — extrair helpers de renderização para sub-módulos dado o tamanho do arquivo (score 80; `setTextContent` já consistente).
4. data/quotes.ts — grande massa de dados sem validação de schema formal (score 69).
5. listeners/cards.ts — zero `any`, zero `innerHTML`; `setTimeout` de animação sem ref de cleanup (score 74).
6. sw.js — `Promise.allSettled` implementado; próximo: validar versioning do cache-name (score 78).
7. package-lock.json — `npm audit`; revisar dependências e policy de atualização (score 60).
8. metadata.json — adicionar validação de schema para evitar valores inválidos em runtime (score 68).
9. listeners/drag.ts — adicionar cobertura de testes para os estados da máquina de estado.
10. services/quoteEngine.ts — expandir cobertura de testes; algoritmo de diversidade já bem estruturado (score 76).

---
Obs.: Esta ponderação é heurística e orientada a priorização prática, não substitui threat model formal.
