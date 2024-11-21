import { getUserConfig } from '../../config/index.mjs'
import { fetchSSE } from '../../utils/fetch-sse.mjs'
import { getConversationPairs } from '../../utils/get-conversation-pairs.mjs'
import { isEmpty } from 'lodash-es'
import { pushRecord, setAbortController } from './shared.mjs'
import { getModelValue } from '../../utils/model-name-convert.mjs'

/**
 * @param {Browser.Runtime.Port} port
 * @param {string} question
 * @param {Session} session
 */
export async function generateAnswersWithGeminiApi(port, question, session) {
  const { controller, messageListener, disconnectListener } = setAbortController(port)
  const config = await getUserConfig()
  const model = getModelValue(session)

  const prompt = getConversationPairs(
    session.conversationRecords.slice(-config.maxConversationContextLength),
    false,
  )
  prompt.push({ role: 'user', content: question })

  let answer = ''
  await fetchSSE(
    `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
    {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        messages: prompt,
        model,
        stream: true,
        max_tokens: config.maxResponseTokenLength,
        temperature: config.temperature,
      }),
      onMessage(message) {
        console.debug('sse message', message)
        let data
        try {
          data = JSON.parse(message)
        } catch (error) {
          console.debug('json error', error)
          return
        }
        if (
          data.choices &&
          data.choices.length > 0 &&
          data.choices[0] &&
          data.choices[0].delta &&
          'content' in data.choices[0].delta
        ) {
          answer += data.choices[0].delta.content
          port.postMessage({ answer: answer, done: false, session: null })
        }

        if (data.choices && data.choices.length > 0 && data.choices[0]?.finish_reason) {
          pushRecord(session, question, answer)
          console.debug('conversation history', { content: session.conversationRecords })
          port.postMessage({ answer: null, done: true, session: session })
        }
      },
      async onStart() {},
      async onEnd() {
        port.postMessage({ done: true })
        port.onMessage.removeListener(messageListener)
        port.onDisconnect.removeListener(disconnectListener)
      },
      async onError(resp) {
        port.onMessage.removeListener(messageListener)
        port.onDisconnect.removeListener(disconnectListener)
        if (resp instanceof Error) throw resp
        const error = await resp.json().catch(() => ({}))
        throw new Error(
          !isEmpty(error) ? JSON.stringify(error) : `${resp.status} ${resp.statusText}`,
        )
      },
    },
  )
}
