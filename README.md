# Accessibility Audit

### TODO

- [ ] Install chromium headless on jenkins server

- [ ] Relax CSP rules in `/etc/default/jenkins`:
```
JAVA_ARGS="-Djava.awt.headless=true -Dhudson.model.DirectoryBrowserSupport.CSP=\"default-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';\""
```

- [ ] Move `accessibility-audit` repo from dpfrakes to NGS (GitHub)
