# DWEapp - Änderungsprotokoll

Dieses Protokoll dokumentiert alle wichtigen Änderungen am Projekt, insbesondere Datenbankschema- und Sync-Änderungen.

---

## [1.4.0] - 2024-12-01

### 🔄 Bidirektionaler WeClapp Sync

#### Zusammenfassung
Komplette Implementierung des bidirektionalen Syncs zwischen DWEapp und WeClapp für alle Entitäten.

---

### Datenbankschema-Änderungen (`prisma/schema.prisma`)

#### NEUE TABELLE: `weclapp_parties`

```prisma
model WeClappParty {
  id                    String   @id
  partyType             String?
  company               String?
  company2              String?
  firstName             String?
  lastName              String?
  middleName            String?
  salutation            String?
  email                 String?
  emailHome             String?
  phone                 String?
  mobilePhone1          String?
  fax                   String?
  website               String?
  birthDate             DateTime?
  customer              Boolean  @default(false)
  customerNumber        String?
  customerBlocked       Boolean  @default(false)
  customerCreditLimit   Decimal?
  supplier              Boolean  @default(false)
  supplierNumber        String?
  primaryAddressId      String?
  invoiceAddressId      String?
  deliveryAddressId     String?
  addresses             Json?
  bankAccounts          Json?
  contacts              Json?
  tags                  Json?
  customAttributes      Json?
  createdDate           DateTime?
  lastModifiedDate      DateTime?
  lastSyncAt            DateTime @default(now())
  isActive              Boolean  @default(true)
  
  // Relationen
  tasks                 WeClappTask[]
  orders                WeClappOrder[]
  timeEntries           WeClappTimeEntry[]
  
  @@map("weclapp_parties")
}
```

**Rollback:**
```sql
DROP TABLE IF EXISTS weclapp_parties CASCADE;
```

---

#### GEÄNDERT: `weclapp_users`

**Neue Felder:**
- `title` (String?)
- `birthDate` (DateTime?)
- `phoneNumber` (String?)
- `mobilePhoneNumber` (String?)
- `faxNumber` (String?)
- `imageId` (String?)
- `status` (String, default: "ACTIVE") - ersetzt `active` Boolean
- `userRoles` (Json?)
- `licenses` (Json?)
- `customAttributes` (Json?)
- `appUser` (Relation zu User)

**Entfernte Felder:**
- `active` (Boolean) → ersetzt durch `status`

**Rollback:**
```sql
ALTER TABLE weclapp_users 
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS "birthDate",
  DROP COLUMN IF EXISTS "phoneNumber",
  DROP COLUMN IF EXISTS "mobilePhoneNumber",
  DROP COLUMN IF EXISTS "faxNumber",
  DROP COLUMN IF EXISTS "imageId",
  DROP COLUMN IF EXISTS "userRoles",
  DROP COLUMN IF EXISTS licenses,
  DROP COLUMN IF EXISTS "customAttributes";

ALTER TABLE weclapp_users 
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- status zu active konvertieren
UPDATE weclapp_users SET active = (status = 'ACTIVE');
ALTER TABLE weclapp_users DROP COLUMN IF EXISTS status;
```

---

#### GEÄNDERT: `weclapp_tasks`

**Neue Felder:**
- `taskVisibilityType` (String?)
- `positionNumber` (Int?)
- `previousTaskId` (String?)
- `articleId` (String?)
- `ticketId` (String?)
- `calendarEventId` (String?)
- `userOfLastStatusChangeId` (String?)
- `allowOverBooking` (Boolean, default: false)
- `allowTimeBooking` (Boolean, default: true)
- `billableStatus` (Boolean?)
- `invoicingStatus` (String?)

**Neue Relationen:**
- `creator` → WeClappUser
- `customer` → WeClappParty
- `parentTask` → WeClappTask (Selbstreferenz)
- `previousTask` → WeClappTask (Selbstreferenz)
- `timeEntries` → WeClappTimeEntry[]

**Rollback:**
```sql
ALTER TABLE weclapp_tasks 
  DROP COLUMN IF EXISTS "taskVisibilityType",
  DROP COLUMN IF EXISTS "positionNumber",
  DROP COLUMN IF EXISTS "previousTaskId",
  DROP COLUMN IF EXISTS "articleId",
  DROP COLUMN IF EXISTS "ticketId",
  DROP COLUMN IF EXISTS "calendarEventId",
  DROP COLUMN IF EXISTS "userOfLastStatusChangeId",
  DROP COLUMN IF EXISTS "allowOverBooking",
  DROP COLUMN IF EXISTS "allowTimeBooking",
  DROP COLUMN IF EXISTS "billableStatus",
  DROP COLUMN IF EXISTS "invoicingStatus";
```

---

#### GEÄNDERT: `weclapp_orders`

**Umbenannte Felder:**
- `orderId` → `orderNumber`

**Neue Felder:**
- `orderNumberAtCustomer` (String?)
- `orderDate` (DateTime?)
- `invoiceRecipientId` (String?)
- `note` (String?)
- `invoiced` (Boolean, default: false)
- `paid` (Boolean, default: false)
- `shipped` (Boolean, default: false)
- `servicesFinished` (Boolean, default: false)
- `projectModeActive` (Boolean, default: false)
- `warehouseId` (String?)
- `quotationId` (String?)
- `plannedProjectStartDate` (DateTime?)
- `plannedProjectEndDate` (DateTime?)
- `payments` (Json?)
- `projectMembers` (Json?)
- `statusHistory` (Json?)

**Neue Relationen:**
- `customer` → WeClappParty
- `timeEntries` → WeClappTimeEntry[]

**Rollback:**
```sql
ALTER TABLE weclapp_orders 
  RENAME COLUMN "orderNumber" TO "orderId";

ALTER TABLE weclapp_orders 
  DROP COLUMN IF EXISTS "orderNumberAtCustomer",
  DROP COLUMN IF EXISTS "orderDate",
  DROP COLUMN IF EXISTS "invoiceRecipientId",
  DROP COLUMN IF EXISTS note,
  DROP COLUMN IF EXISTS invoiced,
  DROP COLUMN IF EXISTS paid,
  DROP COLUMN IF EXISTS shipped,
  DROP COLUMN IF EXISTS "servicesFinished",
  DROP COLUMN IF EXISTS "projectModeActive",
  DROP COLUMN IF EXISTS "warehouseId",
  DROP COLUMN IF EXISTS "quotationId",
  DROP COLUMN IF EXISTS "plannedProjectStartDate",
  DROP COLUMN IF EXISTS "plannedProjectEndDate",
  DROP COLUMN IF EXISTS payments,
  DROP COLUMN IF EXISTS "projectMembers",
  DROP COLUMN IF EXISTS "statusHistory";
```

---

#### GEÄNDERT: `weclapp_time_entries`

**Umbenannte Felder:**
- `durationInSeconds` → `durationSeconds`
- `date` → `startDate`

**Neue Felder:**
- `customerId` (String?)
- `projectId` (String?)
- `salesOrderId` (String?)
- `articleId` (String?)
- `ticketId` (String?)
- `billableDurationSeconds` (Int?)
- `billable` (Boolean, default: false)
- `billableInvoiceStatus` (String?)
- `hourlyRate` (Decimal?)
- `printOnPerformanceRecord` (Boolean, default: false)
- `customAttributes` (Json?)

**Neue Relationen:**
- `task` → WeClappTask
- `user` → WeClappUser
- `customer` → WeClappParty
- `salesOrder` → WeClappOrder

**Rollback:**
```sql
ALTER TABLE weclapp_time_entries 
  RENAME COLUMN "durationSeconds" TO "durationInSeconds";
ALTER TABLE weclapp_time_entries 
  RENAME COLUMN "startDate" TO date;

ALTER TABLE weclapp_time_entries 
  DROP COLUMN IF EXISTS "customerId",
  DROP COLUMN IF EXISTS "projectId",
  DROP COLUMN IF EXISTS "salesOrderId",
  DROP COLUMN IF EXISTS "articleId",
  DROP COLUMN IF EXISTS "ticketId",
  DROP COLUMN IF EXISTS "billableDurationSeconds",
  DROP COLUMN IF EXISTS billable,
  DROP COLUMN IF EXISTS "billableInvoiceStatus",
  DROP COLUMN IF EXISTS "hourlyRate",
  DROP COLUMN IF EXISTS "printOnPerformanceRecord",
  DROP COLUMN IF EXISTS "customAttributes";
```

---

#### GEÄNDERT: `users`

**Geänderte Felder:**
- `weClappUserId` → jetzt `@unique` und echter FK zu `weclapp_users`

**Neue Relationen:**
- `weClappUser` → WeClappUser (1:1, optional)

**Rollback:**
```sql
-- Unique Constraint entfernen
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_weClappUserId_key;
```

---

### Code-Änderungen

#### NEUE DATEI: `src/lib/weclapp/sync.ts`

Push-Sync Service für bidirektionalen Sync (App → WeClapp).

**Funktionen:**
- `pushTaskToWeClapp(localTaskId)`
- `pushTimeEntryToWeClapp(localEntryId)`
- `pushOrderToWeClapp(localOrderId)`
- `checkForConflict(entityType, localId)`
- `pushAllPendingChanges()`

**Rollback:** Datei löschen
```bash
rm src/lib/weclapp/sync.ts
```

---

#### GEÄNDERT: `src/lib/weclapp/api.ts`

**Neue Methoden:**
- `getParties()`, `getParty()`, `createParty()`, `updateParty()`, `deleteParty()`
- `getSalesOrders()`, `getSalesOrder()`, `createSalesOrder()`, `updateSalesOrder()`, `deleteSalesOrder()`
- `getTimeRecords()`, `getTimeRecord()`, `createTimeRecord()`, `updateTimeRecord()`, `deleteTimeRecord()`

**Rollback:** Methoden ab Zeile 199 entfernen (ab `// PARTIES`)

---

#### GEÄNDERT: `src/app/api/sync/weclapp/route.ts`

**Neue/Erweiterte Funktionen:**
- `syncParties()` - NEU
- `syncOrders()` - implementiert (war TODO)
- `syncTimeEntries()` - implementiert (war TODO)
- `syncUsers()` - erweitert mit neuen Feldern
- `syncTasks()` - erweitert mit neuen Feldern

**Rollback:** Alte Version aus Git wiederherstellen
```bash
git checkout HEAD~1 -- src/app/api/sync/weclapp/route.ts
```

---

#### GEÄNDERT: `src/app/api/webhooks/weclapp/route.ts`

**Neue Handler:**
- `handleUserWebhook()` - NEU
- `handlePartyWebhook()` - NEU
- `handleOrderWebhook()` - implementiert (war TODO)
- `handleTimeEntryWebhook()` - implementiert (war TODO)

**Rollback:** Alte Version aus Git wiederherstellen
```bash
git checkout HEAD~1 -- src/app/api/webhooks/weclapp/route.ts
```

---

### Vollständiger Rollback

Um alle Änderungen rückgängig zu machen:

```bash
# 1. Git-Änderungen zurücksetzen (vor Commit)
git checkout -- prisma/schema.prisma
git checkout -- src/lib/weclapp/api.ts
git checkout -- src/app/api/sync/weclapp/route.ts
git checkout -- src/app/api/webhooks/weclapp/route.ts
rm -f src/lib/weclapp/sync.ts

# 2. Oder: Letzten Commit rückgängig machen (nach Commit)
git revert HEAD

# 3. Datenbank-Migration zurücksetzen
npx prisma migrate reset
# ACHTUNG: Löscht alle Daten!

# 4. Alternativ: Nur Schema zurücksetzen (Daten behalten)
npx prisma db push --force-reset
```

---

## [1.3.0] - 2024-12-01

### User ↔ WeClappUser Relation

- `User.weClappUserId` als echter FK mit `@unique`
- Optionale 1:1 Relation zwischen App-User und WeClapp-User

---

## [1.2.0] - 2024-12-01

### Neue Tabelle `weclapp_parties`

- Kunden, Lieferanten, Kontakte aus WeClapp
- FK-Relationen zu Tasks, Orders, TimeEntries

---

## [1.1.0] - 2024-12-01

### WeClapp OpenAPI Abgleich

- Fehlende Felder in allen WeClapp-Tabellen ergänzt
- Feldnamen an WeClapp API angepasst

---

## [1.0.0] - 2024-12-01

### Initiale Dokumentation

- DATABASE.md erstellt
- Prisma-Schema dokumentiert
