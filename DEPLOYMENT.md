# Guía de Despliegue - Asesor Pulpo

## 1. Preparación para GitHub

### Crear Repositorio en GitHub
1. Ve a [github.com](https://github.com)
2. Crea un nuevo repositorio llamado `asesor_pulpo`
3. Hazlo público o privado según prefieras

### Subir a GitHub
\`\`\`bash
# Inicializar repositorio local
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "Initial commit: Asesor Pulpo procurement system"

# Conectar con repositorio remoto
git remote add origin https://github.com/jotacas070/asesor_pulpo.git

# Subir código
git branch -M main
git push -u origin main
\`\`\`

## 2. Despliegue en Vercel

### Opción A: Desde GitHub (Recomendado)
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu cuenta de GitHub
3. Importa el repositorio `jotacas070/asesor_pulpo`
4. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`
5. Despliega

### Opción B: Vercel CLI
\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GROQ_API_KEY
\`\`\`

## 3. Configuración de Dominio Personalizado

### En Vercel:
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Domains
3. Agrega tu dominio personalizado
4. Configura DNS según las instrucciones

## 4. Configuración de Acceso Único

### Credenciales de Administrador:
- Usuario: `admin_abas`
- Contraseña: `pulpopedia`

### Para cambiar credenciales:
Edita el archivo `components/admin-banner.tsx` líneas 25-26:
\`\`\`typescript
if (usuario === 'tu_nuevo_usuario' && clave === 'tu_nueva_clave') {
\`\`\`

## 5. Configuración de Base de Datos

### Scripts SQL a ejecutar en Supabase:
1. `scripts/01-create-tables.sql`
2. `scripts/02-seed-data.sql`
3. `scripts/04-create-config-table.sql`
4. `scripts/04-create-documentos-table.sql`

## 6. Verificación Post-Despliegue

### Checklist:
- [ ] Aplicación carga correctamente
- [ ] Sistema de consultas funciona
- [ ] Panel administrativo accesible
- [ ] Carga de documentos operativa
- [ ] Configuración de IA guardable
- [ ] Base de datos conectada

## 7. Monitoreo y Mantenimiento

### Logs en Vercel:
- Functions → Ver logs de API
- Analytics → Métricas de uso

### Actualizaciones:
\`\`\`bash
# Hacer cambios
git add .
git commit -m "Descripción del cambio"
git push origin main
# Vercel despliega automáticamente
\`\`\`

## URLs de Ejemplo

- **Producción**: `https://asesor-pulpo.vercel.app`
- **Con dominio personalizado**: `https://tu-dominio.com`
- **Panel Admin**: `https://tu-dominio.com/config`

## Soporte

Para problemas de despliegue:
1. Revisa logs en Vercel Dashboard
2. Verifica variables de entorno
3. Confirma conexión a Supabase
4. Revisa configuración de Groq API
