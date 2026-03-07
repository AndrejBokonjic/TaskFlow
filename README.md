# 📋 TaskFlow – Sistem za upravljanje nalog

## 📖 Opis projekta

**TaskFlow** je mikrostoritvena aplikacija za upravljanje projektov in nalog. Sistem omogoča uporabnikom ustvarjanje projektov, dodajanje nalog ter spremljanje napredka dela.

Uporabniki lahko ustvarjajo projekte, v njih organizirajo naloge in naloge dodeljujejo drugim uporabnikom. Status nalog se lahko spreminja (*TODO*, *IN PROGRESS*, *DONE*), kar omogoča pregled nad napredkom projekta.

Sistem je zasnovan po načelih **Clean Architecture**, kjer je poslovna logika ločena od infrastrukture, in **Screaming Architecture**, kjer struktura projekta jasno izraža namen sistema in poslovne koncepte (projekti, naloge, uporabniki).

---

# 🎯 Namen sistema

Glavni namen sistema je omogočiti:

- organizacijo dela v projektih
- ustvarjanje in upravljanje nalog
- dodeljevanje nalog uporabnikom
- spremljanje napredka nalog
- pregled projektov preko spletnega vmesnika

Sistem predstavlja poenostavljeno različico orodij kot so:

- Trello  
- Jira  
- Asana  

---

# 🏗 Arhitektura sistema

Sistem je sestavljen iz **treh mikrostoritev** in **spletne aplikacije (UI)**.

"slika"

---

# ⚙️ Mikrostoritve

## 👤 Storitev uporabniki (User Service)

Ta storitev upravlja uporabnike sistema.

### Funkcionalnosti

- registracija uporabnika
- prijava uporabnika
- upravljanje uporabniškega profila
- pregled osnovnih podatkov uporabnikov

---

## 📁 Storitev projekti (Project Service)

Ta storitev upravlja projekte, v katerih se organizira delo.

### Funkcionalnosti

- ustvarjanje projektov
- pregled projektov
- urejanje projektov
- povezovanje uporabnikov s projekti

## ✅ Storitev naloge (Task Service)

Ta storitev upravlja naloge znotraj projektov.

### Funkcionalnosti

- ustvarjanje nalog
- dodeljevanje nalog uporabnikom
- spreminjanje statusa nalog
- pregled nalog znotraj projekta

### Status nalog

| Status | Opis |
|------|------|
| TODO | Naloga še ni začeta |
| IN_PROGRESS | Naloga je v delu |
| DONE | Naloga je zaključena |

---

# 🌐 Spletni uporabniški vmesnik

Spletna aplikacija predstavlja **glavni vmesnik za uporabnike**.

Uporabniki lahko:

- ustvarijo projekt
- dodajo naloge
- dodelijo naloge drugim uporabnikom
- spremljajo napredek nalog
- spreminjajo status nalog

---

# 🔗 Komunikacija med komponentami

Spletni vmesnik komunicira z mikrostoritvami preko **REST API (HTTP)**.

### Primer poteka

1. Uporabnik se prijavi v sistem.
2. UI pridobi seznam projektov iz **Project Service**.
3. Uporabnik izbere projekt.
4. UI pridobi naloge iz **Task Service**.
5. Uporabnik ustvari ali spremeni nalogo.

Po potrebi lahko storitev nalog komunicira z drugimi storitvami:

- preverjanje uporabnika pri **User Service**
- preverjanje projekta pri **Project Service**

---

# 🧱 Načela arhitekture (Clean Architecture)

Sistem sledi naslednjim načelom:

- Poslovna logika (**domain**) je neodvisna od infrastrukture.
- Domena ne pozna baze podatkov ali frameworkov.
- Odvisnosti tečejo **od zunanjosti proti notranjosti**.

API / Infrastructure
↓
Application (Use Cases)
↓
Domain (Business Logic)

- Mikrostoritve so **samostojne in ohlapno povezane**.

---

# 📂 Struktura repozitorija (Screaming Architecture)

Struktura projekta je organizirana po **poslovnih konceptih sistema**.

taskflow-system/
│
├── uporabniki/
│ ├── domena/
│ ├── aplikacija/
│ ├── infrastruktura/
│ └── api/
│
├── projekti/
│ ├── domena/
│ ├── aplikacija/
│ ├── infrastruktura/
│ └── api/
│
├── naloge/
│ ├── domena/
│ ├── aplikacija/
│ ├── infrastruktura/
│ └── api/
│
├── spletni-vmesnik/
│ ├── src/
│ └── public/
│
└── README.md
