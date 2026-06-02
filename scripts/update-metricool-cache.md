# Actualizar datos de Metricool

Este script debe correrse desde Cowork para refrescar los datos de campañas y social media.

## Cómo usarlo

Abrí Cowork y pedile a Claude:

> "Actualizá los datos de Metricool para SIMET Fábrica del mes actual y pusheá los cambios"

Claude va a:
1. Llamar a Metricool via MCP para el mes actual
2. Escribir los JSON en `/public/data/`
3. Hacer git push
4. Vercel redeploy automático (~2 min)

## Datos que se actualizan

- `public/data/meta-campaigns.json` — campañas Meta Ads activas
- `public/data/google-campaigns.json` — campañas Google Ads
- `public/data/social-stats.json` — métricas de Instagram

## Frecuencia recomendada

- Una vez por semana (los lunes)
- O antes de presentaciones / reportes

## brandIds disponibles con paid media

| Marca | brandId | Meta | Google |
|---|---|---|---|
| Simet Fábrica | 1674000 | ✅ | ✅ |
| Uakika | 1170841 | ✅ | ✅ |
| Peiperless | 1502244 | ✅ | ✅ |
| Bebesit | 4009725 | ✅ | ✅ |
