# pa-api-storage

## Setup Environment Variables

```
cp .env.dist .env
```

in .env replace templates with real values

```
HOST_ENV={{env}}
NODE_ENV={{env}}
DB_PSWD={{db-password}}
DB_CONNECTION_STRING={{db-connection-string}}
DB_READ_PREFERENCE={{primaryPreferred|secondary|secondaryPreferred|nearest}}
API_AUTH_HOST={{api-auth-host}}
AUTHORIZATION_KEY={{authorization-key}}
```

