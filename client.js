window.__ModuleLoader__.load({
  id: 'dsh-inline-branches',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { Fragment } = React
    const { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } = React

    const NS = 'inlineTree'
    const TREE_KEY = 'dsh.inline-tree.v3'
    const COLLAPSE_KEY = 'dsh.inline-tree.collapsed.v1'

    const zh = {
      tree: '对话树',
      openTree: '打开对话树导航',
      closeTree: '关闭对话树',
      treeTitle: '对话树',
      treeEmpty: '还没有对话轮次',
      turn: '第 {n} 轮',
      childTurns: '{n} 个子对话',
      newChild: '子对话',
      newChildTitle: '在此轮下面开启一个子对话；之后的消息会嵌套在这里',
      backToMain: '返回主线',
      armed: '新消息会进入「{label}」的子对话',
      folder: '子对话',
      expand: '展开子对话',
      collapse: '收起子对话',
      panelCount: '{n} 轮',
    }

    const en = {
      tree: 'Tree',
      openTree: 'Open the conversation tree',
      closeTree: 'Close the conversation tree',
      treeTitle: 'Conversation tree',
      treeEmpty: 'No turns yet',
      turn: 'Turn {n}',
      childTurns: '{n} sub-conversations',
      newChild: 'Sub-conversation',
      newChildTitle: 'Start a sub-conversation under this turn; later messages will nest here',
      backToMain: 'Back to main',
      armed: 'New messages go into the sub-conversation under “{label}”',
      folder: 'Sub-conversation',
      expand: 'Expand sub-conversation',
      collapse: 'Collapse sub-conversation',
      panelCount: '{n} turns',
    }

    const CSS = `
.dsh-tree-trigger{display:inline-flex;align-items:center;gap:4px;height:24px;max-width:150px;padding:0 6px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);font-family:inherit;font-size:12px;line-height:16px;cursor:pointer}
.dsh-tree-trigger:hover,.dsh-tree-trigger[data-open]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
.dsh-tree-trigger:focus-visible{outline:1.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dsh-tree-trigger-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-tree-count{flex:none;min-width:15px;padding:0 4px;border-radius:7px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:14px;text-align:center;font-variant-numeric:tabular-nums}
.dsh-tree-folder-row{display:flex;align-items:center;gap:2px;min-height:26px;margin-top:2px;color:var(--dsw-alias-label-tertiary)}
.dsh-tree-folder{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 6px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:inherit;font-family:inherit;font-size:var(--dsh-content-font-size-secondary,13px);line-height:18px;cursor:pointer}
.dsh-tree-folder:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
.dsh-tree-folder:focus-visible{outline:1.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dsh-tree-chevron{display:inline-flex;flex:none;color:var(--dsw-alias-label-tertiary);transition:transform .12s ease}
.dsh-tree-folder[data-open] .dsh-tree-chevron{transform:rotate(90deg)}
.dsh-tree-add{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 6px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);font-family:inherit;font-size:12px;line-height:16px;cursor:pointer;opacity:.72}
.dsh-tree-add:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);opacity:1}
.dsh-tree-add:focus-visible{outline:1.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dsh-tree-folder-row[data-armed] .dsh-tree-add{color:var(--dsw-alias-brand-primary);opacity:1}
.dsh-tree-folder-row[data-armed] .dsh-tree-folder{color:var(--dsw-alias-brand-primary)}
.dsh-tree-armed{display:flex;align-items:center;gap:7px;box-sizing:border-box;width:100%;max-width:var(--dsh-chat-content-width,748px);height:30px;margin:0 auto 6px;padding:0 8px 0 10px;border:.5px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 28%,var(--dsw-alias-border-l1));border-radius:var(--dsw-radius-md);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 7%,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-secondary);font-size:var(--dsh-content-font-size-secondary,13px);line-height:18px}
.dsh-tree-armed-icon{flex:none;color:var(--dsw-alias-brand-primary)}
.dsh-tree-armed-text{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-tree-armed-text b{font-weight:510;color:var(--dsw-alias-label-primary)}
.dsh-tree-armed button{flex:none;height:22px;padding:0 7px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:11px;cursor:pointer}
.dsh-tree-armed button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-tree-backdrop{position:fixed;inset:0;z-index:1000;background:transparent;pointer-events:auto}
.dsh-tree-panel{position:fixed;z-index:1001;display:flex;flex-direction:column;box-sizing:border-box;width:320px;max-width:calc(100vw - 24px);max-height:min(60vh,520px);border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-overlay);box-shadow:var(--dsw-elevation-panel);overflow:hidden}
.dsh-tree-panel-head{display:flex;align-items:center;gap:6px;flex:none;height:38px;padding:0 6px 0 12px;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.dsh-tree-panel-title{flex:1;min-width:0;font-size:var(--dsh-content-font-size-secondary,13px);line-height:18px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsh-tree-panel-count{flex:none;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.dsh-tree-panel-close{display:inline-flex;flex:none;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
.dsh-tree-panel-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-tree-panel-list{flex:1;min-height:0;overflow:auto;padding:6px 6px 8px}
.dsh-tree-row{display:flex;align-items:stretch;gap:1px;min-height:38px;border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-secondary)}
.dsh-tree-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-tree-row-chevron{display:inline-flex;flex:none;align-items:center;justify-content:center;width:20px;padding:0;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
.dsh-tree-row-chevron:hover{color:var(--dsw-alias-label-primary)}
.dsh-tree-row-chevron[data-open] svg{transform:rotate(90deg)}
.dsh-tree-row-spacer{flex:none;width:20px}
.dsh-tree-row-main{display:flex;flex:1;flex-direction:column;align-items:stretch;gap:1px;min-width:0;padding:5px 6px 5px 2px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.dsh-tree-row-main:focus-visible{outline:1.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-1px}
.dsh-tree-row-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--dsh-content-font-size-secondary,13px);line-height:18px;color:var(--dsw-alias-label-primary)}
.dsh-tree-row-preview{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary)}
.dsh-tree-empty{padding:18px 10px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:var(--dsh-content-font-size-secondary,13px);line-height:20px}
`

    const EMPTY_PARENTS = Object.freeze({})
    const EMPTY_TREE = Object.freeze({ version: 3, sessions: {} })
    const EMPTY_WINDOW = Object.freeze({ entries: [], hasMore: false, revision: 0, change: { kind: 'replace', entries: [] } })

    function createStore(initial) {
      let value = initial
      const listeners = new Set()
      return {
        getSnapshot() { return value },
        subscribe(listener) {
          listeners.add(listener)
          return () => { listeners.delete(listener) }
        },
        set(next) {
          value = next
          for (const listener of [...listeners]) listener()
        },
      }
    }

    // ---- persisted tree: turn -> parent turn (a "folder" edge) ----

    function readTree() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(TREE_KEY) || 'null')
        if (parsed === null || parsed.version !== 3 || parsed.sessions === null || typeof parsed.sessions !== 'object') {
          return EMPTY_TREE
        }
        const sessions = {}
        for (const [sessionId, raw] of Object.entries(parsed.sessions)) {
          if (raw === null || typeof raw !== 'object' || raw.parents === null || typeof raw.parents !== 'object') continue
          const parents = {}
          for (const [turnText, parentValue] of Object.entries(raw.parents)) {
            const turn = Number(turnText)
            const parent = Number(parentValue)
            if (!Number.isSafeInteger(turn) || turn <= 0) continue
            if (!Number.isSafeInteger(parent) || parent <= 0 || parent >= turn) continue
            parents[turn] = parent
          }
          if (Object.keys(parents).length > 0) sessions[sessionId] = { parents }
        }
        return { version: 3, sessions }
      } catch (error) {
        return EMPTY_TREE
      }
    }

    const treeStore = createStore(readTree())

    function persistTree(value) {
      try { window.localStorage.setItem(TREE_KEY, JSON.stringify(value)) } catch (error) { /* no storage */ }
    }

    function assignParent(sessionId, turn, parent) {
      const turnNumber = Number(turn)
      const parentNumber = Number(parent)
      if (!Number.isSafeInteger(turnNumber) || turnNumber <= 0) return
      if (!Number.isSafeInteger(parentNumber) || parentNumber <= 0 || parentNumber >= turnNumber) return
      const current = treeStore.getSnapshot()
      const session = current.sessions[sessionId]
      const parents = session === undefined ? EMPTY_PARENTS : session.parents
      if (parents[turnNumber] !== undefined) return
      const next = {
        version: 3,
        sessions: { ...current.sessions, [sessionId]: { parents: { ...parents, [turnNumber]: parentNumber } } },
      }
      treeStore.set(next)
      persistTree(next)
    }

    function parentsOf(snapshot, sessionId) {
      const session = snapshot.sessions[sessionId]
      return session === undefined ? EMPTY_PARENTS : session.parents
    }

    // ---- collapse state ----

    function readCollapsed() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(COLLAPSE_KEY) || 'null')
        if (parsed === null || typeof parsed !== 'object') return {}
        const result = {}
        for (const [sessionId, list] of Object.entries(parsed)) {
          if (!Array.isArray(list)) continue
          result[sessionId] = [...new Set(list.filter((turn) => Number.isSafeInteger(turn) && turn > 0))]
        }
        return result
      } catch (error) {
        return {}
      }
    }

    const collapseStore = createStore(readCollapsed())

    function persistCollapsed(value) {
      try { window.localStorage.setItem(COLLAPSE_KEY, JSON.stringify(value)) } catch (error) { /* no storage */ }
    }

    function toggleCollapse(sessionId, turn) {
      const current = collapseStore.getSnapshot()
      const list = current[sessionId] || []
      const next = list.includes(turn) ? list.filter((candidate) => candidate !== turn) : [...list, turn]
      const value = { ...current, [sessionId]: next }
      collapseStore.set(value)
      persistCollapsed(value)
    }

    function expandPath(sessionId, turn, parents) {
      const path = []
      const seen = new Set()
      let cursor = turn
      while (Number.isSafeInteger(cursor) && cursor > 0 && !seen.has(cursor)) {
        seen.add(cursor)
        path.push(cursor)
        cursor = parents[cursor]
      }
      const current = collapseStore.getSnapshot()
      const list = current[sessionId] || []
      const nextList = list.filter((candidate) => !path.includes(candidate))
      if (nextList.length === list.length) return
      const value = { ...current, [sessionId]: nextList }
      collapseStore.set(value)
      persistCollapsed(value)
    }

    // ---- armed folder (the composer writes into it) ----

    const armedStore = createStore(null)

    function armFolder(sessionId, parentTurn, baseTurn, parents) {
      expandPath(sessionId, parentTurn, parents)
      armedStore.set({ sessionId, parentTurn, baseTurn })
    }

    function disarmFolder() {
      armedStore.set(null)
    }

    // ---- navigator panel ----

    const panelStore = createStore({ open: false, sessionId: null, rect: null })

    function closePanel() {
      panelStore.set({ open: false, sessionId: null, rect: null })
    }

    // ---- tree model ----

    function buildTree(turns, parents) {
      const all = new Set()
      for (const turn of turns) if (Number.isSafeInteger(turn) && turn > 0) all.add(turn)
      for (const [turnText, parent] of Object.entries(parents)) {
        const turn = Number(turnText)
        if (Number.isSafeInteger(turn) && turn > 0) all.add(turn)
        if (Number.isSafeInteger(parent) && parent > 0) all.add(parent)
      }
      const sorted = [...all].sort((left, right) => left - right)
      const children = new Map()
      const roots = []
      for (const turn of sorted) {
        const parent = parents[turn]
        if (parent !== undefined && parent > 0 && parent < turn && all.has(parent)) {
          const list = children.get(parent) || []
          list.push(turn)
          children.set(parent, list)
        } else {
          roots.push(turn)
        }
      }
      const nodes = []
      const byTurn = new Map()
      const walk = (turn, depth, ancestors) => {
        const node = { turn, depth, order: nodes.length, ancestors, children: children.get(turn) || [] }
        nodes.push(node)
        byTurn.set(turn, node)
        for (const child of node.children) walk(child, depth + 1, [...ancestors, turn])
      }
      for (const root of roots) walk(root, 0, [])
      return { nodes, byTurn, total: nodes.length }
    }

    function buildRules(sessionId, tree, collapsed) {
      const scope = `[data-conversation-scroll]:has([data-ib-tree="${sessionId}"])`
      const rules = []
      for (const node of tree.nodes) {
        const hidden = node.ancestors.some((turn) => collapsed.has(turn))
        const margin = node.depth * 18
        rules.push(`${scope} [data-chat-turn="${node.turn}"]{order:${node.order - tree.total - 1};margin-left:${margin}px;${hidden ? 'display:none!important;' : ''}}`)
      }
      rules.push(`${scope} [data-submission-echo],${scope} .tnXGgG_running{order:1000000}`)
      rules.push(`${scope} .tnXGgG_older{order:-1000000}`)
      return rules.join('\n')
    }

    // ---- message reading (for the navigator) ----

    function textOf(content) {
      if (!Array.isArray(content)) return ''
      const parts = []
      for (const block of content) {
        if (block !== null && typeof block === 'object' && block.type === 'text' && typeof block.text === 'string') parts.push(block.text)
      }
      return parts.join('\n').trim()
    }

    function collectTurns(entries) {
      const turns = new Map()
      let current = null
      const ensure = (turn) => {
        if (!Number.isSafeInteger(turn)) return undefined
        let record = turns.get(turn)
        if (record === undefined) {
          record = { turn, messages: [] }
          turns.set(turn, record)
        }
        return record
      }
      for (const entry of entries) {
        if (entry.type !== 'event') continue
        const event = entry.event
        if (event.type === 'turn/start' && event.data && Number.isSafeInteger(event.data.turn)) {
          current = event.data.turn
          ensure(current)
          continue
        }
        if (event.type === 'user/message') {
          const data = event.data
          if (data === null || data === undefined || data.source === null || data.source === undefined || data.source.kind !== 'user') continue
          const record = ensure(current)
          if (record === undefined) continue
          const text = textOf(data.content)
          if (text === '') continue
          record.messages.push({ kind: 'user', seq: event.seq, text })
          continue
        }
        if (event.type === 'assistant/message') {
          const data = event.data
          if (data === null || data === undefined || !Number.isSafeInteger(data.turn)) continue
          const record = ensure(data.turn)
          if (record === undefined) continue
          const content = Array.isArray(data.message && data.message.content) ? data.message.content : []
          const text = textOf(content)
          if (text === '') continue
          record.messages.push({ kind: 'assistant', seq: event.seq, text })
        }
      }
      return turns
    }

    function turnQuestion(turns, turn) {
      const record = turns.get(turn)
      if (record === undefined) return ''
      const message = record.messages.find((candidate) => candidate.kind === 'user')
      return message === undefined ? '' : message.text
    }

    function turnPreview(turns, turn) {
      const record = turns.get(turn)
      if (record === undefined) return ''
      for (let index = record.messages.length - 1; index >= 0; index -= 1) {
        const message = record.messages[index]
        if (message.kind === 'assistant') return message.text.replace(/\s+/g, ' ')
      }
      return ''
    }

    // ---- icons ----

    const TreeIcon = ({ size = 14 }) => h('svg', {
      viewBox: '0 0 16 16', width: size, height: size, 'aria-hidden': true, fill: 'none',
    },
    h('path', { d: 'M3.2 3.2h3v3h-3zM9.8 9.8h3v3h-3z', stroke: 'currentColor', strokeWidth: 1.2 }),
    h('path', { d: 'M4.7 6.2v3.1a1.5 1.5 0 0 0 1.5 1.5h2.1M6.2 9.3V11', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }))

    const ChevronIcon = ({ size = 12 }) => h('svg', {
      viewBox: '0 0 16 16', width: size, height: size, 'aria-hidden': true, fill: 'none',
    }, h('path', { d: 'M6 3.5 10.5 8 6 12.5', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }))

    const FolderIcon = ({ size = 13 }) => h('svg', {
      viewBox: '0 0 16 16', width: size, height: size, 'aria-hidden': true, fill: 'none',
    },
    h('path', { d: 'M2.2 4.2h4l1.2 1.4h6.4v6.2a1.2 1.2 0 0 1-1.2 1.2H3.4a1.2 1.2 0 0 1-1.2-1.2V4.2Z', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' }))

    const PlusIcon = ({ size = 12 }) => h('svg', {
      viewBox: '0 0 16 16', width: size, height: size, 'aria-hidden': true, fill: 'none',
    }, h('path', { d: 'M8 3.5v9M3.5 8h9', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }))

    const CloseIcon = ({ size = 12 }) => h('svg', {
      viewBox: '0 0 16 16', width: size, height: size, 'aria-hidden': true, fill: 'none',
    }, h('path', { d: 'm4 4 8 8M12 4l-8 8', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }))

    function apply(ctx) {
      function useEventWindow(sessionId) {
        const binding = sessionId === '' ? undefined : ctx.sessions.binding(sessionId)
        const source = binding !== null && binding !== undefined ? binding.eventSource : null
        const subscribe = useCallback((listener) => source === null ? () => {} : source.subscribe(listener), [source])
        const getSnapshot = useCallback(() => source === null ? EMPTY_WINDOW : source.getSnapshot(), [source])
        return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      }

      // ---- one header entry: tree button + global flow rules ----

      function TreeHeader({ sessionId, useChat, t }) {
        const turnOrderText = useChat((snapshot) => snapshot.timeline.turnOrder.join(','))
        const turns = useMemo(() => turnOrderText === '' ? [] : turnOrderText.split(',').map(Number), [turnOrderText])
        const treeSnapshot = useSyncExternalStore(treeStore.subscribe, treeStore.getSnapshot, treeStore.getSnapshot)
        const parents = parentsOf(treeSnapshot, sessionId)
        const collapseSnapshot = useSyncExternalStore(collapseStore.subscribe, collapseStore.getSnapshot, collapseStore.getSnapshot)
        const collapsed = useMemo(() => new Set(collapseSnapshot[sessionId] || []), [collapseSnapshot, sessionId])
        const tree = useMemo(() => buildTree(turns, parents), [turns, parents])
        const rules = useMemo(() => buildRules(sessionId, tree, collapsed), [sessionId, tree, collapsed])
        const armed = useSyncExternalStore(armedStore.subscribe, armedStore.getSnapshot, armedStore.getSnapshot)
        const panel = useSyncExternalStore(panelStore.subscribe, panelStore.getSnapshot, panelStore.getSnapshot)
        const buttonRef = useRef(null)

        useEffect(() => {
          const current = panelStore.getSnapshot()
          if (current.open && current.sessionId !== sessionId) closePanel()
        }, [sessionId])

        useEffect(() => {
          if (armed === null || armed.sessionId !== sessionId) return
          const fresh = turns.filter((turn) => turn > armed.baseTurn)
          if (fresh.length === 0) return
          for (const turn of fresh) assignParent(sessionId, turn, armed.parentTurn)
          expandPath(sessionId, armed.parentTurn, parents)
          armedStore.set({ ...armed, baseTurn: Math.max(...fresh) })
        }, [turns, armed, sessionId, parents])

        const open = panel.open && panel.sessionId === sessionId
        const togglePanel = () => {
          if (open) {
            closePanel()
            return
          }
          const rect = buttonRef.current === null ? null : buttonRef.current.getBoundingClientRect()
          panelStore.set({
            open: true,
            sessionId,
            rect: rect === null ? null : { top: rect.bottom + 6, right: Math.max(8, window.innerWidth - rect.right) },
          })
        }

        return h(Fragment, null,
          h('style', null, `${CSS}\n${rules}`),
          h('button', {
            ref: buttonRef,
            type: 'button',
            className: 'dsh-tree-trigger',
            'data-open': open ? 'true' : undefined,
            title: t('openTree'),
            'aria-label': t('openTree'),
            'aria-expanded': open,
            onClick: togglePanel,
          },
          h(TreeIcon, { size: 14 }),
          h('span', { className: 'dsh-tree-trigger-label' }, t('tree')),
          tree.total > 0 ? h('span', { className: 'dsh-tree-count' }, String(tree.total)) : null))
      }

      // ---- Finder-like disclosure row under one turn ----

      function FolderRow({ sessionId, turn, useChat, t }) {
        const turnNumber = turn !== null && typeof turn === 'object' && Number.isSafeInteger(turn.turn) ? turn.turn : turn
        const closed = useChat((snapshot) => {
          const record = snapshot.timeline.turns.get(turnNumber)
          return record !== undefined && record.end !== undefined
        })
        const lastTurn = useChat((snapshot) => snapshot.timeline.turnOrder.at(-1) ?? 0)
        const treeSnapshot = useSyncExternalStore(treeStore.subscribe, treeStore.getSnapshot, treeStore.getSnapshot)
        const parents = parentsOf(treeSnapshot, sessionId)
        const collapseSnapshot = useSyncExternalStore(collapseStore.subscribe, collapseStore.getSnapshot, collapseStore.getSnapshot)
        const collapsed = (collapseSnapshot[sessionId] || []).includes(turnNumber)
        const armed = useSyncExternalStore(armedStore.subscribe, armedStore.getSnapshot, armedStore.getSnapshot)
        const isArmed = armed !== null && armed.sessionId === sessionId && armed.parentTurn === turnNumber
        const children = useMemo(() => {
          const result = []
          for (const [childText, parent] of Object.entries(parents)) {
            if (parent === turnNumber) result.push(Number(childText))
          }
          result.sort((left, right) => left - right)
          return result
        }, [parents, turnNumber])

        if (!closed) return null

        const arm = () => {
          if (isArmed) {
            disarmFolder()
            return
          }
          armFolder(sessionId, turnNumber, lastTurn, parents)
        }

        return h('div', {
          className: 'dsh-tree-folder-row',
          'data-ib-tree': sessionId,
          'data-armed': isArmed ? 'true' : undefined,
        },
        children.length > 0 ? h('button', {
          type: 'button',
          className: 'dsh-tree-folder',
          'data-open': collapsed ? undefined : 'true',
          'aria-expanded': !collapsed,
          title: collapsed ? t('expand') : t('collapse'),
          onClick: () => toggleCollapse(sessionId, turnNumber),
        },
        h('span', { className: 'dsh-tree-chevron' }, h(ChevronIcon)),
        h(FolderIcon),
        h('span', null, t('childTurns', { n: children.length }))) : null,
        h('button', {
          type: 'button',
          className: 'dsh-tree-add',
          title: t('newChildTitle'),
          onClick: arm,
        },
        h(PlusIcon),
        children.length === 0 ? h('span', null, t('newChild')) : null))
      }

      // ---- armed composer chip ----

      function ArmedChip({ sessionId, t }) {
        const armed = useSyncExternalStore(armedStore.subscribe, armedStore.getSnapshot, armedStore.getSnapshot)
        const eventWindow = useEventWindow(sessionId)
        const turns = useMemo(() => collectTurns(eventWindow.entries), [eventWindow])
        if (armed === null || armed.sessionId !== sessionId) return null
        const question = turnQuestion(turns, armed.parentTurn)
        const label = question === '' ? t('turn', { n: armed.parentTurn }) : question
        return h('div', { className: 'dsh-tree-armed' },
          h('span', { className: 'dsh-tree-armed-icon' }, h(FolderIcon, { size: 13 })),
          h('span', { className: 'dsh-tree-armed-text' }, t('armed', { label })),
          h('button', { type: 'button', onClick: () => disarmFolder() }, t('backToMain')))
      }

      // ---- the tree navigator panel ----

      function TreePanel({ t }) {
        const panel = useSyncExternalStore(panelStore.subscribe, panelStore.getSnapshot, panelStore.getSnapshot)
        const sessionId = panel.sessionId
        const eventWindow = useEventWindow(sessionId === null ? '' : sessionId)
        const turns = useMemo(() => collectTurns(eventWindow.entries), [eventWindow])
        const treeSnapshot = useSyncExternalStore(treeStore.subscribe, treeStore.getSnapshot, treeStore.getSnapshot)
        const parents = sessionId === null ? EMPTY_PARENTS : parentsOf(treeSnapshot, sessionId)
        const collapseSnapshot = useSyncExternalStore(collapseStore.subscribe, collapseStore.getSnapshot, collapseStore.getSnapshot)
        const collapsed = useMemo(() => new Set(sessionId === null ? [] : collapseSnapshot[sessionId] || []), [collapseSnapshot, sessionId])
        const turnNumbers = useMemo(() => [...turns.keys()].sort((left, right) => left - right), [turns])
        const tree = useMemo(() => buildTree(turnNumbers, parents), [turnNumbers, parents])

        useEffect(() => {
          if (!panel.open) return undefined
          const onKey = (event) => { if (event.key === 'Escape') closePanel() }
          window.addEventListener('keydown', onKey)
          return () => window.removeEventListener('keydown', onKey)
        }, [panel.open])

        if (!panel.open) return null

        const jump = (turn) => {
          if (sessionId !== null) expandPath(sessionId, turn, parents)
          closePanel()
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const element = document.querySelector(`[data-chat-turn="${turn}"]`)
            if (element !== null) element.scrollIntoView({ block: 'center', behavior: 'smooth' })
          }))
        }

        const rows = []
        for (const node of tree.nodes) {
          if (node.ancestors.some((turn) => collapsed.has(turn))) continue
          const prompt = turnQuestion(turns, node.turn)
          const preview = turnPreview(turns, node.turn).slice(0, 120)
          const isCollapsed = collapsed.has(node.turn)
          rows.push(h('div', { key: node.turn, className: 'dsh-tree-row', style: { paddingLeft: `${node.depth * 14}px` } },
            node.children.length > 0 ? h('button', {
              type: 'button',
              className: 'dsh-tree-row-chevron',
              'data-open': isCollapsed ? undefined : 'true',
              'aria-expanded': !isCollapsed,
              title: isCollapsed ? t('expand') : t('collapse'),
              onClick: () => toggleCollapse(sessionId, node.turn),
            }, h(ChevronIcon)) : h('span', { className: 'dsh-tree-row-spacer' }),
            h('button', {
              type: 'button',
              className: 'dsh-tree-row-main',
              onClick: () => jump(node.turn),
            },
            h('span', { className: 'dsh-tree-row-title' }, prompt === '' ? t('turn', { n: node.turn }) : prompt),
            preview === '' ? null : h('span', { className: 'dsh-tree-row-preview' }, preview))))
        }

        const rect = panel.rect
        const style = {
          top: rect === null ? 64 : rect.top,
          right: rect === null ? 24 : rect.right,
        }

        return h(Fragment, null,
          h('div', { className: 'dsh-tree-backdrop', onClick: closePanel }),
          h('div', { className: 'dsh-tree-panel', role: 'dialog', 'aria-label': t('treeTitle'), style },
            h('div', { className: 'dsh-tree-panel-head' },
              h('span', { className: 'dsh-tree-panel-title' }, t('treeTitle')),
              h('span', { className: 'dsh-tree-panel-count' }, t('panelCount', { n: tree.total })),
              h('button', {
                type: 'button',
                className: 'dsh-tree-panel-close',
                title: t('closeTree'),
                'aria-label': t('closeTree'),
                onClick: closePanel,
              }, h(CloseIcon))),
            h('div', { className: 'dsh-tree-panel-list' },
              rows.length === 0 ? h('div', { className: 'dsh-tree-empty' }, t('treeEmpty')) : rows)))
      }

      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'inline-tree: dictionaries')

      ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
        name: 'conversation.session.header.actions',
        id: 'inline-tree',
        order: 12,
        locale: NS,
      }, TreeHeader))

      ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
        name: 'conversation.chat.turnTail',
        id: 'inline-tree-folders',
        order: 15,
        locale: NS,
      }, FolderRow))

      ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
        name: 'conversation.input.dock',
        id: 'inline-tree-armed',
        order: 15,
        locale: NS,
      }, ArmedChip))

      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'inline-tree-panel',
        order: 5,
        locale: NS,
      }, TreePanel))
    }

    return {
      inject: ['slots', 'sessions', 'locale'],
      apply,
    }
  },
})
