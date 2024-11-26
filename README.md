# Accessibility Audit

### Installation

```sh
git clone git@github.com:dpfrakes/accessibility-audit.git
cd accessibility-audit
npm i
```

Manually replace Jenkins variables with URLs to audit

```sh
node app.js
```

See `report/index.html` for graphical summary
See `reports/*.csv` for detailed page-specific reports

### TODO

- [ ] Install chromium headless on jenkins server

- [ ] Relax CSP rules in `/etc/default/jenkins`:
```
JAVA_ARGS="-Djava.awt.headless=true -Dhudson.model.DirectoryBrowserSupport.CSP=\"default-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';\""
```

- [ ] Move `accessibility-audit` repo from dpfrakes to NGS (GitHub)
