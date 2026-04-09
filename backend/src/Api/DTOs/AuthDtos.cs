namespace Api.DTOs;

public sealed record LoginRequest(string Username, string Password);

public sealed record LoginResponse(string Token);

