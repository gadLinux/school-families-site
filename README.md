# familiasdiegovelazquez.es

Web independiente para las familias del IES Diego Velázquez (Torrelodones):
compartir experiencias, consultar datos del centro con sus fuentes y proponer mejoras.

> Iniciativa de familias. Sin vínculo con el IES Diego Velázquez ni con su AMPA.

## Estructura

```
web/        Web pública (Astro, sitio estático)
ansible/    Despliegue y configuración del servidor (nginx + Let's Encrypt)
.github/    CI, plantillas de issues y pull requests
```

## Desarrollo local

Requisitos: Node.js 24 (`.nvmrc`).

```bash
cd web
npm ci
npm run dev        # http://localhost:4321
npm run build      # compila a web/dist
npm run preview    # sirve web/dist
```


## Despliegue

Ver [`ansible/README.md`](ansible/README.md). Resumen:

```bash
cd ansible
ansible-playbook tests/test-local.yml          # prueba nginx en Docker, en local
ansible-playbook playbooks/site.yml --check    # simulación contra el servidor
ansible-playbook playbooks/site.yml            # primera instalación
ansible-playbook playbooks/deploy-web.yml      # publicar una nueva versión
```

## Hoja de ruta

- [x] Portada provisional y despliegue
- [x] Diseño de tarjetas de experiencias (masonry de 3 columnas)
- [ ] Estadísticas del centro con fuentes
- [ ] Contacto, aviso legal y privacidad
- [ ] Publicación de experiencias con moderación (PocketBase + SQLite)
- [ ] Comentarios moderados y reportes

## Contacto

familias.diego.velazquez@gmail.com · Seguridad: ver [SECURITY.md](SECURITY.md)

## Licencia

Código bajo licencia [MIT](LICENSE).
