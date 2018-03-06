### trustkey_first_perfect
[Promise][0]-based TrustKey supervisor module. Generates array of random bytes based on trustkey. Uses first trustkey after specified in promise timestamp which has no unresolved hashes(perfect). Resolves only if the entire chain from desired trustkey to first perfect was supervised and trusted
### Module usage examples with [supervisor][2] repl interface

#### Create promise:
Request:
```javascript
‌‌services.promise.createPromise({ promise_alg: 'trustkey_first_perfect',
    server_id: 'D000000000000000',
    trustkey_ts: 1520364270, //Desired trustkey to use
    n_bytes: 64,
    b64_buffers: true}, (res) => console.log(res))
```

Response:
```javascript
{ success: true,
  result: 
   { promise_alg: 'trustkey_first_perfect',
     server_id: 'D000000000000000',
     trustkey_ts: 1520364270,
     b64_buffers: true,
     server_round_time: 30,
     seed: '8gxFqQNxgT2S1CrJsTXwYonb7WTg99OhsYNMY041cPV6dcl+Jv3cqqQDRgqIhEKFya9ojdXHD0rBKNzVlfgVmA==' } }
```

#### Resolve promise:
Request:
```javascript
//Based on previous response
services.promise.resolvePromise({ promise_alg: 'trustkey_first_perfect',
            server_id: 'D000000000000000',
            trustkey_ts: 1520364270,
            b64_buffers: true,
            server_round_time: 30,
            seed: '8gxFqQNxgT2S1CrJsTXwYonb7WTg99OhsYNMY041cPV6dcl+Jv3cqqQDRgqIhEKFya9ojdXHD0rBKNzVlfgVmA==' }, (res) => console.log(res))
```
Response:
```javascript
{ success: true,
  result: '6OpGUO1CvnZH0eoYlbdfeGdNfQETlIk4CJ5vLvzBFrj1v53SQWKpvbcHjOCJtuKr6Pjckcj4rYKpJd1acPIeRw==',
  info: { trustkey_ts: 1520364270 //perfect trustkey used to generate seed } }
```

Error response example(error codes listed in `errorCodes.js`):
```javascript
{ success: false, error_code: 6, error: 'trustkey not found' }
```
[0]: https://github.com/TrustKey/promise
[2]: https://github.com/TrustKey/supervisor