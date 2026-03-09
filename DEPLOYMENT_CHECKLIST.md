# Production Deployment Checklist

After migrating from sql.js to libsql with Turso support, follow these steps to deploy to production.

## ✅ Setup Complete

The application is now fully configured for production deployment:

- [x] Migrated from sql.js to @libsql/client
- [x] Added Turso database support
- [x] Graceful database connection shutdown
- [x] Environment variable configuration
- [x] Development and production documentation
- [x] All 139 tests passing
- [x] Dev server tested and working

## 📋 Pre-Deployment Checklist

### 1. Verify Local Development
```bash
# Ensure everything works locally
pnpm install
pnpm test          # All tests should pass
pnpm run dev       # Server should start
```

### 2. Create Turso Database
```bash
# Install Turso CLI if needed
brew install turso

# Login
turso auth login

# Create database
turso db create easy-flags

# Get credentials
turso db show easy-flags --url
turso db tokens create easy-flags
```

### 3. Set Up Vercel Project

#### Option A: New Project
```bash
# Push to GitHub first
git push origin main

# Go to https://vercel.com/new
# Import your repository
```

#### Option B: Existing Project
```bash
# If already deployed, just add environment variables
```

### 4. Configure Vercel Environment Variables

In Vercel Project Settings → Environment Variables, add:

| Name | Value | Production | Preview | Development |
|------|-------|-----------|---------|-------------|
| `DATABASE_URL` | `libsql://your-db-name-your-org.turso.io` | ✓ | ✓ | ✓ |
| `DATABASE_AUTH_TOKEN` | Your Turso token | ✓ | ✓ | ✓ |
| `JWT_SECRET` | Your secret key | ✓ | ✓ | ✓ |
| `ADMIN_USER` | `admin` | ✓ | ✓ | ✓ |
| `ADMIN_PASS` | Your password | ✓ | ✓ | ✓ |
| `STRIPE_SECRET_KEY` | Your key | ✓ | ✓ | ✓ |

### 5. Deploy

```bash
# Commit and push (triggers automatic deployment)
git commit -m "prod: deploy to Vercel with Turso"
git push origin main
```

Monitor deployment in Vercel dashboard. The server will:
1. Install dependencies
2. Build TypeScript
3. Run migrations on database connection
4. Create default admin user
5. Start server

### 6. Verify Production Deployment

1. **Check Deployment Status**
   - Vercel dashboard shows green checkmark
   - Server logs show "Server running on..."

2. **Test Database Connection**
   - Visit your deployed URL (e.g., https://your-project.vercel.app)
   - Login with admin credentials
   - Navigate to different pages

3. **Monitor Performance**
   - Check Turso console for query metrics
   - Vercel analytics for traffic/errors

## 🔑 Environment Variables Reference

### Development (Local SQLite)
```bash
PORT=3000
DATABASE_URL=file:./data.db
JWT_SECRET=your-secret-key
ADMIN_USER=admin
ADMIN_PASS=your-password
STRIPE_SECRET_KEY=sk_test_...
```

### Production (Turso)
```bash
PORT=3000
DATABASE_URL=libsql://your-db-name-your-org.turso.io
DATABASE_AUTH_TOKEN=eyJhbGciOiJFZENTU0E...
JWT_SECRET=your-secret-key
ADMIN_USER=admin
ADMIN_PASS=your-password
STRIPE_SECRET_KEY=sk_live_...
```

## 🚀 Deployment Environments

### Vercel (Recommended)
- Best for: Serverless, edge deployment, zero-config
- Cost: Free tier available
- Setup time: < 5 minutes
- Guide: See README.md

### AWS Lambda
- Best for: Large-scale, custom infrastructure
- Cost: Pay per request
- Setup time: 15-30 minutes
- Additional setup needed

### Self-Hosted
- Best for: Complete control, on-premises
- Cost: Hosting + infrastructure
- Setup time: 30+ minutes
- Guide: Run `pnpm start` after building

## 📊 Monitoring

### Turso Console
- Database: https://app.turso.tech
- View queries, latency, storage usage
- Manage tokens and replicas

### Vercel Dashboard
- Deployment: https://vercel.com/dashboard
- View logs, environment variables, domains
- Configure custom domains

## 🔒 Security Considerations

- [ ] Use strong JWT_SECRET (30+ characters)
- [ ] Use strong ADMIN_PASS
- [ ] Enable Stripe in production with live keys
- [ ] Rotate DATABASE_AUTH_TOKEN quarterly
- [ ] Monitor Turso logs for unauthorized access
- [ ] Enable Vercel edge middleware for rate limiting
- [ ] Use HTTPS only (automatic with Vercel)

## 🆘 Troubleshooting

### Database Connection Fails
```bash
# Check credentials in Vercel
# Verify Turso database exists
turso db list

# Regenerate token if needed
turso db tokens create easy-flags

# Update in Vercel environment variables
```

### Admin User Not Created
```bash
# Check logs in Vercel
# Verify ADMIN_USER and ADMIN_PASS are set
# Check database migrations table

turso db shell easy-flags
> SELECT * FROM migrations;
> SELECT * FROM users;
```

### Slow Queries
```bash
# Check Turso analytics for slow queries
# Add database indexes if needed
# Consider adding read replicas

turso db replicate easy-flags <region>
```

## 📚 Documentation

- [README.md](README.md) - Quick start and overview
- [TURSO_SETUP.md](TURSO_SETUP.md) - Detailed Turso setup
- [DATABASE_INIT.md](DATABASE_INIT.md) - Database schema
- [RBAC.md](RBAC.md) - Role-based access control
- [MIGRATIONS.md](MIGRATIONS.md) - Migration system

## ✨ What's Included

- ✅ SQLite database with automatic migrations
- ✅ Role-based access control (3 roles, 19 permissions)
- ✅ JWT authentication
- ✅ Feature flags per environment
- ✅ Environment management
- ✅ User management
- ✅ Stripe billing integration
- ✅ Complete documentation
- ✅ 139 comprehensive tests
- ✅ Production-ready setup

## 🎯 Next Steps

1. Create Turso database
2. Configure Vercel environment variables
3. Deploy to Vercel
4. Verify production deployment
5. Set up monitoring
6. Configure custom domain (optional)

Need help? See [TURSO_SETUP.md](TURSO_SETUP.md) for detailed instructions!
