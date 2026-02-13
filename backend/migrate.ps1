# Run Prisma migration in interactive mode
Write-Host "Creating new migration for redesigned schema..." -ForegroundColor Green
npx prisma migrate dev --name redesign_project_version_structure

Write-Host "`nMigration complete! Now run: npm run seed" -ForegroundColor Green
