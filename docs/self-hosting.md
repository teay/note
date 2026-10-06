# Hardened Self-Hosting: SSH Tunnel + Distroless

Idea for replacing the current public deployment (GH Pages + Firebase) with a
much smaller, self-controlled attack surface. Status: **not started** — live
checklist lives in [`todo.md`](todo.md) under *Hardened self-hosting*.

---

## 1. Distroless คืออะไร

Linux container ที่มี**แค่โค้ดแอปกับไฟล์ที่จำเป็นจริง ๆ** ไม่มี shell (`sh`),
ไม่มี package manager, ไม่มีเครื่องมือ:

```
Ubuntu image  → มี apt, bash, curl, python ... (~700 MB)  เจาะเข้ามาทำอะไรต่อได้เยอะ
Distroless    → มีแค่ binary ของแอปคุณ (~50 MB)          เจาะเข้ามาได้ก็เปิด shell ไม่ได้
```

## 2. SSH Tunnel คืออะไร

เว็บปกติ: `เบราว์เซอร์ → อินเทอร์เน็ต → server:8080` → พอร์ตเปิดให้ทุกคนสแกนเจอ

SSH tunnel: แอปบน server **ฟังเฉพาะ localhost** (ไม่มีพอร์ตเปิดสาธารณะ) แล้วสั่ง:

```bash
ssh -L 8080:localhost:8080 user@server
# "เอาพอร์ต 8080 ของ server มาวางที่ localhost:8080 ของเครื่องฉัน"
```

แล้วเปิด `http://localhost:8080` — ช่องทางเดียวที่เข้าถึงได้คือผ่าน login SSH ด้วย key,
bots สแกนเจออะไรเลยเพราะไม่มีอะไรเปิดอยู่

## 3. รวมกัน

```
┌─ Server (VPS เล็ก) ──────────────────────┐
│  Docker: distroless image                │
│  ┌────────────────────────────┐          │
│  │ binary แอปโน้ต             │          │
│  │ ฟัง 127.0.0.1:8080 เท่านั้น │◄─ ไม่มีพอร์ตเปิดสาธารณะ
│  │ ข้อมูล = SQLite ในเครื่อง   │          │
│  └────────────────────────────┘          │
└──────────────────▲───────────────────────┘
                   │ ช่องทางเดียว: SSH (key เท่านั้น)
┌─ เครื่องคุณ ─────┴───────────────────────┐
│  ssh -L 8080:localhost:8080 u@server     │
│  เปิด http://localhost:8080 จบ            │
└──────────────────────────────────────────┘
```

ปลอดภัยเพราะ 3 ชั้น: ไม่มีพอร์ตสาธารณะ → เข้าได้เฉพาะคนมี SSH key →
ถึงเจาะแอปได้ก็ไม่มี shell ให้ใช้ต่อ

---

## Plan (checklist ใน `todo.md`)

1. เลือก server — VPS เล็กสุด (Hetzner/DigitalOcean ~$4-6/mo) รับ Ubuntu เบื้องต้น
2. เตรียมแอปฝั่ง server — backend เล็ก ๆ (Go หรือ Node + Express) serve build แอป React
   เดิม + CRUD โน้ตเข้า SQLite → ข้อมูลย้ายออกจาก Firebase **(งานหลัก)**
3. ทำ image — Dockerfile multi-stage: build แอป → วาง binary + static files ลง
   `gcr.io/distroless/static`
4. รันเฉพาะ localhost — `docker run -p 127.0.0.1:8080:8080 ...`
5. ตั้ง SSH ให้แน่น — key เท่านั้น, ปิด password, optional fail2ban
6. ใช้งาน — `ssh -L 8080:localhost:8080 u@server` แล้วเปิด localhost:8080
7. สำรองข้อมูล — script copy `notes.db` ออกเป็นระยะ

## ข้อควรคิดก่อนเริ่มจริง

- งานหลักอยู่ที่ขั้น 2 (เขียน backend + เปลี่ยนจาก Firebase) — นอกนั้นเล็กหมด
- **ใช้บน iPhone ไม่สะดวก** — ต้องเปิดแอป SSH ก่อนทุกครั้ง
  (ทางเลือก: Tailscale ที่ Safari เปิดตรง ๆ ได้)
- ต้องดูแลเอง: patch, backup, uptime ไม่มี GH Pages แล้ว
- ไม่มี cross-device sync แล้ว เว้นแต่ทำเพิ่ม
