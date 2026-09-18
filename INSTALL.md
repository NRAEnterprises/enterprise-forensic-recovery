# Installation

## GitHub source installation

```bash
git clone https://github.com/Nabbey88/enterprise-forensic-recovery.git
cd enterprise-forensic-recovery
npm ci
npm link
recovery doctor
```

## Local tarball installation

Use an absolute path or run the command from the directory containing the tarball:

```bash
npm install --global /absolute/path/to/enterprise-recovery-forensic-recovery-0.2.0.tgz
recovery doctor
```

The earlier relative install form failed when executed outside the directory containing the tarball. A package filename by itself is not globally resolvable from an arbitrary working directory.

## npm registry installation

The package can be installed from npm after publication:

```bash
npm install --global @enterprise-recovery/forensic-recovery
recovery doctor
```

The current build environment is not authenticated to the npm registry, so registry publication must be completed by an authorized npm maintainer.
