using Npgsql;

namespace Api.Data;

public static class ConnectionStringResolver
{
    public static string Resolve(IConfiguration configuration)
    {
        var cs = configuration.GetConnectionString("Default");
        if (!string.IsNullOrWhiteSpace(cs))
            return cs;

        var databaseUrl = configuration["DATABASE_URL"];
        if (string.IsNullOrWhiteSpace(databaseUrl))
            throw new InvalidOperationException("Missing DATABASE_URL or ConnectionStrings:Default.");

        // Neon often provides a postgres URI (postgresql://user:pass@host/db?sslmode=require)
        if (databaseUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            databaseUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return FromPostgresUri(databaseUrl);
        }

        return databaseUrl;
    }

    private static string FromPostgresUri(string uriString)
    {
        var uri = new Uri(uriString);

        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;

        var db = uri.AbsolutePath.Trim('/'); // "/dbname"

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Username = username,
            Password = password,
            Database = db,
            SslMode = SslMode.Require,
        };

        var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
        var sslmode = query["sslmode"];
        if (!string.IsNullOrWhiteSpace(sslmode) &&
            Enum.TryParse<SslMode>(sslmode, true, out var parsed))
        {
            builder.SslMode = parsed;
        }

        return builder.ConnectionString;
    }
}

