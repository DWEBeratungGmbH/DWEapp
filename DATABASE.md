# DWEapp - Datenbank Dokumentation

**Version:** 1.5  
**Stand:** 01.12.2025  
**Letzte Prüfung:** WeClapp OpenAPI v2 + Bidirektionaler Sync + Audit Logging  
**Datenbank:** PostgreSQL 17  
**ORM:** Prisma  

---

## 📋 Inhaltsverzeichnis

1. [Verbindung](#verbindung)
2. [Übersicht](#übersicht)
3. [App-Tabellen](#app-tabellen)
4. [WeClapp-Sync-Tabellen](#weclapp-sync-tabellen)
5. [Relationen](#relationen)
6. [WeClapp Synchronisation](#weclapp-synchronisation)
7. [Erweiterungen](#erweiterungen)
8. [Änderungshistorie](#änderungshistorie)

> 📝 **Änderungsprotokoll:** Siehe [CHANGELOG.md](./CHANGELOG.md) für detaillierte Rollback-Anweisungen

---

## 🔌 Verbindung

| Parameter | Wert |
|-----------|------|
| **Host** | `91.98.135.191` |
| **Port** | `5432` |
| **Datenbank** | `dweapp` |
| **Benutzer** | `postgres` |
| **SSH-Tunnel** | Ja (Port 22, User: `root`) |

**pgAdmin-Setup:** Siehe `DWEapp.md` → Abschnitt Datenbank

---

## 📊 Übersicht

### App-Tabellen (Benutzerverwaltung & Auth)

| Tabelle | Beschreibung | Zeilen (ca.) |
|---------|--------------|--------------|
| `users` | App-Benutzer | - |
| `accounts` | OAuth-Accounts (Azure, etc.) | - |
| `sessions` | Aktive Sessions | - |
| `verifications` | E-Mail-Verifizierungen | - |
| `invitations` | Benutzer-Einladungen | - |
| `roles` | Rollen-Definitionen | - |
| `role_permissions` | Berechtigungen pro Rolle | - |
| `role_data_scopes` | Datenbereiche pro Rolle | - |

### WeClapp-Sync-Tabellen

| Tabelle | Beschreibung | Zeilen (ca.) |
|---------|--------------|--------------|
| `weclapp_users` | WeClapp-Benutzer (Sync) | - |
| `weclapp_tasks` | Aufgaben aus WeClapp | - |
| `weclapp_orders` | Aufträge aus WeClapp | - |
| `weclapp_time_entries` | Zeiteinträge | - |
| `weclapp_webhook_logs` | Webhook-Protokoll | - |
| `sync_logs` | Sync-Protokoll (alle Änderungen) | - |
| `audit_logs` | Audit-Log (Datenänderungen) | - |
| `sync_status` | Batch-Sync-Status | - |

---

## 👤 App-Tabellen

### `users` - App-Benutzer

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String (cuid) | Primärschlüssel |
| `email` | String | E-Mail (unique) |
| `emailVerified` | Boolean | E-Mail bestätigt? |
| `name` | String? | Legacy-Name |
| `firstName` | String? | Vorname |
| `lastName` | String? | Nachname |
| `image` | String? | Profilbild-URL |
| `role` | String | Rolle (default: "USER") |
| `department` | String? | Abteilung |
| `weClappUserId` | String? | FK → `weclapp_users.id` (1:1, optional) |
| `isActive` | Boolean | Aktiv? (Soft Delete) |
| `createdAt` | DateTime | Erstellt am |
| `updatedAt` | DateTime | Geändert am |

**Relationen:**
- `accounts` → 1:n zu `Account`
- `sessions` → 1:n zu `Session`
- `invitations` → 1:n zu `Invitation`
- `weClappUser` → 1:1 zu `WeClappUser` (optional)

---

### `accounts` - OAuth-Accounts

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String (cuid) | Primärschlüssel |
| `userId` | String | FK → `users.id` |
| `type` | String | Account-Typ |
| `provider` | String | Provider (azure-ad, etc.) |
| `providerAccountId` | String | Provider-ID |
| `refresh_token` | Text? | Refresh Token |
| `access_token` | Text? | Access Token |
| `expires_at` | Int? | Token-Ablauf |
| `token_type` | String? | Token-Typ |
| `scope` | String? | Berechtigungen |
| `id_token` | Text? | ID Token |
| `session_state` | String? | Session State |

**Unique:** `[provider, providerAccountId]`

---

### `sessions` - Aktive Sessions

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String (cuid) | Primärschlüssel |
| `sessionToken` | String | Session Token (unique) |
| `userId` | String | FK → `users.id` |
| `expires` | DateTime | Ablaufdatum |

---

### `invitations` - Einladungen

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String (cuid) | Primärschlüssel |
| `email` | String | E-Mail des Eingeladenen |
| `role` | String | Zugewiesene Rolle |
| `department` | String? | Abteilung |
| `firstName` | String? | Vorname |
| `lastName` | String? | Nachname |
| `weClappUserId` | String? | WeClapp-Verknüpfung |
| `token` | String | Einladungs-Token (unique) |
| `expiresAt` | DateTime | Ablaufdatum |
| `status` | String | PENDING / ACCEPTED / EXPIRED |
| `userId` | String? | FK → `users.id` (nach Annahme) |
| `createdAt` | DateTime | Erstellt am |
| `updatedAt` | DateTime | Geändert am |

---

### `roles` - Rollen

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String (cuid) | Primärschlüssel |
| `roleId` | String | Rollen-ID (ADMIN, USER, etc.) |
| `roleName` | String | Anzeigename |
| `description` | String? | Beschreibung |
| `isSystem` | Boolean | Systemrolle? (nicht löschbar) |
| `createdAt` | DateTime | Erstellt am |
| `updatedAt` | DateTime | Geändert am |

**Relationen:**
- `permissions` → 1:n zu `RolePermission`
- `dataScopes` → 1:n zu `RoleDataScope`

---

### `role_permissions` - Berechtigungen

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String (cuid) | Primärschlüssel |
| `roleId` | String | FK → `roles.id` |
| `permissionId` | String | z.B. "nav.dashboard", "action.users.create" |
| `createdAt` | DateTime | Erstellt am |

**Unique:** `[roleId, permissionId]`

---

### `role_data_scopes` - Datenbereiche

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String (cuid) | Primärschlüssel |
| `roleId` | String | FK → `roles.id` |
| `dataType` | String | "tasks", "projects", "users" |
| `scope` | String | "own", "assigned", "all", "department" |
| `createdAt` | DateTime | Erstellt am |
| `updatedAt` | DateTime | Geändert am |

**Unique:** `[roleId, dataType]`

---

## 🔄 WeClapp-Sync-Tabellen

### `weclapp_parties` - Kunden/Stammdaten (NEU)

| Feld | Typ | Beschreibung | WeClapp API |
|------|-----|--------------|-------------|
| `id` | String | WeClapp Party ID (PK) | ✅ `id` |
| `partyType` | String? | ORGANIZATION, PERSON | ✅ `partyType` |
| `company` | String? | Firmenname | ✅ `company` |
| `company2` | String? | Firmenname Zusatz | ✅ `company2` |
| `firstName` | String? | Vorname | ✅ `firstName` |
| `lastName` | String? | Nachname | ✅ `lastName` |
| `middleName` | String? | Zweiter Vorname | ✅ `middleName` |
| `salutation` | String? | Anrede | ✅ `salutation` |
| `email` | String? | E-Mail (geschäftlich) | ✅ `email` |
| `emailHome` | String? | E-Mail (privat) | ✅ `emailHome` |
| `phone` | String? | Telefon | ✅ `phone` |
| `mobilePhone1` | String? | Mobil | ✅ `mobilePhone1` |
| `fax` | String? | Fax | ✅ `fax` |
| `website` | String? | Website | ✅ `website` |
| `birthDate` | DateTime? | Geburtsdatum | ✅ `birthDate` |
| `customer` | Boolean | Ist Kunde? | ✅ `customer` |
| `customerNumber` | String? | Kundennummer | ✅ `customerNumber` |
| `customerBlocked` | Boolean | Gesperrt? | ✅ `customerBlocked` |
| `customerCreditLimit` | Decimal? | Kreditlimit | ✅ `customerCreditLimit` |
| `supplier` | Boolean | Ist Lieferant? | ✅ `supplier` |
| `supplierNumber` | String? | Lieferantennummer | ✅ `supplierNumber` |
| `primaryAddressId` | String? | Hauptadresse | ✅ `primaryAddressId` |
| `invoiceAddressId` | String? | Rechnungsadresse | ✅ `invoiceAddressId` |
| `deliveryAddressId` | String? | Lieferadresse | ✅ `deliveryAddressId` |
| `addresses` | JSON? | Array von Adressen | ✅ `addresses` |
| `bankAccounts` | JSON? | Array von Bankverbindungen | ✅ `bankAccounts` |
| `contacts` | JSON? | Array von Kontakt-IDs | ✅ `contacts` |
| `tags` | JSON? | Array von Tags | ✅ `tags` |
| `customAttributes` | JSON? | Custom Attributes | ✅ `customAttributes` |
| `createdDate` | DateTime? | Erstellt in WeClapp | ✅ `createdDate` |
| `lastModifiedDate` | DateTime? | Geändert in WeClapp | ✅ `lastModifiedDate` |
| `lastSyncAt` | DateTime | Letzter Sync | 🔧 Intern |
| `isActive` | Boolean | Aktiv? (Soft Delete) | 🔧 Intern |

**Relationen:**
- `tasks` → 1:n zu `WeClappTask` (Kunde der Aufgabe)
- `orders` → 1:n zu `WeClappOrder` (Kunde des Auftrags)
- `timeEntries` → 1:n zu `WeClappTimeEntry` (Kunde des Zeiteintrags)

---

### `weclapp_users` - WeClapp-Benutzer

| Feld | Typ | Beschreibung | WeClapp API |
|------|-----|--------------|-------------|
| `id` | String | WeClapp User ID (PK) | ✅ `id` |
| `email` | String? | E-Mail | ✅ `email` |
| `firstName` | String? | Vorname | ✅ `firstName` |
| `lastName` | String? | Nachname | ✅ `lastName` |
| `username` | String? | Benutzername | ✅ `username` |
| `title` | String? | Titel (Dr., etc.) | ✅ `title` |
| `birthDate` | DateTime? | Geburtsdatum | ✅ `birthDate` |
| `phoneNumber` | String? | Telefonnummer | ✅ `phoneNumber` |
| `mobilePhoneNumber` | String? | Mobilnummer | ✅ `mobilePhoneNumber` |
| `faxNumber` | String? | Faxnummer | ✅ `faxNumber` |
| `imageId` | String? | Profilbild-ID | ✅ `imageId` |
| `status` | String | ACTIVE, NOT_ACTIVE, DEPARTURE | ✅ `status` (Enum) |
| `userRoles` | JSON? | Array von UserRole IDs | ✅ `userRoles` |
| `licenses` | JSON? | Array von Lizenzen | ✅ `licenses` |
| `customAttributes` | JSON? | Custom Attributes | ✅ `customAttributes` |
| `createdDate` | DateTime? | Erstellt in WeClapp | ✅ `createdDate` |
| `lastModifiedDate` | DateTime? | Geändert in WeClapp | ✅ `lastModifiedDate` |
| `lastSyncAt` | DateTime | Letzter Sync | 🔧 Intern |

**Relationen:**
- `createdTasks` → 1:n zu `WeClappTask` (Ersteller)
- `assignedTimeEntries` → 1:n zu `WeClappTimeEntry` (Benutzer)
- `appUser` → 1:1 zu `User` (optional, Rückverknüpfung)

---

### `weclapp_tasks` - Aufgaben

| Feld | Typ | Beschreibung | WeClapp API |
|------|-----|--------------|-------------|
| `id` | String | WeClapp Task ID (PK) | ✅ `id` |
| `subject` | String? | Betreff | ✅ `subject` |
| `description` | Text? | Beschreibung (HTML) | ✅ `description` |
| `identifier` | String? | Task-Nummer (z.B. T-00001) | ✅ `identifier` |
| `taskStatus` | String | NOT_STARTED, IN_PROGRESS, COMPLETED, DEFERRED, WAITING_ON_OTHERS | ✅ `taskStatus` |
| `taskPriority` | String | HIGH, MEDIUM, LOW | ✅ `taskPriority` |
| `taskVisibilityType` | String? | Sichtbarkeit | ✅ `taskVisibilityType` |
| `dateFrom` | DateTime? | Startdatum | ✅ `dateFrom` |
| `dateTo` | DateTime? | Enddatum | ✅ `dateTo` |
| `plannedEffort` | Int? | Geplanter Aufwand (Minuten) | ✅ `plannedEffort` |
| `positionNumber` | Int? | Positionsnummer | ✅ `positionNumber` |
| `creatorUserId` | String? | Ersteller (User ID) | ✅ `creatorUserId` |
| `parentTaskId` | String? | Übergeordnete Aufgabe | ✅ `parentTaskId` |
| `previousTaskId` | String? | Vorgänger-Task | ✅ `previousTaskId` |
| `orderItemId` | String? | Verknüpfte Auftragsposition | ✅ `orderItemId` |
| `customerId` | String? | Verknüpfter Kunde (Party ID) | ✅ `customerId` |
| `articleId` | String? | Verknüpfter Artikel | ✅ `articleId` |
| `ticketId` | String? | Verknüpftes Ticket | ✅ `ticketId` |
| `calendarEventId` | String? | Verknüpfter Kalendereintrag | ✅ `calendarEventId` |
| `userOfLastStatusChangeId` | String? | Letzter Status-Änderer | ✅ `userOfLastStatusChangeId` |
| `allowOverBooking` | Boolean | Überbuchung erlaubt? | ✅ `allowOverBooking` |
| `allowTimeBooking` | Boolean | Zeitbuchung erlaubt? | ✅ `allowTimeBooking` |
| `billableStatus` | Boolean? | Abrechenbar? | ✅ `billableStatus` |
| `invoicingStatus` | String? | Abrechnungsstatus | ✅ `invoicingStatus` |
| `createdDate` | DateTime | Erstellt in WeClapp | ✅ `createdDate` |
| `lastModifiedDate` | DateTime | Geändert in WeClapp | ✅ `lastModifiedDate` |
| `assignees` | JSON? | Array von {id, plannedEffort, userId} | ✅ `assignees` |
| `watchers` | JSON? | Array von User IDs | ✅ `watchers` |
| `entityReferences` | JSON? | Verknüpfte Entitäten | ✅ `entityReferences` |
| `taskLists` | JSON? | Aufgabenlisten IDs | ✅ `taskLists` |
| `taskTopics` | JSON? | Themen IDs | ✅ `taskTopics` |
| `taskTypes` | JSON? | Typen IDs | ✅ `taskTypes` |
| `customAttributes` | JSON? | Custom Attributes | ✅ `customAttributes` |
| `weClappLastModified` | DateTime | WeClapp Änderungsdatum | 🔧 Intern |
| `lastSyncAt` | DateTime | Letzter Sync | 🔧 Intern |
| `isActive` | Boolean | Aktiv? (Soft Delete) | 🔧 Intern |

---

### `weclapp_orders` - Aufträge (salesOrder)

| Feld | Typ | Beschreibung | WeClapp API |
|------|-----|--------------|-------------|
| `id` | String | WeClapp Order ID (PK) | ✅ `id` |
| `orderNumber` | String? | Auftragsnummer (z.B. AB-00001) | ✅ `orderNumber` |
| `orderNumberAtCustomer` | String? | Bestellnummer beim Kunden | ✅ `orderNumberAtCustomer` |
| `orderStatus` | String? | Status (ORDER_ENTRY, etc.) | ✅ `status` |
| `orderDate` | DateTime? | Auftragsdatum | ✅ `orderDate` |
| `customerId` | String? | Kunde (Party ID) | ✅ `customerId` |
| `invoiceRecipientId` | String? | Rechnungsempfänger (Party ID) | ✅ `invoiceRecipientId` |
| `totalAmount` | Decimal? | Gesamtbetrag | ✅ (berechnet) |
| `currency` | String? | Währung (EUR, USD, etc.) | ✅ `currencyId` |
| `note` | String? | Notiz | ✅ `note` |
| `invoiced` | Boolean | Abgerechnet? | ✅ `invoiced` |
| `paid` | Boolean | Bezahlt? | ✅ `paid` |
| `shipped` | Boolean | Versendet? | ✅ `shipped` |
| `servicesFinished` | Boolean | Dienstleistungen abgeschlossen? | ✅ `servicesFinished` |
| `projectModeActive` | Boolean | Projektmodus aktiv? | ✅ `projectModeActive` |
| `warehouseId` | String? | Lager ID | ✅ `warehouseId` |
| `quotationId` | String? | Angebots-ID | ✅ `quotationId` |
| `plannedProjectStartDate` | DateTime? | Geplanter Projektstart | ✅ `plannedProjectStartDate` |
| `plannedProjectEndDate` | DateTime? | Geplantes Projektende | ✅ `plannedProjectEndDate` |
| `createdDate` | DateTime | Erstellt in WeClapp | ✅ `createdDate` |
| `lastModifiedDate` | DateTime | Geändert in WeClapp | ✅ `lastModifiedDate` |
| `billingAddress` | JSON? | Rechnungsadresse | ✅ `recordAddress` |
| `shippingAddress` | JSON? | Lieferadresse | ✅ `shippingAddress` |
| `orderItems` | JSON? | Array von SalesOrderItem | ✅ `orderItems` |
| `payments` | JSON? | Array von Zahlungen | ✅ `payments` |
| `projectMembers` | JSON? | Array von Projektmitgliedern | ✅ `projectMembers` |
| `statusHistory` | JSON? | Status-Historie | ✅ `statusHistory` |
| `customAttributes` | JSON? | Custom Attributes | ✅ `customAttributes` |
| `weClappLastModified` | DateTime | WeClapp Änderungsdatum | 🔧 Intern |
| `lastSyncAt` | DateTime | Letzter Sync | 🔧 Intern |
| `isActive` | Boolean | Aktiv? (Soft Delete) | 🔧 Intern |

---

### `weclapp_time_entries` - Zeiteinträge (timeRecord)

| Feld | Typ | Beschreibung | WeClapp API |
|------|-----|--------------|-------------|
| `id` | String | WeClapp TimeRecord ID (PK) | ✅ `id` |
| `taskId` | String? | Verknüpfte Aufgabe | ✅ `taskId` |
| `userId` | String? | Benutzer | ✅ `userId` |
| `customerId` | String? | Kunde (Party ID) | ✅ `customerId` |
| `projectId` | String? | Projekt ID | ✅ `projectId` |
| `salesOrderId` | String? | Auftrags-ID | ✅ `salesOrderId` |
| `articleId` | String? | Artikel-ID | ✅ `articleId` |
| `ticketId` | String? | Ticket-ID | ✅ `ticketId` |
| `description` | String? | Beschreibung | ✅ `description` |
| `startDate` | DateTime? | Startdatum/-zeit | ✅ `startDate` |
| `durationSeconds` | Int? | Dauer in Sekunden | ✅ `durationSeconds` |
| `billableDurationSeconds` | Int? | Abrechenbare Dauer (Sek.) | ✅ `billableDurationSeconds` |
| `billable` | Boolean | Abrechenbar? | ✅ `billable` |
| `billableInvoiceStatus` | String? | Abrechnungsstatus | ✅ `billableInvoiceStatus` |
| `hourlyRate` | Decimal? | Stundensatz | ✅ `hourlyRate` |
| `printOnPerformanceRecord` | Boolean | Auf Leistungsnachweis? | ✅ `printOnPerformanceRecord` |
| `createdDate` | DateTime | Erstellt in WeClapp | ✅ `createdDate` |
| `lastModifiedDate` | DateTime | Geändert in WeClapp | ✅ `lastModifiedDate` |
| `customAttributes` | JSON? | Custom Attributes | ✅ `customAttributes` |
| `weClappLastModified` | DateTime | WeClapp Änderungsdatum | 🔧 Intern |
| `lastSyncAt` | DateTime | Letzter Sync | 🔧 Intern |
| `isActive` | Boolean | Aktiv? (Soft Delete) | 🔧 Intern |

---

### `weclapp_webhook_logs` - Webhook-Protokoll

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String (cuid) | Primärschlüssel |
| `eventType` | String | task.created, task.updated, etc. |
| `entityId` | String? | WeClapp Entity ID |
| `payload` | JSON | Vollständiger Webhook-Payload |
| `processed` | Boolean | Verarbeitet? |
| `error` | String? | Fehlermeldung |
| `processedAt` | DateTime? | Verarbeitet am |
| `receivedAt` | DateTime | Empfangen am |

---

## 🔗 Relationen

### App-Tabellen (Auth & Rollen)

```
┌─────────────┐       ┌─────────────┐
│    users    │──1:n──│  accounts   │
└─────────────┘       └─────────────┘
       │
       ├──1:n──┌─────────────┐
       │       │  sessions   │
       │       └─────────────┘
       │
       └──1:n──┌─────────────┐
               │ invitations │
               └─────────────┘

┌─────────────┐       ┌──────────────────┐
│    roles    │──1:n──│ role_permissions │
└─────────────┘       └──────────────────┘
       │
       └──1:n──┌──────────────────┐
               │ role_data_scopes │
               └──────────────────┘
```

### WeClapp-Sync-Tabellen (mit echten FK-Constraints)

```
┌──────────────────┐
│  weclapp_parties │ (Kunden/Stammdaten)
└──────────────────┘
         │
         ├──1:n──→ weclapp_tasks.customerId
         ├──1:n──→ weclapp_orders.customerId
         └──1:n──→ weclapp_time_entries.customerId

┌─────────────────┐
│  weclapp_users  │ (WeClapp-Benutzer)
└─────────────────┘
         │
         ├──1:n──→ weclapp_tasks.creatorUserId
         └──1:n──→ weclapp_time_entries.userId

┌─────────────────┐
│  weclapp_tasks  │ (Aufgaben)
└─────────────────┘
         │
         ├──1:n──→ weclapp_tasks.parentTaskId (Selbstreferenz: Hierarchie)
         ├──1:n──→ weclapp_tasks.previousTaskId (Selbstreferenz: Sequenz)
         └──1:n──→ weclapp_time_entries.taskId

┌─────────────────┐
│ weclapp_orders  │ (Aufträge)
└─────────────────┘
         │
         └──1:n──→ weclapp_time_entries.salesOrderId
```

### App-User ↔ WeClapp-User (1:1, optional)

```
┌─────────────┐         ┌─────────────────┐
│    users    │───1:1───│  weclapp_users  │
└─────────────┘         └─────────────────┘
  (weClappUserId)  FK→        (id)
       ↑                        ↑
   App-Benutzer           WeClapp-Benutzer
   (Login, Auth)          (Sync-Daten)
```

**Wichtig:**
- ✅ **Nicht jeder WeClapp-User ist ein App-User** (z.B. externe Mitarbeiter in WeClapp)
- ✅ **Nicht jeder App-User hat einen WeClapp-Account** (z.B. reine Admin-Accounts)
- ✅ Die Verknüpfung ist **optional auf beiden Seiten** (1:1, nullable)
- ✅ `User.weClappUserId` ist jetzt ein **echter FK** mit `@unique` Constraint
- ✅ `onDelete: SetNull` → Wenn WeClapp-User gelöscht wird, bleibt App-User erhalten

---

## � WeClapp Synchronisation

### Sync-Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        WeClapp Cloud                            │
│  (user, party, task, salesOrder, timeRecord)                    │
└─────────────────────────────────────────────────────────────────┘
                    ↑                    ↓
                  PUSH                 PULL
            (App → WeClapp)      (WeClapp → App)
                    ↑                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DWEapp Server                              │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  Sync Service   │    │ Webhook Handler │                    │
│  │  (Push)         │    │ (Pull/Echtzeit) │                    │
│  └─────────────────┘    └─────────────────┘                    │
│           ↓                      ↓                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL DB                         │   │
│  │  weclapp_users, weclapp_parties, weclapp_tasks,         │   │
│  │  weclapp_orders, weclapp_time_entries                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Sync-Richtungen

| Entität | Pull (WeClapp → App) | Push (App → WeClapp) | Webhook |
|---------|---------------------|---------------------|---------|
| **User** | ✅ `syncUsers()` | ❌ (nur lesend) | ✅ `user.*` |
| **Party** | ✅ `syncParties()` | ✅ `pushPartyToWeClapp()` | ✅ `party.*` |
| **Task** | ✅ `syncTasks()` | ✅ `pushTaskToWeClapp()` | ✅ `task.*` |
| **SalesOrder** | ✅ `syncOrders()` | ✅ `pushOrderToWeClapp()` | ✅ `salesOrder.*` |
| **TimeRecord** | ✅ `syncTimeEntries()` | ✅ `pushTimeEntryToWeClapp()` | ✅ `timeRecord.*` |

### Webhook-Events (konfiguriert)

| Entität | erstellt | geändert | gelöscht |
|---------|----------|----------|----------|
| `user` | ✅ | ✅ | ✅ |
| `party` | ✅ | ✅ | ✅ |
| `task` | ❌ | ✅ | ✅ |
| `salesOrder` | ✅ | ✅ | ✅ |
| `timeRecord` | ✅ | ✅ | ✅ |

### Konflikt-Erkennung

Bei bidirektionalem Sync kann es zu Konflikten kommen. Die App verwendet `lastModifiedDate` und `weClappLastModified` zur Erkennung:

```typescript
// Konflikt wenn beide seit letztem Sync geändert wurden
const hasConflict = localModified > lastSync && remoteModified > lastSync
```

### API-Endpunkte

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/sync/weclapp` | POST | Initiale Synchronisation (alle Daten) |
| `/api/webhooks/weclapp` | POST | Webhook-Empfänger für Echtzeit-Updates |

### Dateien

| Datei | Beschreibung |
|-------|--------------|
| `src/app/api/sync/weclapp/route.ts` | Pull-Sync (WeClapp → App) |
| `src/app/api/webhooks/weclapp/route.ts` | Webhook-Handler |
| `src/lib/weclapp/api.ts` | WeClapp API Client |
| `src/lib/weclapp/sync.ts` | Push-Sync (App → WeClapp) |
| `src/lib/logging/syncLogger.ts` | Sync & Audit Logging |

---

## 📋 Logging-Tabellen

### `sync_logs` - Sync-Protokoll

Protokolliert jede einzelne Sync-Operation (Pull, Push, Webhook).

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String (cuid) | Primärschlüssel |
| `syncType` | String | "pull", "push", "webhook", "manual" |
| `entityType` | String | "user", "party", "task", "order", "timeEntry" |
| `entityId` | String? | ID der betroffenen Entität |
| `action` | String | "created", "updated", "deleted", "skipped", "conflict" |
| `direction` | String | "weclapp_to_app", "app_to_weclapp" |
| `changesBefore` | JSON? | Zustand vor der Änderung |
| `changesAfter` | JSON? | Zustand nach der Änderung |
| `changedFields` | String[] | Liste der geänderten Felder |
| `success` | Boolean | Erfolgreich? |
| `errorMessage` | String? | Fehlermeldung |
| `triggeredBy` | String? | User ID oder "system", "webhook" |
| `createdAt` | DateTime | Zeitstempel |

### `audit_logs` - Audit-Log

Protokolliert alle Datenänderungen (nicht nur Sync).

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String (cuid) | Primärschlüssel |
| `tableName` | String | Tabellenname |
| `recordId` | String | ID des Datensatzes |
| `action` | String | "INSERT", "UPDATE", "DELETE" |
| `oldValues` | JSON? | Werte vor der Änderung |
| `newValues` | JSON? | Werte nach der Änderung |
| `changedFields` | String[] | Geänderte Felder |
| `userId` | String? | App-User ID |
| `userEmail` | String? | E-Mail |
| `ipAddress` | String? | IP-Adresse |
| `userAgent` | String? | Browser/Client |
| `createdAt` | DateTime | Zeitstempel |

### `sync_status` - Batch-Sync-Status

Protokolliert Batch-Synchronisationen (initiale Syncs, etc.).

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String (cuid) | Primärschlüssel |
| `syncType` | String | "initial", "incremental", "manual" |
| `status` | String | "running", "completed", "failed" |
| `totalRecords` | Int | Gesamtanzahl |
| `successCount` | Int | Erfolgreich |
| `failedCount` | Int | Fehlgeschlagen |
| `skippedCount` | Int | Übersprungen |
| `usersSync` | JSON? | { success: 10, failed: 0 } |
| `partiesSync` | JSON? | Statistik |
| `tasksSync` | JSON? | Statistik |
| `ordersSync` | JSON? | Statistik |
| `timeEntriesSync` | JSON? | Statistik |
| `startedAt` | DateTime | Startzeit |
| `completedAt` | DateTime? | Endzeit |
| `durationMs` | Int? | Dauer in ms |
| `errorMessage` | String? | Fehlermeldung |

---

## 🚀 Erweiterungen

### Geplante Tabellen

| Tabelle | Beschreibung | Priorität |
|---------|--------------|-----------|
| `projects` | Projektdaten | 🟡 Mittel |
| `comments` | Kommentare zu Tasks | 🟢 Niedrig |
| `attachments` | Dateianhänge | 🟢 Niedrig |
| `notifications` | Benachrichtigungen | 🟡 Mittel |

### Offene Fragen

- [ ] Sollen `weclapp_tasks` und `weclapp_orders` FK-Constraints bekommen?
- [ ] Brauchen wir eine `departments`-Tabelle?
- [ ] Soll `users.role` auf `roles.roleId` als FK verweisen?

---

## 📝 Änderungshistorie

| Datum | Version | Änderung |
|-------|---------|----------|
| 01.12.2025 | 1.5 | Sync & Audit Logging hinzugefügt (`sync_logs`, `audit_logs`, `sync_status`) |
| 01.12.2025 | 1.4 | Bidirektionaler Sync implementiert (Push + Pull + Webhooks) |
| 01.12.2025 | 1.3 | User ↔ WeClappUser: Echte 1:1 FK-Relation (optional auf beiden Seiten) |
| 01.12.2025 | 1.2 | Neue Tabelle `weclapp_parties`, echte FK-Relationen hinzugefügt |
| 01.12.2025 | 1.1 | WeClapp OpenAPI v2 abgeglichen, fehlende Felder ergänzt |
| 01.12.2025 | 1.0 | Initiale Dokumentation erstellt |

---

## ⚠️ Migration erforderlich

Nach dem Schema-Update muss eine Migration durchgeführt werden:

```bash
# Prisma-Typen generieren
npx prisma generate

# Migration erstellen und anwenden
npx prisma migrate dev --name add_weclapp_fields
```

**Hinweis:** Bei bestehenden Daten werden neue Boolean-Felder mit Default-Werten gefüllt.

---

*Diese Dokumentation wird bei Schema-Änderungen aktualisiert.*
