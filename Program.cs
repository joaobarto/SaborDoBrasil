using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using Dapper;
using MySql.Data.MySqlClient;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

string connStr = "Server=localhost;Database=SabordoBrasil;Uid=root;Pwd=1234;";

// Arquivos estáticos
app.UseDefaultFiles();
app.UseStaticFiles();

// Página inicial
app.MapGet("/", async ctx =>
{
    await ctx.Response.SendFileAsync("wwwroot/index.html");
});

// GET: publicações
app.MapGet("/api/publicacoes", async (HttpContext ctx) =>
{
    var userId = ctx.Request.Query["usuario_id"];
    var sql = @"
        SELECT p.id, p.nome_prato, p.local, p.cidade, p.foto, p.createdat, p.updatedat, p.usuario_id, u.nickname
        FROM publicacao p
        JOIN usuario u ON p.usuario_id = u.id";

    if (!string.IsNullOrEmpty(userId))
        sql += " WHERE p.usuario_id = @uid";

    sql += " ORDER BY p.createdat DESC";

    using var con = new MySqlConnection(connStr);
    var pubs = await con.QueryAsync(sql, new { uid = userId });
    await ctx.Response.WriteAsJsonAsync(pubs);
});

// POST: login
app.MapPost("/api/usuario/login", async ctx =>
{
    var dto = await JsonSerializer.DeserializeAsync<LoginRequest>(ctx.Request.Body);
    if (dto == null)
    {
        ctx.Response.StatusCode = 400;
        await ctx.Response.WriteAsync("Dados inválidos.");
        return;
    }

    using var con = new MySqlConnection(connStr);
    var user = await con.QueryFirstOrDefaultAsync<Usuario>(
        "SELECT * FROM usuario WHERE email = @Email AND senha = @Senha", dto);

    if (user != null)
        await ctx.Response.WriteAsJsonAsync(user);
    else
        ctx.Response.StatusCode = 401;
});

// POST: cadastro
app.MapPost("/api/usuario/cadastrar", async ctx =>
{
    var dto = await JsonSerializer.DeserializeAsync<CadastroRequest>(ctx.Request.Body);
    if (dto == null)
    {
        ctx.Response.StatusCode = 400;
        await ctx.Response.WriteAsync("Dados inválidos.");
        return;
    }

    using var con = new MySqlConnection(connStr);
    int exists = await con.QueryFirstOrDefaultAsync<int>(
        "SELECT COUNT(*) FROM usuario WHERE email = @Email", dto);

    if (exists > 0)
    {
        ctx.Response.StatusCode = 409;
        await ctx.Response.WriteAsync("Email já cadastrado.");
        return;
    }

    await con.ExecuteAsync(@"
        INSERT INTO usuario (nome, email, senha, nickname, createdat, updatedat)
        VALUES (@Nome, @Email, @Senha, @Nickname, NOW(), NOW())", dto);

    ctx.Response.StatusCode = 201;
});

// GET: estatísticas de interações
app.MapGet("/api/usuario/{userId:int}/interacoes", async (int userId, HttpContext ctx) =>
{
    using var con = new MySqlConnection(connStr);

    var stats = await con.QueryFirstAsync<InteracaoStats>(@"
        SELECT 
            COALESCE(SUM(i.interacao_id = 1), 0) AS Likes, 
            COALESCE(SUM(i.interacao_id = 2), 0) AS Dislikes
        FROM curtidas i
        WHERE i.usuario_id = @userId", new { userId });

    await ctx.Response.WriteAsJsonAsync(stats);
});

// POST: interações (curtidas/dislikes)
app.MapPost("/api/interacao", async ctx =>
{
    var dto = await JsonSerializer.DeserializeAsync<InteracaoRequest>(ctx.Request.Body);
    if (dto == null)
    {
        ctx.Response.StatusCode = 400;
        await ctx.Response.WriteAsync("Dados inválidos.");
        return;
    }

    using var con = new MySqlConnection(connStr);

    int? interID = await con.QueryFirstOrDefaultAsync<int?>(
        "SELECT id FROM interacao WHERE nome = @Tipo", dto);

    if (interID == null)
    {
        ctx.Response.StatusCode = 400;
        await ctx.Response.WriteAsync("Tipo de interação inválido.");
        return;
    }

    // Supondo que a tabela tenha chave primária composta (usuario_id, publicacao_id)
    await con.ExecuteAsync(@"
        INSERT INTO curtidas (usuario_id, publicacao_id, interacao_id)
        VALUES (@Usuario_id, @Publicacao_id, @interID)
        ON DUPLICATE KEY UPDATE interacao_id = VALUES(interacao_id)",
        new { dto.Usuario_id, dto.Publicacao_id, interID });

    ctx.Response.StatusCode = 201;
});

// POST: nova publicação
app.MapPost("/api/publicacoes", async ctx =>
{
    var dto = await JsonSerializer.DeserializeAsync<PublicacaoRequest>(ctx.Request.Body);
    if (dto == null)
    {
        ctx.Response.StatusCode = 400;
        await ctx.Response.WriteAsync("Dados inválidos.");
        return;
    }

    using var con = new MySqlConnection(connStr);

    await con.ExecuteAsync(@"
        INSERT INTO publicacao (nome_prato, local, cidade, foto, usuario_id, createdat, updatedat)
        VALUES (@Nome_prato, @Local, @Cidade, @Foto, @Usuario_id, NOW(), NOW())", dto);

    ctx.Response.StatusCode = 201;
});

using var con2 = new MySqlConnection(connStr);
var usuarios = await con2.QueryAsync("SELECT * FROM usuario");

app.Run();


// === Models ===
public record LoginRequest(string Email, string Senha);
public record CadastroRequest(string Nome, string Email, string Senha, string Nickname);
public record InteracaoRequest(int Usuario_id, int Publicacao_id, string Tipo);
public record PublicacaoRequest(string Nome_prato, string Local, string Cidade, string Foto, int Usuario_id);
public record Usuario(int id, string nome, string email, string senha, string nickname, DateTime? createdat, DateTime? updatedat);
public record InteracaoStats(int Likes, int Dislikes);
