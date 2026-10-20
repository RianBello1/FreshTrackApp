# FreshTrack

Expo app using **Expo Router** (file-based routing in the `/app` folder).

## Routes

| File                  | URL              | Screen        |
| --------------------- | ---------------- | ------------- |
| `app/_layout.js`      | —                | Root stack    |
| `app/index.js`        | `/`              | Login         |
| `app/register.js`     | `/register`      | Register      |
| `app/dashboard.js`    | `/dashboard`     | Dashboard     |
| `app/add-item.js`     | `/add-item`      | Add item      |
| `app/expiring-soon.js`| `/expiring-soon` | Expiring soon |

Inventory state lives in `context/InventoryContext.js` (in memory, no AsyncStorage).

## Run

```
npm install
npx expo install --fix
npx expo start
```

Login: `admin123` / `admin123`
