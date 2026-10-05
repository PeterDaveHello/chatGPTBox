import { v4 as uuidv4 } from 'uuid'
import {
  apiModeToModelName,
  modelNameToDesc,
  normalizeApiMode,
} from '../utils/model-name-convert.mjs'
import { t } from 'i18next'

/**
 * @typedef {object} Session
 * @property {string|null} question
 * @property {Object[]|null} conversationRecords
 * @property {string|null} sessionName
 * @property {string|null} sessionId
 * @property {string|null} createdAt
 * @property {string|null} updatedAt
 * @property {string|null} aiName
 * @property {string|null} modelName
 * @property {boolean|null} autoClean
 * @property {boolean} isRetry
 * @property {string|null} conversationId - chatGPT web mode
 * @property {string|null} messageId - chatGPT web mode
 * @property {string|null} parentMessageId - chatGPT web mode
 * @property {string|null} wsRequestId - chatGPT web mode
 * @property {object|null} claude_conversation
 * @property {string|null} thirdPartySignature - github third party API mode
 * @property {string|null} thirdPartyConversationId - github third party API mode
 * @property {string|null} thirdPartyClientId - github third party API mode
 * @property {string|null} thirdPartyInvocationId - github third party API mode
 * @property {object|null} moonshot_conversation
 */
/**
 * @param {string|null} question
 * @param {Object[]|null} conversationRecords
 * @param {string|null} sessionName
 * @param {string|null} modelName
 * @param {boolean|null} autoClean
 * @param {Object|null} apiMode
 * @param {string} extraCustomModelName
 * @returns {Session}
 */
export function initSession({
  question = null,
  conversationRecords = [],
  sessionName = null,
  modelName = null,
  autoClean = false,
  apiMode = null,
  extraCustomModelName = '',
} = {}) {
  return {
    // common
    question,
    conversationRecords,

    sessionName,
    sessionId: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    aiName:
      modelName || apiMode
        ? modelNameToDesc(
            apiMode ? apiModeToModelName(apiMode) : modelName,
            t,
            extraCustomModelName,
          )
        : null,
    modelName,
    apiMode: normalizeApiMode(apiMode),

    autoClean,
    isRetry: false,

    // chatgpt-web
    conversationId: null,
    messageId: null,
    parentMessageId: null,
    wsRequestId: null,

    // claude.ai
    claude_conversation: null,

    // github third party API
    thirdPartySignature: null,
    thirdPartyConversationId: null,
    thirdPartyClientId: null,
    thirdPartyInvocationId: null,
    // kimi.com
    moonshot_conversation: null,
  }
}
