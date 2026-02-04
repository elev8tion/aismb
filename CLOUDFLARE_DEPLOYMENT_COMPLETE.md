# Cloudflare Deployment Guide - kre8tion.com

**Status:** ✅ Ready to Deploy
**Domain:** kre8tion.com
**Project:** ai-smb-partners

---

## ✅ What's Complete

### 1. Cloudflare CLI Installed
- ✅ Wrangler 4.62.0 installed
- ✅ Logged in to account: connect@elev8tion.one

### 2. KV Namespaces Created
- ✅ Production namespace: `2afab9ebf67e4d12874cdaa464079816`
- ✅ Preview namespace: `f1161b244e974e6a8fe4690d35ca4da3`
- ✅ `wrangler.toml` configured with namespace IDs

### 3. Pages Project Created
- ✅ Project name: `ai-smb-partners`
- ✅ Default URL: https://ai-smb-partners.pages.dev
- ✅ Ready for custom domain: kre8tion.com

### 4. Build Configuration Fixed
- ✅ Removed `output: 'export'` from next.config.ts
- ✅ Added `dynamic: 'force-dynamic'` to API routes
- ✅ Production build succeeds

---

## 🚀 Deployment Options

### Option 1: GitHub Auto-Deploy (Recommended) ⭐

This is the easiest and most reliable method for Next.js 16.

#### Step 1: Push to GitHub
```bash
# If not already a git repo
git init
git add .
git commit -m "Ready for Cloudflare Pages deployment"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/ai-smb-partners.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Cloudflare Pages
1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Click **Create** → **Pages** → **Connect to Git**
4. Select your GitHub repository: `ai-smb-partners`
5. Configure build settings:
   - **Framework preset:** Next.js
   - **Build command:** `npm run build`
   - **Build output directory:** `.next`
   - **Node.js version:** 18 or higher

#### Step 3: Add Environment Variables
In the Pages project settings, add these environment variables:
```
OPENAI_API_KEY=sk-...your-key...
NODE_VERSION=18
```

Copy all variables from your `.env.local` file.

#### Step 4: Add Custom Domain (kre8tion.com)
1. In the Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `kre8tion.com`
4. Cloudflare will auto-configure DNS (if kre8tion.com is already in your account)
5. Wait for SSL certificate (~5 minutes)

#### Step 5: Add KV Bindings
1. In Pages project settings, go to **Settings** → **Functions**
2. Under **KV namespace bindings**, add:
   - **Variable name:** `VOICE_SESSIONS`
   - **KV namespace:** Select the VOICE_SESSIONS namespace

---

### Option 2: Manual Deploy (Alternative)

If you prefer manual deployment (not recommended for Next.js 16):

```bash
# This requires @cloudflare/next-on-pages which doesn't support Next.js 16 yet
# Consider downgrading to Next.js 15 or use GitHub auto-deploy instead
```

---

## 📋 Post-Deployment Checklist

### After First Deploy:
- [ ] Check deployment URL: https://ai-smb-partners.pages.dev
- [ ] Verify custom domain: https://kre8tion.com
- [ ] Test voice agent functionality
- [ ] Verify KV session storage working
- [ ] Check API routes responding
- [ ] Test conversation memory across page refreshes

### Environment Variables to Set:
Copy from `.env.local`:
- [ ] `OPENAI_API_KEY`
- [ ] Any other API keys or secrets

### Custom Domain (kre8tion.com):
- [ ] DNS pointing to Cloudflare
- [ ] SSL certificate active
- [ ] Both www and apex domain configured (optional)

---

## 🔍 Verify Deployment

### Test Voice Agent:
1. Visit https://kre8tion.com
2. Click voice agent FAB
3. Ask: "What's your pricing?"
4. Ask follow-up: "What about the middle tier?"
5. ✅ Should remember context

### Test Session Persistence:
1. Have a conversation
2. Refresh page
3. Continue conversation
4. ✅ Should remember previous messages

### Check Server Logs:
In Cloudflare Dashboard → Pages → your project → **Functions**:
- Look for session creation logs
- Verify KV storage operations
- Check for any errors

---

## 🐛 Troubleshooting

### Build Fails on Cloudflare:
**Issue:** "Module not found" or similar
**Fix:** Ensure all dependencies are in `package.json` (not just devDependencies)

### API Routes Not Working:
**Issue:** 404 on /api/* routes
**Fix:** Verify build output directory is `.next` (not `.next/standalone` or `out`)

### KV Not Working:
**Issue:** Sessions not persisting
**Fix:** Verify KV binding is added in Pages settings → Functions → KV namespace bindings

### Environment Variables:
**Issue:** API calls failing with auth errors
**Fix:** Add `OPENAI_API_KEY` in Pages settings → Environment variables

### Custom Domain Not Working:
**Issue:** kre8tion.com not resolving
**Fix:**
1. Verify domain is in your Cloudflare account
2. Check DNS records in DNS settings
3. Wait 5-10 minutes for SSL certificate

---

## 📊 What Changes on Deployment

### Local Development:
- Uses in-memory session storage
- Sessions cleared on server restart
- Fast hot-reload

### Cloudflare Production:
- Uses KV session storage
- Sessions persist across deploys
- Global edge distribution
- Auto-scaling

---

## 🎯 Next Steps After Deployment

### 1. Monitor Performance
- Cloudflare Analytics (built-in)
- Check API response times
- Monitor KV storage usage

### 2. Set Up Alerts (Optional)
- Email notifications for failed deployments
- Budget alerts for Cloudflare usage
- Error tracking (Sentry, LogRocket, etc.)

### 3. Enable Web Analytics (Optional)
- Cloudflare Web Analytics (privacy-friendly)
- Track visitor behavior
- Monitor conversion funnel

### 4. Optimize (Optional)
- Add caching headers
- Implement rate limiting at edge
- Use Cloudflare Images for optimization

---

## 💰 Cloudflare Costs

### Free Tier Includes:
- ✅ Unlimited bandwidth
- ✅ Unlimited requests
- ✅ 100,000 KV reads/day
- ✅ 1,000 KV writes/day
- ✅ SSL certificates
- ✅ DDoS protection

### Paid Tiers (If Needed):
- **Workers Paid:** $5/month
  - 10M KV reads/month
  - 1M KV writes/month
  - More CPU time

**Your usage should fit in free tier for MVP!** 🎉

---

## 🔐 Security Checklist

After deployment:
- [ ] Environment variables set (not in code)
- [ ] Rate limiting active (already configured)
- [ ] Input validation working
- [ ] HTTPS enforced (automatic with Cloudflare)
- [ ] CORS configured correctly

---

## 📱 GitHub Auto-Deploy Workflow

Once connected to GitHub:

1. **Make changes locally**
   ```bash
   # Edit code
   git add .
   git commit -m "Update feature"
   git push
   ```

2. **Automatic build & deploy**
   - Cloudflare detects push
   - Runs `npm run build`
   - Deploys to edge network
   - Updates https://kre8tion.com

3. **Preview deployments**
   - Pull requests get preview URLs
   - Test before merging to main
   - Automatic cleanup after merge

---

## ✅ Ready to Deploy!

### Quick Start:
1. Push code to GitHub
2. Connect repo in Cloudflare Dashboard
3. Add environment variables
4. Add custom domain (kre8tion.com)
5. Deploy automatically

**Your voice agent with conversation memory will be live on kre8tion.com!** 🚀

---

## 📞 Need Help?

- Cloudflare Docs: https://developers.cloudflare.com/pages/
- Next.js on Cloudflare: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- Community Discord: https://discord.cloudflare.com

Let me know when you're ready to deploy! 🎉
