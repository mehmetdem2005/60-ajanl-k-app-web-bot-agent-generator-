# Planner Agent Ecosystem

Bu repo için ilk kurulum bootstrap dosyası eklendi.

## Başlat

```bash
bash bootstrap-repo.sh
```

Bu komut:
- zip içeriğini repo içine açar
- `komutlar.txt`, `komutlar-2.txt`, `komutlar-3.txt`, `komutlar-4.txt` içindeki eksik dosyaları da oluşturur
- `packages/registry`, `monitoring`, `infra/helm`, `packages/cli`, `scripts/migrate-to-core.js` gibi eksik parçaları yazar
