# elv-lro-status

A library for enhancing the transcoding progress info returned by the **elv-client-js** `LROStatus()` API call,
providing the following:

* Human-friendly 'time left' estimates and ETA expressed in local time
* Stalled LRO detection
* Warnings if an LRO produces too many or too few mezzanine parts
* A summary that rolls up all the LROs into a status for the mezzanine offering as a whole.

**NOTE:** ETA computation and stall detection depend on knowing the current time accurately. The current time is passed
in as part of the `options` parameter to the main function call `enhancedLROStatus()`, allowing client to obtain current
time from a source other than system clock if desired.

## Installation

### Install from NPM:

```
npm install --save @eluvio/elv-lro-status
```

## Usage

### Node.js

It is possible to import individual items or the entire library, depending on whether code size is a critical concern. 
However, this library is fairly narrow in scope, you may not see a large difference in final size between the two approaches.

### Entire library (CommonJS)

```javascript
// namespace entire suite to a const
const L = require('@eluvio/elv-lro-status')

// create references to particular items in order to avoid needing to use L. prefix
const {enhanceLROStatus, defaultOptions} = L
const {_maxEnhancedState} = L.internal

// Note that the following syntax still causes entire library to be bundled into your project
const {enhanceLROStatus, defaultOptions} = require('@eluvio/elv-lro-status')
```

### Entire library (JS Modules)

```javascript
// namespace entire suite to L
import L from '@eluvio/elv-lro-status'

// create references to particular items in order to avoid needing to use H. prefix
const {enhanceLROStatus, defaultOptions} = L
const {_maxEnhancedState} = L.internal

// Note that the following syntax still causes entire library to be bundled into your project
import {enhanceLROStatus, defaultOptions} from '@eluvio/elv-lro-status'
```

### Individual items (CommonJS)

```javascript
// require in each item directly
const enhanceLROStatus = require('@eluvio/elv-lro-status/enhanceLROStatus')
const defaultOptions = require('@eluvio/elv-lro-status/defaultOptions')
const _maxEnhancedState = require('@eluvio/elv-lro-status/internal/_maxEnhancedState')
```

### Individual items (JS Modules)

```javascript
// import in each item directly
import enhanceLROStatus from '@eluvio/elv-lro-status/enhanceLROStatus'
import defaultOptions from '@eluvio/elv-lro-status/defaultOptions'
import _maxEnhancedState from '@eluvio/elv-lro-status/internal/_maxEnhancedState'
```

### Entire library (browser)

It is also possible to import the entire library directly into a browser via a `<script>` tag
pointing to either `dist/elv-lro-status.js` or `dist/elv-lro-status.min.js`. This will create a variable named
`ElvLROStatus` in the global namespace. There is no support for importing individual items via a `<script>` tag. (It is
expected that browser apps would be built using a bundling tool like Webpack/Rollup/Parcel)

```html
<!-- Import entire library as ElvLROStatus -->
<script src="node_modules/@eluvio/elv-lro-status/dist/elv-lro-status.js"></script>
<script type="application/javascript">
    console.log('Default options: ' + JSON.stringify(ElvLROStatus.defaultOptions(), null, 2))
</script>
```

## API Documentation
[https://eluv-io.github.io/elv-lro-status/api.html](https://eluv-io.github.io/elv-lro-status/api.html)


## Examples

**NOTE:** These code examples assume you have a `const` named `client` that is a successfully prepared ElvClient
instance. (See elv-client-js README sections [Initialization](https://github.com/eluv-io/elv-client-js#initialization)
and [Authorization](https://github.com/eluv-io/elv-client-js#authorization))

It is important to only call `enhanceLROStatus()` if your call to `ElvClient.LROStatus()` succeeded.

Note that temporary network connectivity issues may cause your call to `ElvClient.LROStatus()` to fail and throw an
exception - you should catch exceptions and retry periodically unless the exception indicates an irrecoverable error (
e.g. 'object not found' or 'unauthorized').

```js
const defaultOptions = require('@eluvio/elv-lro-status/defaultOptions')
const enhanceLROStatus = require('@eluvio/elv-lro-status/enhanceLROStatus')

const status = await client.LROStatus({
  libraryId: 'ilib3JgZBNxZE8ZkM4jP8YUAdTnjukWV',
  objectId: 'iq__4Ym91uVyPhayTRsew3ixQ8aGDJjy'
})

// check to make sure we received data back
if (status === undefined) throw Error("Received no job status information from server - object already finalized?")

const options = Object.assign(defaultOptions(), {currentTime: new Date})
const enhancedStatus = enhanceLROStatus(options, status)

if (enhancedStatus.ok) {
  console.log('Individual LRO statuses')
  console.log(
    JSON.stringify(
      enhancedStatus.result.LROs,
      null,
      2
    )
  )
  console.log('Overall status summary')
  console.log(
    JSON.stringify(
      enhancedStatus.result.summary,
      null,
      2
    )
  )
} else {
  console.error("Error during processing:")
  console.error(enhancedStatus.errors.join("\n"))
}
```

### One LRO finished, one LRO started (but no progress reported yet)

Sample data from `ElvClient.LROStatus()`:

```json
{
  "tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSv3L57AV3CPYHbLmk3E9SF1b": {
    "duration": 0,
    "duration_ms": 0,
    "progress": {
      "percentage": 0
    },
    "run_state": "running",
    "start": "2022-04-09T05:09:00Z"
  },
  "tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be": {
    "duration": 12747000000,
    "duration_ms": 12747,
    "end": "2022-04-09T05:09:13Z",
    "progress": {
      "percentage": 100
    },
    "run_state": "finished",
    "start": "2022-04-09T05:09:00Z"
  }
}
```

If we obtained the above data at 10:10:24 PM PDT on April 8th, 2022 and immediately passed it to `enhanceLROStatus()`,
the function would return:

```json
{
  "ok": true,
  "result": {
    "LROs": {
      "tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSv3L57AV3CPYHbLmk3E9SF1b": {
        "duration": 0,
        "duration_ms": 0,
        "progress": {
          "percentage": 0
        },
        "estimated_time_left_h_m_s": "unknown (not enough progress yet)",
        "run_state": "running",
        "start": "2022-04-09T05:09:00Z",
        "seconds_since_last_update": 84
      },
      "tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be": {
        "duration": 12747000000,
        "duration_ms": 12747,
        "end": "2022-04-09T05:09:13Z",
        "progress": {
          "percentage": 100
        },
        "run_state": "finished",
        "start": "2022-04-09T05:09:00Z"
      }
    },
    "summary": {
      "run_state": "running",
      "estimated_time_left_h_m_s": "unknown (not enough progress yet)"
    }
  }
}
```

### One LRO finished, one LRO running

Sample data from `ElvClient.LROStatus()`:

```json
{
  "tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU": {
    "duration": 335613000000,
    "duration_ms": 335613,
    "end": "2022-04-08T21:10:34Z",
    "progress": {
      "percentage": 100
    },
    "run_state": "finished",
    "start": "2022-04-08T21:05:00Z"
  },
  "tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh": {
    "duration": 1390740000000,
    "duration_ms": 1390740,
    "progress": {
      "percentage": 76.66666666666667
    },
    "run_state": "running",
    "start": "2022-04-08T21:05:00Z"
  }
}
```

### Normal case (LRO not stalled)

If we obtained the above data at 2:34:10 PM PDT on April 8th, 2022 and immediately passed it to `enhanceLROStatus()`,
the function would return:

```json
{
  "ok": true,
  "result": {
    "LROs": {
      "tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU": {
        "duration": 335613000000,
        "duration_ms": 335613,
        "end": "2022-04-08T21:10:34Z",
        "progress": {
          "percentage": 100
        },
        "run_state": "finished",
        "start": "2022-04-08T21:05:00Z"
      },
      "tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh": {
        "duration": 1390740000000,
        "duration_ms": 1390740,
        "progress": {
          "percentage": 76.66666666666667
        },
        "run_state": "running",
        "start": "2022-04-08T21:05:00Z",
        "seconds_since_last_update": 359,
        "estimated_time_left_seconds": 423,
        "estimated_time_left_h_m_s": "7m 03s",
        "eta_local": "2:41:13 PM PDT"
      }
    },
    "summary": {
      "run_state": "running",
      "estimated_time_left_seconds": 423,
      "estimated_time_left_h_m_s": "7m 03s",
      "eta_local": "2:41:13 PM PDT"
    }
  }
}
```

The `ok` property only indicates that input data was correctly structured and that no exceptions were thrown during data
inspection and summarization - it **DOES NOT** indicate that the LROs are ok.

### Stalled LRO

If we obtained the same data one hour later and passed it to `enhanceLROStatus()`, the function would return:

```json
{
  "ok": true,
  "result": {
    "LROs": {
      "tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU": {
        "duration": 335613000000,
        "duration_ms": 335613,
        "end": "2022-04-08T21:10:34Z",
        "progress": {
          "percentage": 100
        },
        "run_state": "finished",
        "start": "2022-04-08T21:05:00Z"
      },
      "tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh": {
        "duration": 1390740000000,
        "duration_ms": 1390740,
        "progress": {
          "percentage": 76.66666666666667
        },
        "run_state": "stalled",
        "start": "2022-04-08T21:05:00Z",
        "seconds_since_last_update": 3959,
        "warning": "status has not been updated in 3959 seconds, process may have terminated",
        "reported_run_state": "running"
      }
    },
    "summary": {
      "run_state": "stalled"
    }
  }
}
```

Note the presence of two additional fields `warning` and `reported_run_state` for the stalled LRO.

Note also that the `ok` field is still `true` even though LRO has probably terminated abnormally.

### Bad data

If the data obtained from `ElvClient.LROStatus()` is somehow invalid, then the object returned by `enhanceLROStatus()`
will have `ok` set to `false` and also have an `errors` property set to an array of error message strings, as well as an
`errorDetails` property with more detailed error information (if available - if no further information is available, it
will contain the same strings as `errors`).

For example, if somehow the `LROStatus()` call returned `-1000` for one of the LRO's `duration_ms` field,
then `enhanceLROStatus()` would return:

```json
{
  "ok": false,
  "errors": [
    "LROStatus: key 'tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU' points to a value that is an invalid LROStatusEntry (LROStatusEntry: duration_ms must be >= 0 (got: -1000))"
  ],
  "errorDetails": [
    {
      "received": {
        "tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU": {
          "duration": 0,
          "duration_ms": -1000,
          "end": "2022-04-08T21:10:34Z",
          "progress": {
            "percentage": 100
          },
          "run_state": "finished",
          "start": "2022-04-08T21:05:00Z"
        }
      },
      "path": null,
      "message": "key 'tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU' points to a value that is an invalid LROStatusEntry (LROStatusEntry: duration_ms must be >= 0 (got: -1000))"
    }
  ]
}
```

Usually, an `ok` value of `false` indicates that invalid `options` were passed into the function (e.g. setting
`currentTime` to something other than a Javascript Date object), but it is also possible that `ElvClient.LROStatus()`
returned data in an unexpected format or with unexpected values.
