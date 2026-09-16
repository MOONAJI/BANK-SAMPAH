# BANK-SAMPAH

Project for Web Development class. Work in progress.

Install dependencies and initiate seed:

```bash
git clone https://github.com/MOONAJI/BANK-SAMPAH.git
cd BANK-SAMPAH/backend
npm install
npm run seed
```

Run program:

```bash
npm run dev
```

Or run via Docker:

```bash
cd BANK-SAMPAH/backend
docker run --rm -it $(docker build -q .)
```

Note: for the moment, the backend uses MongoDB that runs locally. Make sure a local MongoDB service is active before running the program above.
