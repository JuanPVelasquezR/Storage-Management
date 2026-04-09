using Api.DTOs;
using Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IConfiguration configuration, JwtTokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest req)
    {
        var adminUser = configuration["ADMIN_USERNAME"] ?? "admin";
        var adminPass = configuration["ADMIN_PASSWORD"] ?? "admin";

        if (!string.Equals(req.Username, adminUser, StringComparison.Ordinal) ||
            !string.Equals(req.Password, adminPass, StringComparison.Ordinal))
        {
            return Unauthorized(new { message = "Credenciales inválidas." });
        }

        var token = tokens.CreateAdminToken(req.Username);
        return Ok(new LoginResponse(token));
    }
}

