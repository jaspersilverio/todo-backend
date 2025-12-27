# 🚂 Railway Deployment Guide

This guide is specifically for deploying the To-Do List backend to Railway.

## ✅ Pre-Deployment Checklist

- [x] Uses `process.env.PORT` (not hardcoded)
- [x] All DB config via environment variables
- [x] No localhost references in production code
- [x] Graceful error handling (won't crash if DB unavailable)
- [x] Multi-tenant ready (userId filtering)
- [x] Production-ready error messages

## 🚀 Step-by-Step Deployment

### 1. Push to GitHub

Make sure your code is on GitHub:
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### 3. Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Railway will detect it's a Node.js project

### 4. Add MySQL Database

1. In your project, click **"New"**
2. Select **"Database"** → **"MySQL"**
3. Railway will create a MySQL database
4. **Note the database service name** (e.g., "MySQL")

### 5. Configure Environment Variables

1. Click on your **backend service** (not the database)
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Add these variables:

```
DB_HOST=${{MySQL.MYSQLHOST}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
PORT=${{PORT}}
FRONTEND_URL=*
NODE_ENV=production
```

**Important**: Railway provides database variables automatically. Use the `${{ServiceName.VARIABLE}}` syntax to reference them.

### 6. Set Root Directory (if needed)

1. Go to **Settings** → **Root Directory**
2. Set to: `backend`
3. This tells Railway where your `package.json` is

### 7. Deploy

Railway will automatically:
- Install dependencies (`npm install`)
- Run `npm start`
- Expose your app on a public URL

### 8. Get Your Backend URL

1. Click on your service
2. Go to **Settings** → **Domains**
3. Railway provides a URL like: `https://your-app.railway.app`
4. **Copy this URL** - you'll need it for the frontend

### 9. Test Your Deployment

1. Test health endpoint:
   ```
   https://your-app.railway.app/api/health
   ```
   Should return: `{"status":"OK","message":"Server is running",...}`

2. Test root endpoint:
   ```
   https://your-app.railway.app/
   ```
   Should return API information

## 🔧 Railway-Specific Configuration

### Environment Variables Reference

Railway automatically provides:
- `PORT` - Port your app should listen on
- `RAILWAY_ENVIRONMENT` - Environment name
- Database variables (if you added MySQL service)

### Database Connection

Railway MySQL provides:
- `MYSQLHOST` - Database host
- `MYSQLUSER` - Database user
- `MYSQLPASSWORD` - Database password
- `MYSQLDATABASE` - Database name
- `MYSQLPORT` - Database port (usually 3306)

Use these in your environment variables as shown in step 5.

## 🐛 Troubleshooting

### App won't start
- Check **Deployments** tab for build logs
- Verify `package.json` has `start` script
- Check environment variables are set

### Database connection errors
- Verify database service is running
- Check environment variables reference correct service
- Look for connection errors in logs

### 502 Bad Gateway
- App might be crashing on startup
- Check logs in **Deployments** tab
- Verify database is accessible

### Port errors
- Make sure you're using `process.env.PORT`
- Railway sets this automatically

## 📊 Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory usage
- **Deployments**: Deployment history

## 🔄 Updating Your App

1. Push changes to GitHub
2. Railway auto-deploys (if enabled)
3. Or manually trigger deployment

## ✅ Post-Deployment

After deployment:
1. Test all API endpoints
2. Verify database connection
3. Test user registration
4. Test task CRUD operations
5. Update frontend with backend URL

## 🔗 Next Steps

1. **Update Frontend**: Set `window.API_BASE_URL` to your Railway URL
2. **Deploy Frontend**: Use Netlify, Vercel, or Railway
3. **Test End-to-End**: Verify full app works

---

**Your backend is now live on Railway!** 🎉

