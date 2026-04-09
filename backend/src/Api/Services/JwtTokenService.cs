using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Api.Services;

public sealed class JwtTokenService(IConfiguration configuration)
{
    public string CreateAdminToken(string username)
    {
        var secret = configuration["JWT_SECRET"] ?? throw new InvalidOperationException("Missing JWT_SECRET env var.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, username),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim("role", "admin"),
        };

        var token = new JwtSecurityToken(
            issuer: configuration["JWT_ISSUER"],
            audience: configuration["JWT_AUDIENCE"],
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

