# Backend (ASP.NET Core)

## Variables de entorno

- **DB**
  - `DATABASE_URL`: URL/connection string de Postgres (Neon).
  - Alternativa: `ConnectionStrings__Default`
- **Auth**
  - `ADMIN_USERNAME` (default: `admin`)
  - `ADMIN_PASSWORD` (default: `admin`)
  - `JWT_SECRET` (**obligatorio**)
- **CORS**
  - `CORS_ORIGINS`: lista separada por comas (ej. `https://tu-app.vercel.app`)

## Run local

```bash
dotnet run --project backend/src/Api/Api.csproj
```

## Docker (Render)

Render puede construir desde este `backend/Dockerfile`.

