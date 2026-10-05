import assert from 'node:assert/strict'
import { register } from 'node:module'
import { cwd } from 'node:process'
import { after, afterEach, before, test } from 'node:test'
import { pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'

register(
  './tests/setup/conversation-card-lifecycle-loader-hooks.mjs',
  pathToFileURL(cwd() + '/').href,
)

const deferred = () => {
  let resolve
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

const createEvent = () => {
  const listeners = new Set()
  return {
    addListener(listener) {
      listeners.add(listener)
    },
    removeListener(listener) {
      listeners.delete(listener)
    },
    trigger(...args) {
      for (const listener of Array.from(listeners)) listener(...args)
    },
    clear() {
      listeners.clear()
    },
    size() {
      return listeners.size
    },
  }
}

const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0))

const waitFor = async (predicate, message) => {
  for (let attempt = 0; attempt < 50; ++attempt) {
    if (predicate()) return
    await nextTask()
  }
  assert.fail(message)
}

let dom
let ConversationCard
let originalScrollToDescriptor
const originalDescriptors = new Map()
const globalNames = ['window', 'document', 'Node', 'HTMLElement', 'Event', 'MouseEvent', 'Blob']
const mountedContainers = new Set()

const defaultConfig = () => ({
  lockWhenAnswer: false,
  answerScrollMargin: 0,
  activeApiModes: [],
  customApiModes: [],
  azureDeploymentName: '',
  ollamaModelName: '',
  customOpenAIProviders: [],
  customModelName: '',
  autoRegenAfterSwitchModel: false,
  disableWebModeHistory: true,
})

const baseSession = () => ({
  conversationRecords: [],
  modelName: 'test-model',
  apiMode: null,
  question: null,
})

const createRuntimePort = () => {
  const state = globalThis.__CONVERSATION_LIFECYCLE_TEST__
  const onMessage = createEvent()
  const onDisconnect = createEvent()
  let disconnected = false
  let disconnectCount = 0
  const port = {
    onMessage,
    onDisconnect,
    postMessage() {},
    disconnect() {
      disconnectCount += 1
      if (disconnected) return
      disconnected = true
    },
    emitRemoteDisconnect() {
      if (disconnected) return
      disconnected = true
      onDisconnect.trigger()
    },
    get disconnectCount() {
      return disconnectCount
    },
    get disconnected() {
      return disconnected
    },
  }
  state.ports.push(port)
  return port
}

const resetState = () => {
  const state = globalThis.__CONVERSATION_LIFECYCLE_TEST__
  state.config = defaultConfig()
  state.ports = []
  state.inputBoxProps = null
  state.deleteButtonProps = null
  state.configReadCount = 0
  state.getUserConfig = async () => {
    state.configReadCount += 1
    return { allowEscToCloseAll: false }
  }
  state.runtimeOnMessage.clear()
}

const mountCard = (container, props = {}) => {
  mountedContainers.add(container)
  act(() => {
    render(
      h(ConversationCard, {
        session: baseSession(),
        ...props,
      }),
      container,
    )
  })
}

before(async () => {
  dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.com/' })

  for (const name of globalNames) {
    originalDescriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name))
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: dom.window[name],
    })
  }

  originalScrollToDescriptor = Object.getOwnPropertyDescriptor(
    dom.window.HTMLElement.prototype,
    'scrollTo',
  )
  Object.defineProperty(dom.window.HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value() {},
  })

  globalThis.__CONVERSATION_LIFECYCLE_TEST__ = {
    runtimeOnMessage: createEvent(),
    createPort: createRuntimePort,
  }
  resetState()
  ;({ default: ConversationCard } = await import(
    '../../../src/components/ConversationCard/index.jsx'
  ))
})

afterEach(() => {
  act(() => {
    for (const container of mountedContainers) render(null, container)
  })
  for (const container of mountedContainers) container.remove()
  mountedContainers.clear()
  document.body.replaceChildren()
  resetState()
})

after(() => {
  if (originalScrollToDescriptor) {
    Object.defineProperty(dom.window.HTMLElement.prototype, 'scrollTo', originalScrollToDescriptor)
  } else {
    delete dom.window.HTMLElement.prototype.scrollTo
  }
  dom.window.close()
  delete globalThis.__CONVERSATION_LIFECYCLE_TEST__

  for (const [name, descriptor] of originalDescriptors) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor)
    else delete globalThis[name]
  }
})

test('unmount disconnects the owned runtime Port without reconnecting', () => {
  const state = globalThis.__CONVERSATION_LIFECYCLE_TEST__
  const container = document.createElement('div')
  document.body.append(container)

  mountCard(container)
  assert.equal(state.ports.length, 1)
  const port = state.ports[0]
  assert.equal(port.onDisconnect.size(), 1)

  act(() => render(null, container))

  assert.equal(port.disconnectCount, 1)
  assert.equal(port.disconnected, true)
  assert.equal(port.onDisconnect.size(), 0)
  assert.equal(state.ports.length, 1)
})

test('remote runtime Port disconnect reconnects and unmount cleans the replacement', () => {
  const state = globalThis.__CONVERSATION_LIFECYCLE_TEST__
  const container = document.createElement('div')
  document.body.append(container)

  mountCard(container)
  const initialPort = state.ports[0]

  act(() => initialPort.emitRemoteDisconnect())

  assert.equal(initialPort.disconnectCount, 0)
  assert.equal(initialPort.disconnected, true)
  assert.equal(state.ports.length, 2)
  const replacementPort = state.ports[1]
  assert.equal(replacementPort.disconnected, false)

  act(() => render(null, container))

  assert.equal(replacementPort.disconnectCount, 1)
  assert.equal(replacementPort.disconnected, true)
  assert.equal(state.ports.length, 2)
})

test('close button disposes the runtime Port before onClose', async () => {
  const state = globalThis.__CONVERSATION_LIFECYCLE_TEST__
  const container = document.createElement('div')
  document.body.append(container)
  let closeCount = 0
  let disconnectedBeforeClose = false

  mountCard(container, {
    closeable: true,
    onClose: () => {
      closeCount += 1
      disconnectedBeforeClose = state.ports[0].disconnected
    },
  })
  await waitFor(
    () => typeof state.inputBoxProps?.onSubmit === 'function',
    'InputBox did not render',
  )

  const closeButton = Array.from(container.querySelectorAll('.gpt-util-icon')).find(
    (element) => element.title === 'Close the Window',
  )
  assert.ok(closeButton)

  act(() => {
    closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await waitFor(() => closeCount === 1, 'onClose did not run')

  const port = state.ports[0]
  assert.equal(disconnectedBeforeClose, true)
  assert.equal(closeCount, 1)
  assert.equal(port.disconnectCount, 1)
  assert.equal(state.ports.length, 1)

  act(() => render(null, container))

  assert.equal(closeCount, 1)
  assert.equal(port.disconnectCount, 1)
  assert.equal(state.ports.length, 1)
})

test('CLOSE_CHATS disposes the runtime Port before onClose', async () => {
  const state = globalThis.__CONVERSATION_LIFECYCLE_TEST__
  const container = document.createElement('div')
  document.body.append(container)
  let closeCount = 0
  let disconnectedBeforeClose = false

  mountCard(container, {
    closeable: true,
    onClose: () => {
      closeCount += 1
      disconnectedBeforeClose = state.ports[0].disconnected
    },
  })
  await waitFor(
    () => typeof state.inputBoxProps?.onSubmit === 'function',
    'InputBox did not render',
  )

  act(() => state.runtimeOnMessage.trigger({ type: 'CLOSE_CHATS' }))
  await waitFor(() => closeCount === 1, 'onClose did not run')

  const port = state.ports[0]
  assert.equal(disconnectedBeforeClose, true)
  assert.equal(closeCount, 1)
  assert.equal(port.disconnectCount, 1)
  assert.equal(state.ports.length, 1)

  act(() => render(null, container))

  assert.equal(closeCount, 1)
  assert.equal(port.disconnectCount, 1)
  assert.equal(state.ports.length, 1)
})

test('Escape config continuation does not close after unmount', async () => {
  const state = globalThis.__CONVERSATION_LIFECYCLE_TEST__
  const pendingConfig = deferred()
  const container = document.createElement('div')
  document.body.append(container)
  let closeCount = 0

  state.getUserConfig = () => {
    state.configReadCount += 1
    return pendingConfig.promise
  }

  mountCard(container, {
    closeable: true,
    onClose: () => {
      closeCount += 1
    },
  })

  act(() => {
    window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }))
  })
  await waitFor(() => state.configReadCount === 1, 'Escape configuration read did not start')

  act(() => render(null, container))
  const port = state.ports[0]
  assert.equal(port.disconnectCount, 1)

  pendingConfig.resolve({ allowEscToCloseAll: true })
  await pendingConfig.promise
  await nextTask()

  assert.equal(closeCount, 0)
  assert.equal(port.disconnectCount, 1)
  assert.equal(state.ports.length, 1)
})

test('successful clear replacement Port is disposed on unmount', async () => {
  const state = globalThis.__CONVERSATION_LIFECYCLE_TEST__
  const container = document.createElement('div')
  document.body.append(container)

  mountCard(container)
  await waitFor(
    () => typeof state.deleteButtonProps?.onConfirm === 'function',
    'DeleteButton did not render',
  )

  const initialPort = state.ports[0]
  await act(async () => {
    await state.deleteButtonProps.onConfirm()
    await Promise.resolve()
  })

  assert.equal(state.ports.length, 2)
  const replacementPort = state.ports[1]
  assert.equal(initialPort.disconnectCount, 1)
  assert.equal(initialPort.disconnected, true)
  assert.equal(replacementPort.disconnectCount, 0)
  assert.equal(replacementPort.disconnected, false)

  act(() => render(null, container))

  assert.equal(replacementPort.disconnectCount, 1)
  assert.equal(replacementPort.disconnected, true)
  assert.equal(state.ports.length, 2)
})

test('clear continuation does not reconnect after unmount', async () => {
  const state = globalThis.__CONVERSATION_LIFECYCLE_TEST__
  const container = document.createElement('div')
  document.body.append(container)

  mountCard(container)
  await waitFor(
    () => typeof state.deleteButtonProps?.onConfirm === 'function',
    'DeleteButton did not render',
  )

  const clear = state.deleteButtonProps.onConfirm()
  act(() => render(null, container))
  await clear

  assert.equal(state.ports.length, 1)
  assert.equal(state.ports[0].disconnectCount, 1)
})
