# Supabase Setup Guide

Bu fayl Supabase-ga ulanish uchun qo'shimcha ma'lumotlarni olish bo'yicha qo'llanma.

## 1. Supabase Dashboard dan Ma'lumotlar

### URL va Anon Key (✅ Mavjud)

- **URL**: `https://bqizqxcvioeypuljlrni.supabase.co`
- **Anon Key**: Mavjud ✅

### Qayerdan topish mumkin?

1. Supabase Dashboard ga kiring: https://app.supabase.com
2. Project ni tanlang
3. **Settings** → **API** bo'limiga kiring
4. U yerda "Project URL" va "anon public" key ko'rinadi

## 2. Database Table Structure

### Qaysi Table lar kerak?

Bizga quyidagi table lar kerak bo'ladi:

1. **todos** table (Projects o'rniga)
2. **todo_items** table (Tasks o'rniga)
3. **users** table (optional, agar auth qo'shilsa)

### Qanday yaratish kerak?

#### Variant 1: SQL Query orqali (Tavsiya etiladi)

Supabase Dashboard → **SQL Editor** → Yangi query yozing:

```sql
-- Todos (Projects) table
CREATE TABLE todos (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) -- Agar auth qo'shiladi
);

-- Todo Items (Tasks) table
CREATE TABLE todo_items (
  id BIGSERIAL PRIMARY KEY,
  todo_id BIGINT REFERENCES todos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activity_log JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security (agar auth qo'shiladi)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_items ENABLE ROW LEVEL SECURITY;

-- Policies (agar auth qo'shiladi)
CREATE POLICY "Users can view their own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view todo items in their todos"
  ON todo_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM todos
      WHERE todos.id = todo_items.todo_id
      AND todos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create todo items in their todos"
  ON todo_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM todos
      WHERE todos.id = todo_items.todo_id
      AND todos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update todo items in their todos"
  ON todo_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM todos
      WHERE todos.id = todo_items.todo_id
      AND todos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete todo items in their todos"
  ON todo_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM todos
      WHERE todos.id = todo_items.todo_id
      AND todos.user_id = auth.uid()
    )
  );
```

#### Variant 2: Table Editor orqali

1. Supabase Dashboard → **Table Editor**
2. **New Table** tugmasini bosing
3. Har bir column uchun:
   - Column name
   - Type (text, bigint, timestamp, etc.)
   - Default value (agar kerak bo'lsa)
   - Primary key (id uchun)
   - Foreign key (todo_items.todo_id uchun)

## 3. Authentication Settings (Optional)

### Agar Auth qo'shmoqchi bo'lsangiz:

1. Supabase Dashboard → **Authentication** → **Providers**
2. Qaysi biri kerak?
   - Email/Password (eng oson)
   - Google OAuth
   - GitHub OAuth
   - Facebook OAuth

### Email/Password ni yoqish:

1. Authentication → Providers → Email
2. "Enable Email provider" toggle ni yoqing
3. Email confirmation ni yoqishingiz yoki o'chirishingiz mumkin

## 4. Environment Variables

### .env fayl (✅ Tayyor)

Fayl allaqachon `.env` nomi bilan yaratilgan:

```
VITE_SUPABASE_URL=https://bqizqxcvioeypuljlrni.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Qayerga joylashtirish kerak?

- Project root directory ga: `C:\Users\Windows 10\Desktop\SSG\todo.asrorbeck.uz\.env`
- Vite proyekti bo'lgani uchun `VITE_` prefix bilan boshlanishi kerak

## 5. Keyin Nima?

Siz to'liq SQL query ni yoki table screenshot'ni yuborganingizdan keyin:

1. ✅ Supabase client install qilaman
2. ✅ Context'ni localStorage dan Supabase'ga o'zgartiramiz
3. ✅ CRUD operations ni implement qilaman
4. ✅ Real-time sync (optional) qo'shaman

## 6. Qo'shimcha Ma'lumotlar

### Real-time Updates (Optional)

Agar real-time updates kerak bo'lsa:

- Supabase Realtime ni yoqish kerak
- Settings → API → Realtime
- Enable Realtime

### Storage (Future)

Agar rasm yoki fayllar saqlash kerak bo'lsa:

- Storage bucket yaratish kerak
- Settings → Storage → Create bucket

---

## 🔥 Hozir Nima Qilish Kerak?

**Iltimos, quyidagilardan birini bajaring:**

1. **Variant A**: SQL Editor dan query ni copy-paste qilib bajarib, natijani yuboring
2. **Variant B**: Table Editor dan manual yaratib, screenshot yuboring
3. **Variant C**: Mavjud table larni export qilib, SQL fayl yuboring
4. **Variant D**: "Men xato qilib yuborganman, shunchaki to'liq struktura kerak" desangiz, men butunlay yangi yaratib beraman

Qaysi variantni tanlaysiz?
