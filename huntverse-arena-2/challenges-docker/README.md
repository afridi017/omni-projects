# Isolated challenge labs

Every lab must run on a disposable, resource-limited network with no host Docker socket and no route to public targets.

Build example images with:

```bash
docker build -t huntverse/sqli-lab:dev ./sqli-lab
docker network create --internal huntverse-labs
```

The evaluator should issue a room-specific flag derived from a server seed. Never trust a browser-submitted answer and never mount `/var/run/docker.sock` inside a challenge.
