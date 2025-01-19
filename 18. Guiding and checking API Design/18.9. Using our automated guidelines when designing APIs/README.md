Running `npm run 18.9` runs the following Spectral command in the `api-repository` folder.
The `guidelines-server` folder simulates a server hosting the guidelines (Spectral rulesets and custom functions and OpenAPI library).

#### Local Spectral installation

```
npx spectral lint api.openapi.yaml -r rules.spectral.yaml
```

#### Global Spectral installation

```
spectral lint api.openapi.yaml -r rules.spectral.yaml
```
