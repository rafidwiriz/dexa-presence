# lean-ctx — Context Engineering Layer
<!-- lean-ctx-rules-v12 -->

## Tool Mapping (MANDATORY — use instead of native equivalents)
| Instead of | Use | Example |
|------------|-----|---------|
| Read/cat/head/tail | `ctx_read(path, mode)` | `ctx_read("src/main.ts")` (omit mode = auto) |
| Grep/rg/find | `ctx_search(pattern, path)` | `ctx_search("fn handle", "src/")` |
| Shell/bash | `ctx_shell(command)` | `ctx_shell("make test")` |
| Edit (when Read unavailable) | `ctx_edit(path, old, new)` | `ctx_edit("f.ts", "old", "new")` |

## ctx_read Mode Selection (omit mode to auto-select — recommended)
| Goal | Mode | When |
|------|------|------|
| Exploring / unsure | `auto` (default) | Omit mode; system picks optimal |
| Edit this file | `full` | Right before an edit |
| Understand API | `signatures` | Context-only, won't edit |
| Large file overview | `map` | >500 lines, won't edit |
| Re-read after edit | `diff` | Post-edit verification |
| Specific region | `lines:N-M` | Know exact location |

## Workflow (follow this order)
1. **Orient:** `ctx_overview(task)` or `ctx_compose(task, path)` for unfamiliar tasks
2. **Locate:** `ctx_search(pattern, path)` for exact text; `ctx_semantic_search(query)` for concepts
3. **Read:** `ctx_read(path, mode)` with appropriate mode from table above
4. **Edit:** `ctx_edit(path, old_string, new_string)` or native Edit if available
5. **Verify:** `ctx_read(path, "diff")` + `ctx_shell("test command")`
6. **Record:** `ctx_knowledge(action="remember", content="...")` for non-obvious findings

## Session
- **Start:** `ctx_session(action="status")` + `ctx_knowledge(action="wakeup")`
- **End:** `ctx_session(action="decision", content="what was done + next steps")`
- **On [CHECKPOINT]:** `ctx_session(action="task", value="current status")`

NEVER use native Read/Grep/Shell when ctx_* equivalents are available.
<!-- /lean-ctx -->

<!-- lean-ctx-rules -->
<!-- version: 9 -->

lean-ctx shadow mode: native read/search/shell calls auto-route to ctx_* — no tool-mapping needed.
File editing → native Edit/StrReplace (lean-ctx only handles reads).
Exclusive tools (no native trigger): ctx_compose (understand code, call first),
ctx_search(action=symbol) (exact symbol), ctx_search(action=semantic) (by meaning),
ctx_callgraph (callers), ctx_knowledge / ctx_session (memory).
<!-- lean-ctx-compression -->
OUTPUT STYLE: concise
- Bullet points over paragraphs
- Skip filler words and hedging ("I think", "probably", "it seems")
- 1-sentence explanations max, then code/action
- No repeating what the user said
<!-- /lean-ctx-compression -->
<!-- lean-ctx-solution -->
SOLUTION EFFICIENCY: stop at first level that applies:
skip (YAGNI) → reuse codebase → stdlib → native platform → installed dep → one-line → minimum code.
Never skip: validation, security, error handling.
<!-- /lean-ctx-solution -->
<!-- /lean-ctx-rules -->