# elv-lro-status

A library for enhancing the transcoding progress info returned by the **elv-client-js** `LROStatus()` API call, providing
the following:

* Human-friendly 'time left' estimates and ETA expressed in local time
* Stalled LRO detection
* Warnings if an LRO produces too many or too few mezzanine parts
* A summary that rolls up all the LROs into a status for the mezzanine offering as a whole.

**NOTE:** ETA computation and stall detection depend on knowing the current time accurately. The current time is passed in as a parameter to the main function call EnhancedStatus(), allowing client to obtain current time from a source other than system clock if desired.   

## Installation

#### Install from NPM:

```
npm install --save @eluvio/elv-lro-status
```

## Usage

### Node.js

**NOTE:** The code examples assume you have a `const` named `client` that is a successfully prepared ElvClient
instance. (See elv-client-js README sections [Initialization](https://github.com/eluv-io/elv-client-js#initialization)
and [Authorization](https://github.com/eluv-io/elv-client-js#authorization))

It is important to only call `EnhancedStatus()` if your call to `ElvClient.LROStatus()` succeeded.

Note that temporary network connectivity issues may cause your call to `ElvClient.LROStatus()` to fail and throw an
exception - you should catch exceptions and retry periodically unless the exception indicates an irrecoverable error (
e.g. 'object not found' or 'unauthorized').

```js
const LRO = require('@eluvio/elv-lro-status');

const status = await client.LROStatus({
  libraryId: 'ilib3JgZBNxZE8ZkM4jP8YUAdTnjukWV',
  objectId: 'iq__4Ym91uVyPhayTRsew3ixQ8aGDJjy'
});

// check to make sure we received data back
if (status === undefined) throw Error("Received no job status information from server - object already finalized?");

const currentTime = new Date;
const enhancedStatus = LRO.EnhancedStatus(status, currentTime);

if (enhancedStatus.ok) {
  console.log('Individual LRO statuses');
  console.log(
    JSON.stringify(
      enhancedStatus.result.LROs,
      null,
      2
    )
  );
  console.log('Overall status summary');
  console.log(
    JSON.stringify(
      enhancedStatus.result.summary,
      null,
      2
    )
  );
} else {
  console.error("Bad job status data received from server:");
  console.error(enhancedStatus.errors.join("\n"));
}
```

## Examples

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

If we obtained the above data at 10:10:24 PM PDT on April 8th, 2022 and immediately passed it to `EnhancedStatus()`, the
function would return:

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

#### Normal case (LRO not stalled)

If we obtained the above data at 2:34:10 PM PDT on April 8th, 2022 and immediately passed it to `EnhancedStatus()`, the
function would return:

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

#### Stalled LRO

If we obtained the same data one hour later and passed it to `EnhancedStatus()`, the function would
return:

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

If the data obtained from `ElvClient.LROStatus()` is somehow invalid, then the object returned by `EnhancedStatus()`
will have `ok` set to `false` and also have an `errors`
property set to an array of error message strings.

For example, if somehow the `LROStatus()` call returned `-1000` for one of the LRO's `duration_ms` field,
then `EnhancedStatus()` would return:

```json
{
  "ok": false,
  "errors": [
    "LROStatusEntry: duration_ms must be >= 0 (got: -1000)"
  ]
}
```

Usually, an `ok` value of `false` indicates that `ElvClient.LROStatus()` returned data in an unexpected format or with
unexpected values. Passing in something other than a Javascript Date object for the current time would also cause `ok` to be `false`.
