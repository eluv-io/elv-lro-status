// ladderSpecsModel.js
//
// Defines data structure for an ABR Profile ladder_specs object
// NOTE: only video is supported, and only x264 encoder


// --------------------------------------
// internal modules
// --------------------------------------

const M = require('../lib/models')

// --------------------------------------
// internal functions
// --------------------------------------

const LRO_ID_REGEX = /^tlro[1-9A-HJ-NP-Za-km-z]+$/

// --------------------------------------
// exported functions
// --------------------------------------

// LRO run_state constants used by node
//  RunStateNotStarted              "not started"
// 	RunStateRunning                 RunState = "running"
// 	RunStateFinished                RunState = "finished"
// 	RunStateFailed                  RunState = "failed"
// 	RunStateCancelledByTimeout      RunState = "cancelled by timeout"
// 	RunStateCancelledByUser         RunState = "cancelled by user"
// 	RunStateCancelledByNodeShutdown RunState = "cancelled by node shutdown"

const LRO_RUN_STATE_NOT_STARTED = 'not started'
const LRO_RUN_STATE_RUNNING = 'running'
const LRO_RUN_STATE_FINISHED = 'finished'
const LRO_RUN_STATE_FAILED = 'failed'
const LRO_RUN_STATE_CANCELLED_TIMEOUT = 'cancelled by timeout'
const LRO_RUN_STATE_CANCELLED_USER = 'cancelled by user'
const LRO_RUN_STATE_CANCELLED_SHUTDOWN = 'cancelled by node shutdown'

const LRO_RUN_STATES = [
  LRO_RUN_STATE_NOT_STARTED,
  LRO_RUN_STATE_RUNNING,
  LRO_RUN_STATE_FINISHED,
  LRO_RUN_STATE_FAILED,
  LRO_RUN_STATE_CANCELLED_TIMEOUT,
  LRO_RUN_STATE_CANCELLED_USER,
  LRO_RUN_STATE_CANCELLED_SHUTDOWN
]

const LROIDModel = M.RegexMatchedStringModel(LRO_ID_REGEX)
  .extend()
  .as('LRO Id')

const LROStatusEntryModel = M.ObjectModel({
  duration: M.NonNegativeIntegerModel,
  duration_ms: M.NonNegativeIntegerModel,
  end: [M.UTCTimestampStringModel],
  progress: M.SealedModel({percentage: M.NonNegativeNumberModel}),
  run_state: LRO_RUN_STATES,
  start: [M.UTCTimestampStringModel]
}).as('LROStatusEntry')


const LROStatusModel = M.KVMapModel({
  keyModel:LROIDModel,
  valueModel: LROStatusEntryModel
}).as('LROStatus')

module.exports = {
  LRO_RUN_STATE_CANCELLED_SHUTDOWN,
  LRO_RUN_STATE_CANCELLED_TIMEOUT,
  LRO_RUN_STATE_CANCELLED_USER,
  LRO_RUN_STATE_FAILED,
  LRO_RUN_STATE_FINISHED,
  LRO_RUN_STATE_NOT_STARTED,
  LRO_RUN_STATE_RUNNING,
  LROIDModel,
  LROStatusEntryModel,
  LROStatusModel
}
