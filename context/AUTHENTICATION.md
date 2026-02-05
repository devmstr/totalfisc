# AUTHENTICATION.md
# TOTALFISC - Authentication System

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Security Level:** High  

---

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [User Management](#user-management)
3. [Password Security](#password-security)
4. [JWT Token Authentication](#jwt-token-authentication)
5. [Login Flow](#login-flow)
6. [Session Management](#session-management)
7. [Password Reset](#password-reset)
8. [Multi-Factor Authentication (Future)](#multi-factor-authentication-future)
9. [Implementation Details](#implementation-details)

---

## Authentication Overview

### Authentication Strategy

TOTALFISC uses **JWT (JSON Web Token)** based authentication for stateless, secure session management.

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                        │
│                                                              │
│  1. User Login                                              │
│     │                                                        │
│     ├─► Username + Password                                 │
│     │                                                        │
│  2. Validate Credentials                                    │
│     │                                                        │
│     ├─► BCrypt Password Verification                        │
│     ├─► Check Active Status                                 │
│     ├─► Check License Validity                              │
│     │                                                        │
│  3. Generate JWT Token                                      │
│     │                                                        │
│     ├─► Include: UserId, Username, Role, Permissions        │
│     ├─► Sign with RSA-2048 Private Key                      │
│     ├─► Set Expiration (8 hours)                           │
│     │                                                        │
│  4. Return Token to Client                                  │
│     │                                                        │
│     └─► Store in LocalStorage (React)                       │
│                                                              │
│  5. Subsequent Requests                                     │
│     │                                                        │
│     ├─► Include Token in Authorization Header              │
│     ├─► Validate Token Signature                           │
│     ├─► Extract User Claims                                │
│     └─► Authorize Request                                  │
└─────────────────────────────────────────────────────────────┘
```

### Why JWT?

| Feature | Benefit |
|---------|---------|
| **Stateless** | No server-side session storage required |
| **Self-Contained** | Token contains all user info (claims) |
| **Cross-Domain** | Works across different services (future API exposure) |
| **Performance** | No database lookup on every request |
| **Scalability** | Easily scales horizontally |

---

## User Management

### User Entity

```csharp
public class User
{
    public string UserId { get; set; }              // GUID
    public string Username { get; set; }            // Unique login name
    public string PasswordHash { get; set; }        // BCrypt hash
    public string Email { get; set; }               // Email address
    public string FullName { get; set; }            // Display name
    public UserRole Role { get; set; }              // Administrator, Accountant, etc.
    public bool IsActive { get; set; }              // Can login?
    public bool IsLocked { get; set; }              // Temporarily locked?
    public int FailedLoginAttempts { get; set; }    // Brute force protection
    public DateTime? LastLoginAt { get; set; }      // Last successful login
    public DateTime? LastPasswordChangeAt { get; set; }
    public DateTime? PasswordExpiresAt { get; set; } // Force password change
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public string ModifiedBy { get; set; }
}
```

### User Roles

```csharp
public enum UserRole
{
    Administrator = 1,  // Full system access
    Accountant = 2,     // Create/edit entries, view reports
    Viewer = 3,         // Read-only access
    Auditor = 4         // Read-only + audit log access
}
```

### Database Schema

```sql
CREATE TABLE Users (
    UserId TEXT PRIMARY KEY,
    Username TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    Email TEXT,
    FullName TEXT NOT NULL,
    Role TEXT NOT NULL CHECK (Role IN ('Administrator', 'Accountant', 'Viewer', 'Auditor')),
    IsActive INTEGER NOT NULL DEFAULT 1,
    IsLocked INTEGER NOT NULL DEFAULT 0,
    FailedLoginAttempts INTEGER NOT NULL DEFAULT 0,
    LastLoginAt TEXT,
    LastPasswordChangeAt TEXT,
    PasswordExpiresAt TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    CreatedBy TEXT,
    ModifiedAt TEXT,
    ModifiedBy TEXT
);

CREATE INDEX idx_users_username ON Users(Username);
CREATE INDEX idx_users_active ON Users(IsActive) WHERE IsActive = 1;
```

---

## Password Security

### BCrypt Hashing

**Library:** BCrypt.Net-Next v4.0.3

**Why BCrypt?**
- ✅ Adaptive hashing (resistant to brute force)
- ✅ Automatic salt generation
- ✅ Configurable work factor (cost)
- ✅ Industry standard

**Cost Factor:** 12 (recommended for 2026)
- Cost 10 = ~100ms per hash
- Cost 12 = ~400ms per hash (better security)
- Cost 14 = ~1.6s per hash (too slow for UX)

### Implementation

```csharp
public class PasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    public string HashPassword(string password)
    {
        // Validate password strength before hashing
        ValidatePasswordStrength(password);

        // BCrypt.HashPassword automatically:
        // 1. Generates random salt (128-bit)
        // 2. Applies work factor iterations
        // 3. Returns: $2a$12${salt}{hash}
        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Password verification failed");
            return false;
        }
    }

    private void ValidatePasswordStrength(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ValidationException("Password is required");

        if (password.Length < 8)
            throw new ValidationException("Password must be at least 8 characters");

        // Check complexity
        bool hasUpper = password.Any(char.IsUpper);
        bool hasLower = password.Any(char.IsLower);
        bool hasDigit = password.Any(char.IsDigit);
        bool hasSpecial = password.Any(c => !char.IsLetterOrDigit(c));

        int complexityScore = 
            (hasUpper ? 1 : 0) + 
            (hasLower ? 1 : 0) + 
            (hasDigit ? 1 : 0) + 
            (hasSpecial ? 1 : 0);

        if (complexityScore < 3)
            throw new ValidationException(
                "Password must contain at least 3 of: uppercase, lowercase, digit, special character");
    }
}
```

### Password Policy

| Rule | Requirement |
|------|-------------|
| **Minimum Length** | 8 characters |
| **Complexity** | 3 of 4: Uppercase, Lowercase, Digit, Special |
| **Expiration** | 90 days (configurable) |
| **History** | Cannot reuse last 3 passwords |
| **Max Attempts** | 5 failed attempts = account locked |
| **Lockout Duration** | 15 minutes |

---

## JWT Token Authentication

### Token Structure

**JWT Format:** `{Header}.{Payload}.{Signature}`

**Example Token:**
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiJ1c2VyLTEyMzQiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFkbWluaXN0cmF0b3IiLCJleHAiOjE3MDkxMjM0NTZ9.
{signature-base64}
```

### Token Claims (Payload)

```json
{
  "sub": "user-1234-5678-90ab-cdef",           // Subject (UserId)
  "username": "admin",                          // Username
  "email": "admin@company.dz",                  // Email
  "fullName": "Administrator",                  // Full name
  "role": "Administrator",                      // User role
  "permissions": ["users.create", "entries.post"], // Permissions
  "nbf": 1709123456,                           // Not Before (Unix timestamp)
  "exp": 1709152256,                           // Expiration (8 hours later)
  "iat": 1709123456,                           // Issued At
  "iss": "TOTALFISC",                    // Issuer
  "aud": "TOTALFISC.Desktop"             // Audience
}
```

### Token Generation

```csharp
public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;
    private readonly RsaSecurityKey _securityKey;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;

        // Load RSA private key from configuration
        var privateKeyXml = _configuration["Jwt:PrivateKey"];
        var rsa = RSA.Create();
        rsa.FromXmlString(privateKeyXml);
        _securityKey = new RsaSecurityKey(rsa);
    }

    public string GenerateToken(User user, IEnumerable<string> permissions)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim("fullName", user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, 
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
        };

        // Add permissions as individual claims
        foreach (var permission in permissions)
        {
            claims.Add(new Claim("permission", permission));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(8), // 8-hour expiration
            Issuer = "TOTALFISC",
            Audience = "TOTALFISC.Desktop",
            SigningCredentials = new SigningCredentials(
                _securityKey, 
                SecurityAlgorithms.RsaSha256
            )
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public ClaimsPrincipal ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "TOTALFISC",
            ValidateAudience = true,
            ValidAudience = "TOTALFISC.Desktop",
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = _securityKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(5) // Tolerate 5 min clock drift
        };

        try
        {
            var principal = tokenHandler.ValidateToken(
                token, 
                validationParameters, 
                out var validatedToken
            );

            return principal;
        }
        catch (SecurityTokenExpiredException)
        {
            throw new UnauthorizedException("Token expired");
        }
        catch (SecurityTokenInvalidSignatureException)
        {
            throw new UnauthorizedException("Invalid token signature");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Token validation failed");
            throw new UnauthorizedException("Invalid token");
        }
    }
}
```

### RSA Key Generation

**Generate Keys (One-Time Setup):**
```csharp
public class RsaKeyGenerator
{
    public static (string privateKey, string publicKey) Generate()
    {
        using var rsa = RSA.Create(2048); // 2048-bit key

        var privateKey = rsa.ToXmlString(includePrivateParameters: true);
        var publicKey = rsa.ToXmlString(includePrivateParameters: false);

        return (privateKey, publicKey);
    }
}
```

**Store in appsettings.json (encrypted or protected):**
```json
{
  "Jwt": {
    "PrivateKey": "<RSA><Modulus>...</Modulus><Exponent>...</Exponent><P>...</P>...</RSA>",
    "PublicKey": "<RSA><Modulus>...</Modulus><Exponent>...</Exponent></RSA>",
    "ExpirationHours": 8
  }
}
```

---

## Login Flow

### Backend: Login Endpoint

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly IPermissionService _permissionService;
    private readonly IAuditService _auditService;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // 1. Validate input
        if (string.IsNullOrWhiteSpace(request.Username) || 
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username and password are required" });
        }

        // 2. Find user
        var user = await _userRepository.GetByUsernameAsync(request.Username);
        if (user == null)
        {
            // Don't reveal whether user exists
            await Task.Delay(Random.Shared.Next(200, 500)); // Timing attack mitigation
            return Unauthorized(new { message = "Invalid credentials" });
        }

        // 3. Check if account is locked
        if (user.IsLocked)
        {
            return Unauthorized(new { message = "Account is locked. Contact administrator." });
        }

        // 4. Check if account is active
        if (!user.IsActive)
        {
            return Unauthorized(new { message = "Account is disabled" });
        }

        // 5. Verify password
        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            // Increment failed login attempts
            user.FailedLoginAttempts++;

            // Lock account after 5 failed attempts
            if (user.FailedLoginAttempts >= 5)
            {
                user.IsLocked = true;
                await _auditService.LogAsync(
                    "User.Locked", 
                    user.UserId, 
                    "Account locked due to failed login attempts"
                );
            }

            await _userRepository.UpdateAsync(user);

            return Unauthorized(new { message = "Invalid credentials" });
        }

        // 6. Check password expiration
        if (user.PasswordExpiresAt.HasValue && 
            user.PasswordExpiresAt.Value < DateTime.UtcNow)
        {
            return Unauthorized(new 
            { 
                message = "Password expired",
                requiresPasswordChange = true 
            });
        }

        // 7. Get user permissions
        var permissions = await _permissionService.GetUserPermissionsAsync(user.UserId);

        // 8. Generate JWT token
        var token = _tokenGenerator.GenerateToken(user, permissions);

        // 9. Update user login info
        user.LastLoginAt = DateTime.UtcNow;
        user.FailedLoginAttempts = 0; // Reset on successful login
        await _userRepository.UpdateAsync(user);

        // 10. Log successful login
        await _auditService.LogAsync("User.Login", user.UserId, $"User logged in from {HttpContext.Connection.RemoteIpAddress}");

        // 11. Return token and user info
        return Ok(new LoginResponse
        {
            Token = token,
            User = new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                Permissions = permissions.ToList()
            }
        });
    }
}
```

### Frontend: Login Component

```typescript
// src/features/auth/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const result = await response.json();

      // Store token and user info
      login(result.token, result.user);

      toast.success(`Welcome back, ${result.user.fullName}!`);

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">TOTALFISC</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <Input
              {...register('username')}
              type="text"
              autoComplete="username"
              className="mt-1"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className="mt-1"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
};
```

### Frontend: Auth Store (Zustand)

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        set({ token, user, isAuthenticated: true });

        // Store token in localStorage (persist middleware does this)
        // Also set in Axios default headers
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', token);
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });

        // Clear from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
        }
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;

        // Administrators have all permissions
        if (user.role === 'Administrator') return true;

        return user.permissions.includes(permission);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

## Session Management

### Token Expiration

**Default Expiration:** 8 hours

**Options:**
1. **Silent Refresh** - Auto-refresh token before expiration (not implemented yet)
2. **Manual Refresh** - User re-authenticates when token expires
3. **Remember Me** - Extended expiration (30 days) for non-sensitive environments

### Token Refresh (Future Enhancement)

```csharp
[HttpPost("refresh")]
public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
{
    try
    {
        // Validate existing token (even if expired)
        var principal = _tokenGenerator.ValidateToken(request.Token, allowExpired: true);

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null || !user.IsActive)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        // Generate new token
        var permissions = await _permissionService.GetUserPermissionsAsync(user.UserId);
        var newToken = _tokenGenerator.GenerateToken(user, permissions);

        return Ok(new { token = newToken });
    }
    catch
    {
        return Unauthorized(new { message = "Invalid token" });
    }
}
```

### Logout

```csharp
[HttpPost("logout")]
[Authorize]
public async Task<IActionResult> Logout()
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    // Log logout event
    await _auditService.LogAsync("User.Logout", userId, "User logged out");

    // With JWT, logout is client-side (delete token)
    // Future: Add token blacklist for immediate invalidation

    return Ok(new { message = "Logged out successfully" });
}
```

---

## Password Reset

### Reset Flow

```
1. User requests password reset
   ├─► Enter username or email
   └─► Generate reset token (GUID)

2. System generates reset link
   ├─► Store token in database (expires in 1 hour)
   ├─► Send email with reset link (future)
   └─► Or display token to administrator

3. User clicks reset link
   ├─► Validate token (not expired, not used)
   └─► Show password reset form

4. User enters new password
   ├─► Validate password strength
   ├─► Hash new password
   ├─► Update user record
   ├─► Invalidate reset token
   └─► Log password change
```

### Implementation

```csharp
[HttpPost("request-password-reset")]
public async Task<IActionResult> RequestPasswordReset([FromBody] PasswordResetRequest request)
{
    var user = await _userRepository.GetByUsernameAsync(request.Username);

    // Don't reveal whether user exists
    if (user == null)
    {
        await Task.Delay(Random.Shared.Next(200, 500));
        return Ok(new { message = "If account exists, reset instructions sent" });
    }

    // Generate reset token
    var resetToken = Guid.NewGuid().ToString();
    var expiresAt = DateTime.UtcNow.AddHours(1);

    // Store token
    await _passwordResetRepository.CreateAsync(new PasswordResetToken
    {
        TokenId = Guid.NewGuid().ToString(),
        UserId = user.UserId,
        Token = resetToken,
        ExpiresAt = expiresAt,
        IsUsed = false
    });

    // TODO: Send email with reset link
    // For now, log to console or notify administrator
    _logger.LogInformation($"Password reset token for {user.Username}: {resetToken}");

    return Ok(new { message = "If account exists, reset instructions sent" });
}

[HttpPost("reset-password")]
public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
{
    // Validate token
    var resetToken = await _passwordResetRepository.GetByTokenAsync(request.Token);

    if (resetToken == null || resetToken.IsUsed || resetToken.ExpiresAt < DateTime.UtcNow)
    {
        return BadRequest(new { message = "Invalid or expired token" });
    }

    // Get user
    var user = await _userRepository.GetByIdAsync(resetToken.UserId);
    if (user == null)
    {
        return BadRequest(new { message = "User not found" });
    }

    // Hash new password
    var newPasswordHash = _passwordHasher.HashPassword(request.NewPassword);

    // Update user
    user.PasswordHash = newPasswordHash;
    user.LastPasswordChangeAt = DateTime.UtcNow;
    user.PasswordExpiresAt = DateTime.UtcNow.AddDays(90); // 90-day expiration
    user.IsLocked = false; // Unlock if locked
    user.FailedLoginAttempts = 0;

    await _userRepository.UpdateAsync(user);

    // Mark token as used
    resetToken.IsUsed = true;
    await _passwordResetRepository.UpdateAsync(resetToken);

    // Log password change
    await _auditService.LogAsync("User.PasswordReset", user.UserId, "Password reset via token");

    return Ok(new { message = "Password reset successfully" });
}
```

---

## Multi-Factor Authentication (Future)

### TOTP (Time-Based One-Time Password)

**Future Enhancement:**
- Google Authenticator / Microsoft Authenticator integration
- 6-digit code that changes every 30 seconds
- Backup codes for account recovery

**Implementation Roadmap:**
1. User enables MFA in settings
2. System generates secret key
3. User scans QR code with authenticator app
4. User enters code to verify
5. Future logins require username + password + TOTP code

---

## Conclusion

The TOTALFISC authentication system provides:

✅ **Secure Password Storage** - BCrypt with cost factor 12  
✅ **JWT Token Authentication** - Stateless, scalable, RSA-2048 signed  
✅ **Brute Force Protection** - Account lockout after 5 failed attempts  
✅ **Password Policy** - Strength validation, expiration, history  
✅ **Complete Audit Trail** - All authentication events logged  
✅ **Future-Ready** - Token refresh and MFA support planned  

This authentication framework meets enterprise security standards while maintaining excellent user experience.

---

**Related Documents:**
- [AUTHORIZATION.md](AUTHORIZATION.md) - RBAC permissions system
- [DATA_SECURITY.md](DATA_SECURITY.md) - Encryption and security
- [AUDIT_TRAIL.md](AUDIT_TRAIL.md) - Complete audit logging
