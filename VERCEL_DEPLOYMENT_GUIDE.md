# Vercel Deployment Guide

## Step 1: Install Node.js

1. Go to https://nodejs.org
2. Click on the **LTS (Long Term Support)** version download button
3. Run the downloaded installer (node-vXX.X.X-x64.msi)
4. Follow the installation wizard:
   - Accept the license agreement
   - Use default installation path
   - Make sure "Add to PATH" is checked
   - Click Install
5. Restart PowerShell or your terminal

## Step 2: Verify Node.js Installation

Open PowerShell and run:

```powershell
node --version
npm --version
```

You should see version numbers for both commands.

## Step 3: Install Vercel CLI

In PowerShell, run:

```powershell
npm install -g vercel
```

Wait for the installation to complete.

## Step 4: Navigate to Your Project

```powershell
cd "C:\Users\lapto\OneDrive\Desktop\maxios---cinematic-experience (2)"
```

## Step 5: Login to Vercel

```powershell
vercel login
```

This will open your browser. Choose your preferred login method:
- GitHub
- GitLab
- Bitbucket
- Email

Follow the authentication steps in your browser.

## Step 6: Deploy Your Project

```powershell
vercel
```

You'll be asked several questions:

1. **Set up and deploy?** → Press Enter (Yes)
2. **Which scope?** → Select your account
3. **Link to existing project?** → Press N (No) for first deployment
4. **What's your project's name?** → Press Enter (use default) or type a custom name
5. **In which directory is your code located?** → Press Enter (./)
6. **Want to override settings?** → Press N (No)

The deployment will start. Wait for it to complete.

## Step 7: Add Environment Variables

After first deployment, add your API key:

```powershell
vercel env add GEMINI_API_KEY
```

When prompted:
1. Enter the value of your GEMINI_API_KEY (from .env.local file)
2. Select environments: Choose **Production**, **Preview**, and **Development** (use spacebar to select)
3. Press Enter to confirm

## Step 8: Redeploy with Environment Variables

```powershell
vercel --prod
```

This will redeploy your project with the environment variables.

## Step 9: Access Your Deployed Project

After deployment completes, you'll see:
- **Preview URL**: A temporary URL for this deployment
- **Production URL**: Your permanent project URL

Your project is now live on Vercel!

## Future Deployments

For future updates, just run:

```powershell
cd "C:\Users\lapto\OneDrive\Desktop\maxios---cinematic-experience (2)"
vercel --prod
```

## Troubleshooting

### If 'npm' is not recognized:
- Make sure Node.js is installed
- Restart PowerShell/Terminal
- Check if Node.js is in your PATH

### If 'vercel' is not recognized:
- Run: `npm install -g vercel` again
- Restart PowerShell/Terminal

### If deployment fails:
- Check that your GEMINI_API_KEY is set correctly
- Make sure all dependencies are in package.json
- Check Vercel dashboard for error logs

## Vercel Dashboard

You can manage your project at: https://vercel.com/dashboard

Here you can:
- View deployments
- Manage environment variables
- Configure custom domains
- View analytics and logs
