Use `npm run 18.5.2` to run the example.

#### Local Spectral installation

```
npx spectral lint api.openapi.yaml -r rules.spectral.yaml
```

You can also activate rules one by one by modifying the `select-rules.spectral.yaml` ruleset and run the following command:

```
npx spectral lint api.openapi.yaml -r select-rules.spectral.yaml
```

#### Global Spectral installation

```
spectral lint api.openapi.yaml -r rules.spectral.yaml
```

You can also activate rules one by one by modifying the `select-rules.spectral.yaml` ruleset and run the following command:

```
spectral lint api.openapi.yaml -r select-rules.spectral.yaml
```