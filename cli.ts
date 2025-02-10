// Generate tsconfig.base.json if it doesn't exist
if (!fs.existsSync('tsconfig.base.json')) {
  fs.writeFileSync(
    'tsconfig.base.json',
    JSON.stringify({
      // ... existing code ...
    })
  );
}
