# Supabase Table Structure Check

Agar jadvallar allaqachon mavjud bo'lsa, quyidagi SQL query bilan ularning strukturasini ko'rishingiz mumkin.

## 1. Todos Table Structure

```sql
-- Todos table structure ko'rish
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'todos';
```

## 2. Todo Items Table Structure

```sql
-- Todo items table structure ko'rish
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'todo_items';
```

## 3. Mavjud Data ko'rish

```sql
-- Todos dan ma'lumot ko'rish (agar bo'lsa)
SELECT * FROM todos LIMIT 5;

-- Todo items dan ma'lumot ko'rish (agar bo'lsa)
SELECT * FROM todo_items LIMIT 5;
```

## 4. Agar Struktura Noto'g'ri Bo'lsa

### Variant A: Drop va Qayta Yaratish (⚠️ Ma'lumotlar o'chib ketadi!)

```sql
-- Ma'lumotlarni o'chirish
DROP TABLE IF EXISTS todo_items CASCADE;
DROP TABLE IF EXISTS todos CASCADE;

-- Keyin SUPABASE_SETUP.md dagi SQL ni bajarish
```

### Variant B: Faqat Kerakli Column larni Qo'shish

```sql
-- Agar todos ga column qo'shish kerak bo'lsa
ALTER TABLE todos ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';
ALTER TABLE todos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE todos ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW();

-- Agar todo_items ga column qo'shish kerak bo'lsa
ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS activity_log JSONB DEFAULT '[]'::jsonb;
```

## 5. Agar Foreign Key Yo'q Bo'lsa

```sql
-- todos va todo_items orasidagi foreign key yaratish
ALTER TABLE todo_items
ADD CONSTRAINT todo_items_todo_id_fkey
FOREIGN KEY (todo_id)
REFERENCES todos(id)
ON DELETE CASCADE;
```

---

## 🔥 Nima Qilish Kerak?

**Iltimos, quyidagi querylarni bajarib, natijani yuboring:**

1. Todos table structure (yuqoridagi 1-chi SQL)
2. Todo items table structure (yuqoridagi 2-chi SQL)
3. Agar ma'lumot bor bo'lsa, ulardan 2-3 ta misol

Yoki agar xavfsiz bo'lsa, **Variant A** (Drop & Recreate) ni bajarib o'zingiz yangi yaratib olishingiz mumkin.
