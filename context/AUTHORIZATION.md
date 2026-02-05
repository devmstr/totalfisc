# AUTHORIZATION.md
# TOTALFISC - Authorization & RBAC System

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Security Level:** High  

---

## Table of Contents

1. [Authorization Overview](#authorization-overview)
2. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
3. [Permission System](#permission-system)
4. [Role Definitions](#role-definitions)
5. [Permission Matrix](#permission-matrix)
6. [Implementation](#implementation)
7. [Resource-Level Permissions](#resource-level-permissions)
8. [API Authorization](#api-authorization)
9. [Frontend Authorization](#frontend-authorization)

---

## Authorization Overview

### Authorization vs Authentication

| Concept | Question | Example |
|---------|----------|---------|
| **Authentication** | *Who are you?* | Login with username/password |
| **Authorization** | *What can you do?* | Can you post journal entries? |

### Authorization Strategy

TOTALFISC uses **Role-Based Access Control (RBAC)** with granular permissions.

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHORIZATION FLOW                         │
│                                                              │
│  1. User Authenticated (JWT Token)                          │
│     │                                                        │
│     ├─► Extract Role from Token Claims                      │
│     ├─► Extract Permissions from Token Claims               │
│     │                                                        │
│  2. Request Received (e.g., POST /api/journals)            │
│     │                                                        │
│     ├─► [Authorize] Attribute on Controller                │
│     ├─► Check Required Permission: "journals.create"        │
│     │                                                        │
│  3. Permission Check                                        │
│     │                                                        │
│     ├─► Does user have "journals.create" permission?        │
│     │   │                                                    │
│     │   ├─► YES: Continue to handler                        │
│     │   └─► NO: Return 403 Forbidden                        │
│     │                                                        │
│  4. Resource-Level Check (Optional)                         │
│     │                                                        │
│     └─► Can user access this specific journal entry?        │
         ├─► Check ownership or organization                   │
         └─► Return 403 if unauthorized                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Role-Based Access Control (RBAC)

### RBAC Model

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Users     │ ◄───── │    Roles     │ ───────► │ Permissions  │
└──────────────┘         └──────────────┘         └──────────────┘
      1:N                       N:M                      

Example:
  User "John Doe" 
    ├─► has Role "Accountant"
    │       ├─► has Permission "journals.create"
    │       ├─► has Permission "journals.read"
    │       └─► has Permission "journals.update"
    └─► BUT NOT "journals.post" (Administrator only)
```

### Database Schema

```sql
-- Roles (predefined)
CREATE TABLE Roles (
    RoleId TEXT PRIMARY KEY,
    RoleName TEXT NOT NULL UNIQUE,
    Description TEXT,
    IsSystemRole INTEGER NOT NULL DEFAULT 1  -- Cannot be deleted
);

-- Permissions (predefined)
CREATE TABLE Permissions (
    PermissionId TEXT PRIMARY KEY,
    PermissionKey TEXT NOT NULL UNIQUE,     -- "journals.create"
    PermissionName TEXT NOT NULL,           -- "Create Journal Entries"
    Category TEXT NOT NULL,                 -- "Journals", "Reports", etc.
    Description TEXT
);

-- Role-Permission Mapping
CREATE TABLE RolePermissions (
    RolePermissionId TEXT PRIMARY KEY,
    RoleId TEXT NOT NULL,
    PermissionId TEXT NOT NULL,
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId),
    FOREIGN KEY (PermissionId) REFERENCES Permissions(PermissionId),
    UNIQUE (RoleId, PermissionId)
);

-- User-Role Assignment (from Users table)
-- Users.Role = 'Administrator' | 'Accountant' | 'Viewer' | 'Auditor'
```

---

## Permission System

### Permission Naming Convention

**Format:** `{resource}.{action}`

**Examples:**
- `journals.create` - Create journal entries
- `journals.read` - View journal entries
- `journals.update` - Edit journal entries (draft only)
- `journals.post` - Post journal entries (immutable)
- `journals.void` - Void posted entries
- `journals.delete` - Delete draft entries

### Permission Categories

| Category | Description | Example Permissions |
|----------|-------------|-------------------|
| **journals** | Journal entry management | create, read, update, post, void, delete |
| **accounts** | Chart of Accounts | create, read, update, delete |
| **thirdparties** | Clients/Suppliers | create, read, update, delete |
| **reports** | Financial reports | read, export |
| **fiscal** | Fiscal year management | create, lock, close |
| **users** | User management | create, read, update, delete, reset_password |
| **system** | System settings | read, update |
| **audit** | Audit log | read, export |

### Permission List

```csharp
public static class Permissions
{
    // Journals
    public const string JournalsCreate = "journals.create";
    public const string JournalsRead = "journals.read";
    public const string JournalsUpdate = "journals.update";
    public const string JournalsPost = "journals.post";
    public const string JournalsVoid = "journals.void";
    public const string JournalsDelete = "journals.delete";

    // Accounts
    public const string AccountsCreate = "accounts.create";
    public const string AccountsRead = "accounts.read";
    public const string AccountsUpdate = "accounts.update";
    public const string AccountsDelete = "accounts.delete";

    // Third Parties
    public const string ThirdPartiesCreate = "thirdparties.create";
    public const string ThirdPartiesRead = "thirdparties.read";
    public const string ThirdPartiesUpdate = "thirdparties.update";
    public const string ThirdPartiesDelete = "thirdparties.delete";

    // Reports
    public const string ReportsRead = "reports.read";
    public const string ReportsExport = "reports.export";

    // Fiscal Year
    public const string FiscalCreate = "fiscal.create";
    public const string FiscalLock = "fiscal.lock";
    public const string FiscalClose = "fiscal.close";

    // Users
    public const string UsersCreate = "users.create";
    public const string UsersRead = "users.read";
    public const string UsersUpdate = "users.update";
    public const string UsersDelete = "users.delete";
    public const string UsersResetPassword = "users.reset_password";

    // System
    public const string SystemRead = "system.read";
    public const string SystemUpdate = "system.update";

    // Audit
    public const string AuditRead = "audit.read";
    public const string AuditExport = "audit.export";
}
```

---

## Role Definitions

### 1. Administrator

**Description:** Full system access, can manage users and system settings

**Permissions:** **ALL** (wildcard `*`)

**Typical Users:**
- System administrator
- Company owner
- IT manager

**Characteristics:**
- Cannot be locked out
- Bypasses all permission checks
- Can modify fiscal years even when locked
- Can reset any user password
- Access to audit logs

---

### 2. Accountant

**Description:** Core accounting user, can create and post entries

**Permissions:**
```yaml
journals:
  - journals.create
  - journals.read
  - journals.update
  - journals.post       # KEY: Can post entries
  - journals.void
  - journals.delete

accounts:
  - accounts.read
  - accounts.create     # Can add new accounts
  - accounts.update

thirdparties:
  - thirdparties.create
  - thirdparties.read
  - thirdparties.update
  - thirdparties.delete

reports:
  - reports.read
  - reports.export

fiscal:
  - fiscal.create       # Can create new fiscal years
```

**Cannot:**
- ❌ Manage users
- ❌ Modify system settings
- ❌ Lock/close fiscal years (Administrator only)
- ❌ View audit logs

---

### 3. Viewer (Read-Only)

**Description:** View-only access for managers, analysts

**Permissions:**
```yaml
journals:
  - journals.read

accounts:
  - accounts.read

thirdparties:
  - thirdparties.read

reports:
  - reports.read
  - reports.export      # Can export reports
```

**Cannot:**
- ❌ Create, update, or delete anything
- ❌ Post entries
- ❌ Modify data

---

### 4. Auditor

**Description:** Read-only access + audit log review

**Permissions:**
```yaml
journals:
  - journals.read

accounts:
  - accounts.read

thirdparties:
  - thirdparties.read

reports:
  - reports.read
  - reports.export

audit:
  - audit.read          # KEY: Can view audit logs
  - audit.export        # Can export audit trail
```

**Special Access:**
- Can view complete audit trail
- Can see all user activities
- Cannot modify any data
- Useful for external auditors

---

## Permission Matrix

### Complete Permission Grid

| Permission | Administrator | Accountant | Viewer | Auditor |
|-----------|--------------|-----------|--------|---------|
| **Journals** |
| journals.create | ✅ | ✅ | ❌ | ❌ |
| journals.read | ✅ | ✅ | ✅ | ✅ |
| journals.update | ✅ | ✅ | ❌ | ❌ |
| journals.post | ✅ | ✅ | ❌ | ❌ |
| journals.void | ✅ | ✅ | ❌ | ❌ |
| journals.delete | ✅ | ✅ | ❌ | ❌ |
| **Accounts** |
| accounts.create | ✅ | ✅ | ❌ | ❌ |
| accounts.read | ✅ | ✅ | ✅ | ✅ |
| accounts.update | ✅ | ✅ | ❌ | ❌ |
| accounts.delete | ✅ | ❌ | ❌ | ❌ |
| **Third Parties** |
| thirdparties.create | ✅ | ✅ | ❌ | ❌ |
| thirdparties.read | ✅ | ✅ | ✅ | ✅ |
| thirdparties.update | ✅ | ✅ | ❌ | ❌ |
| thirdparties.delete | ✅ | ✅ | ❌ | ❌ |
| **Reports** |
| reports.read | ✅ | ✅ | ✅ | ✅ |
| reports.export | ✅ | ✅ | ✅ | ✅ |
| **Fiscal Year** |
| fiscal.create | ✅ | ✅ | ❌ | ❌ |
| fiscal.lock | ✅ | ❌ | ❌ | ❌ |
| fiscal.close | ✅ | ❌ | ❌ | ❌ |
| **Users** |
| users.create | ✅ | ❌ | ❌ | ❌ |
| users.read | ✅ | ❌ | ❌ | ❌ |
| users.update | ✅ | ❌ | ❌ | ❌ |
| users.delete | ✅ | ❌ | ❌ | ❌ |
| users.reset_password | ✅ | ❌ | ❌ | ❌ |
| **System** |
| system.read | ✅ | ❌ | ❌ | ❌ |
| system.update | ✅ | ❌ | ❌ | ❌ |
| **Audit** |
| audit.read | ✅ | ❌ | ❌ | ✅ |
| audit.export | ✅ | ❌ | ❌ | ✅ |

---

## Implementation

### Permission Service

```csharp
public interface IPermissionService
{
    Task<IEnumerable<string>> GetUserPermissionsAsync(string userId);
    Task<bool> UserHasPermissionAsync(string userId, string permission);
    Task<IEnumerable<string>> GetRolePermissionsAsync(string roleName);
}

public class PermissionService : IPermissionService
{
    private readonly IUserRepository _userRepository;
    private readonly IRolePermissionRepository _rolePermissionRepository;

    public async Task<IEnumerable<string>> GetUserPermissionsAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return Enumerable.Empty<string>();

        // Administrators have all permissions
        if (user.Role == UserRole.Administrator)
        {
            return new[] { "*" }; // Wildcard = all permissions
        }

        // Get permissions for user's role
        return await GetRolePermissionsAsync(user.Role.ToString());
    }

    public async Task<bool> UserHasPermissionAsync(string userId, string permission)
    {
        var permissions = await GetUserPermissionsAsync(userId);

        // Check for wildcard (Administrator)
        if (permissions.Contains("*")) return true;

        // Check for specific permission
        return permissions.Contains(permission);
    }

    public async Task<IEnumerable<string>> GetRolePermissionsAsync(string roleName)
    {
        // This would query RolePermissions table
        // For now, hardcoded mapping
        return roleName switch
        {
            "Administrator" => new[] { "*" },
            "Accountant" => new[]
            {
                Permissions.JournalsCreate,
                Permissions.JournalsRead,
                Permissions.JournalsUpdate,
                Permissions.JournalsPost,
                Permissions.JournalsVoid,
                Permissions.JournalsDelete,
                Permissions.AccountsCreate,
                Permissions.AccountsRead,
                Permissions.AccountsUpdate,
                Permissions.ThirdPartiesCreate,
                Permissions.ThirdPartiesRead,
                Permissions.ThirdPartiesUpdate,
                Permissions.ThirdPartiesDelete,
                Permissions.ReportsRead,
                Permissions.ReportsExport,
                Permissions.FiscalCreate
            },
            "Viewer" => new[]
            {
                Permissions.JournalsRead,
                Permissions.AccountsRead,
                Permissions.ThirdPartiesRead,
                Permissions.ReportsRead,
                Permissions.ReportsExport
            },
            "Auditor" => new[]
            {
                Permissions.JournalsRead,
                Permissions.AccountsRead,
                Permissions.ThirdPartiesRead,
                Permissions.ReportsRead,
                Permissions.ReportsExport,
                Permissions.AuditRead,
                Permissions.AuditExport
            },
            _ => Enumerable.Empty<string>()
        };
    }
}
```

---

## Resource-Level Permissions

### Concept

**Role-Level:** Can user create journal entries?  
**Resource-Level:** Can user edit *this specific* journal entry?

### Ownership Check

```csharp
public class JournalEntryAuthorizationHandler : IResourceAuthorizationHandler<JournalEntry>
{
    public Task<bool> CanAccessAsync(User user, JournalEntry entry, string operation)
    {
        // Administrators can access everything
        if (user.Role == UserRole.Administrator)
            return Task.FromResult(true);

        // Users can only edit their own draft entries
        if (operation == "update")
        {
            return Task.FromResult(
                entry.Status == EntryStatus.Draft && 
                entry.CreatedBy == user.UserId
            );
        }

        // Posted entries: read-only for all
        if (operation == "read")
        {
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }
}
```

---

## API Authorization

### ASP.NET Core Authorization

#### Custom Authorization Attribute

```csharp
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequirePermissionAttribute : Attribute, IAuthorizationRequirement
{
    public string Permission { get; }

    public RequirePermissionAttribute(string permission)
    {
        Permission = permission;
    }
}

public class PermissionAuthorizationHandler : AuthorizationHandler<RequirePermissionAttribute>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RequirePermissionAttribute requirement)
    {
        // Get user permissions from JWT claims
        var permissionClaims = context.User.FindAll("permission").Select(c => c.Value);

        // Check for wildcard (Administrator)
        if (permissionClaims.Contains("*"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Check for specific permission
        if (permissionClaims.Contains(requirement.Permission))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Permission not found
        context.Fail();
        return Task.CompletedTask;
    }
}
```

#### Usage in Controllers

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize] // Require authentication
public class JournalEntriesController : ControllerBase
{
    [HttpGet]
    [RequirePermission(Permissions.JournalsRead)]
    public async Task<IActionResult> GetAll()
    {
        // All authenticated users with journals.read permission
        // can access this endpoint
    }

    [HttpPost]
    [RequirePermission(Permissions.JournalsCreate)]
    public async Task<IActionResult> Create([FromBody] CreateJournalEntryCommand command)
    {
        // Only users with journals.create permission
    }

    [HttpPost("{id}/post")]
    [RequirePermission(Permissions.JournalsPost)]
    public async Task<IActionResult> Post(string id)
    {
        // Only users with journals.post permission
        // (Administrators and Accountants)
    }

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.JournalsDelete)]
    public async Task<IActionResult> Delete(string id)
    {
        var entry = await _repository.GetByIdAsync(id);

        // Resource-level check
        if (entry.Status != EntryStatus.Draft)
        {
            return BadRequest("Cannot delete posted entries");
        }

        // Only allow deleting own entries (unless Administrator)
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Administrator" && entry.CreatedBy != userId)
        {
            return Forbid(); // 403 Forbidden
        }

        await _mediator.Send(new DeleteJournalEntryCommand { EntryId = id });
        return NoContent();
    }
}
```

### Registration in Program.cs

```csharp
// Add authorization services
builder.Services.AddAuthorization(options =>
{
    // Default policy: must be authenticated
    options.DefaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    // Permission-based policies
    options.AddPolicy("RequireAdministrator", policy =>
        policy.RequireRole("Administrator"));

    options.AddPolicy("CanPostEntries", policy =>
        policy.RequireClaim("permission", Permissions.JournalsPost));
});

// Register custom authorization handler
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();
```

---

## Frontend Authorization

### Permission-Based UI Rendering

```typescript
// src/hooks/usePermissions.ts
import { useAuthStore } from '@/stores/authStore';

export const usePermissions = () => {
  const { user } = useAuthStore();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Administrators have all permissions
    if (user.role === 'Administrator') return true;

    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions };
};
```

### Conditional Rendering

```typescript
// src/components/common/PermissionGuard.tsx
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

### Usage in Components

```typescript
// Journal Entry Form
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { Permissions } from '@/lib/constants';

export const JournalEntryDetail: React.FC = () => {
  return (
    <div>
      <h1>Journal Entry #{entryNumber}</h1>

      {/* Show Post button only to users with journals.post permission */}
      <PermissionGuard permission={Permissions.JournalsPost}>
        <Button onClick={handlePost}>Post Entry</Button>
      </PermissionGuard>

      {/* Show Edit button only to users with journals.update permission */}
      <PermissionGuard permission={Permissions.JournalsUpdate}>
        <Button onClick={handleEdit}>Edit Entry</Button>
      </PermissionGuard>

      {/* Show Delete button only to users with journals.delete permission */}
      <PermissionGuard permission={Permissions.JournalsDelete}>
        <Button variant="destructive" onClick={handleDelete}>
          Delete Entry
        </Button>
      </PermissionGuard>
    </div>
  );
};
```

### Protected Routes

```typescript
// src/router/guards.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  permission?: string;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  permission,
  children,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(user, permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Usage in router
<Route
  path="/users"
  element={
    <ProtectedRoute permission={Permissions.UsersRead}>
      <UserManagement />
    </ProtectedRoute>
  }
/>
```

---

## Conclusion

The TOTALFISC authorization system provides:

✅ **Role-Based Access Control** - 4 predefined roles with clear responsibilities  
✅ **Granular Permissions** - 30+ permissions across 8 categories  
✅ **Resource-Level Security** - Check ownership and state  
✅ **API Protection** - Custom authorization attributes  
✅ **UI Integration** - Permission-based rendering and routing  
✅ **Audit Trail** - All authorization failures logged  

This authorization framework ensures users can only perform actions they're explicitly permitted to, meeting enterprise security requirements while maintaining usability.

---

**Related Documents:**
- [AUTHENTICATION.md](AUTHENTICATION.md) - User authentication and JWT tokens
- [AUDIT_TRAIL.md](AUDIT_TRAIL.md) - Complete activity logging
- [DATA_SECURITY.md](DATA_SECURITY.md) - Data protection mechanisms
