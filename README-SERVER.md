# Starting the Local Server

## Easiest Way (Recommended)

Just run:
```bash
npm start
```

or

```bash
npm run serve
```

This will automatically:
- Kill any existing server on port 8000
- Start a new server at http://localhost:8000

## Alternative Methods

### Using the shell script:
```bash
./start-server.sh
```

### Direct Python command:
```bash
python3 -m http.server 8000
```

## VS Code Users

If you have the "Live Server" extension installed, you can:
1. Right-click on `index.html`
2. Select "Open with Live Server"

This gives you auto-reload on file changes!
