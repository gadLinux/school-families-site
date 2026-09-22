# Cómo contribuir

¡Gracias por querer ayudar!

## Flujo de trabajo

1. Crea una rama desde `main`: `feat/…`, `fix/…` o `docs/…`.
2. Haz commits pequeños con mensajes descriptivos en español o inglés.
3. Comprueba que la web compila: `cd web && npm ci && npm run build`.
4. Abre un *pull request* rellenando la plantilla.

## Normas de contenido

- Ningún commit puede incluir **datos personales** (nombres, emails, fotos de
  menores, documentos sin anonimizar).
- Las cifras de la sección de estadísticas deben citar su **fuente y fecha**.
- Los secretos (contraseñas, claves) van cifrados con `ansible-vault`, nunca en claro.

## Entorno

- Node.js 24 (ver `.nvmrc`).
- ansible-core ≥ 2.16 para desplegar (ver `ansible/README.md`).
