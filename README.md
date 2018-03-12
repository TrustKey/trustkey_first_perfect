### trustkey_first_perfect
[Promise][0]-based TrustKey supervisor module. Generates array of random bytes based on trustkey. Uses first trustkey after specified in promise timestamp which has no unresolved hashes(perfect). Resolves only if the entire chain from desired trustkey to first perfect was supervised and trusted
### Module usage examples with [supervisor][2] repl interface

#### Construct promise:
Use `trustkey_first_perfect_constructor` method to generate seed and validate params.
Request:
```javascript
services.promise.resolve({
    "_f": "trustkey_first_perfect_constructor",
    "server_id": "D000000000000000",
    "trustkey_ts": 1520364270,
    "n_bytes": 64,
    "b64_buffers": true
}, (res) => console.log(res))
```
Positive `b64_buffers` property tells promise module to encode node js Buffers with base64

Response:
```json
{ "success": true,
  "result": 
   { "_f": "trustkey_first_perfect",
     "server_id": "D000000000000000",
     "trustkey_ts": 1520364270,
     "b64_buffers": true,
     "server_round_time": 10,
     "seed": "EdR+476vM5cbvWR1yaZJ6xzsY6cY6Xz76tM7deFFT11XtGDifj4lWa0xtAYBWYTzU9mV05RSG+oMEfIiSJUKsA==" } }
```

#### Resolve promise:
Request:
```javascript
//Based on previous response
services.promise.resolve({ "_f": "trustkey_first_perfect",
    "server_id": "D000000000000000",
    "trustkey_ts": 1520364270,
    "b64_buffers": true,
    "server_round_time": 10,
    "seed": "EdR+476vM5cbvWR1yaZJ6xzsY6cY6Xz76tM7deFFT11XtGDifj4lWa0xtAYBWYTzU9mV05RSG+oMEfIiSJUKsA=="}, (res) => console.log(res))
```

Response:
```javascript
{ success: true,
  result: 'CzJ9GlCcDNzOuKSk7STm8fJ688LriiZiU84YOFOxKRDYfjROGaFQTr41fuwAayTdco4hz4ltuSJkHPOtrZ8Bbw==' }
```

Error response example(error codes listed in `errorCodes.js`):
```json
{ "error_code": 7,
  "error": "Trustkey chain from target trustkey to perfect one haven't been supervised or isn't trusted" }
```

[0]: https://github.com/TrustKey/promise
[2]: https://github.com/TrustKey/supervisor
