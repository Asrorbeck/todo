# Deployment Guide

## GitHub Pages ga Deploy Qilish

### 1. Repository Settings

GitHub da repository:

1. **Settings** → **Pages** ga kiring
2. **Source**: **GitHub Actions** ni tanlang
3. Sizning custom domain bo'lsa, **Custom domain** ga yozing: `todo.asrorbeck.uz`

### 2. Environment Variables (Secrets)

Repository **Settings** → **Secrets and variables** → **Actions** ga kiring va quyidagi secrets larni qo'shing:

```
VITE_SUPABASE_URL=https://bqizqxcvioeypuljlrni.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaXpxeGN2aW9leXB1bGpscm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTc1NzYsImV4cCI6MjA3NzQ5MzU3Nn0.nmjg7-TAABAGkrlaOapjV4k-AiPAz7jjJv_enC-Xnvw
```

### 3. Push qilish

Main branch ga push qilsangiz, automatic deploy bo'ladi:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 4. Custom Domain Setup

Agar custom domain ishlatayotgan bo'lsangiz:

1. DNS settings ga kiring (domain provider ofisida)
2. Quyidagi record qo'shing:

**Type**: `CNAME`  
**Name**: `@` yoki `todo`  
**Value**: `yourusername.github.io` (sizning GitHub username)

Yoki:

**Type**: `A`  
**Name**: `@`  
**Value**: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`

3. GitHub Pages settings da custom domain ni qo'shing: `todo.asrorbeck.uz`
4. **Enforce HTTPS** ni yoqing

### 5. Local Build Test

Deploy qilishdan oldin local da test qiling:

```bash
npm run build
npm run preview
```

### 6. Deploy Status

GitHub repository ning **Actions** tabida deploy holatini ko'rishingiz mumkin.

---

## 🚀 Production Checklist

- ✅ GitHub Actions workflow tayyor
- ✅ Environment variables secrets ga qo'shildi
- ✅ Vite config GitHub Pages ga moslandi
- ✅ Custom domain sozlandi
- ✅ Build test local da o'tkazildi
- ✅ CNAME fayl qo'shildi

---

## 📝 Troubleshooting

### Build failed

- Actions log larni tekshiring
- Environment variables to'g'ri qo'shildimi?
- Node.js version mos keladimi?

### Custom domain ishlamayapti

- DNS propagation vaqt olishi mumkin (24-48 soat)
- GitHub Pages settings da domain qo'shildimi?
- CNAME yoki A record to'g'ri sozlandimi?

### 404 error

- `vite.config.ts` da `base: '/'` to'g'ri qo'yilganmi?
- Repository nomi bilan URL mos keladimi?
