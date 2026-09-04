# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Email [hello@desource-labs.org](mailto:hello@desource-labs.org) with:

- the affected package and version;
- impact and realistic attack scenario;
- reproduction steps or a proof of concept; and
- any suggested mitigation.

We aim to acknowledge reports within 48 hours and provide a status update within five business days. Fix timing depends on severity; critical issues are prioritized for an expedited patch and coordinated disclosure.

## Scope

Security reports are welcome for `@desource/image`, `@desource/image-angular`, `@desource/image-react`, `@desource/image-svelte`, their image-provider URL generation, and the optional local IPX integrations.

When enabling remote image optimization, restrict `domains` or `remotePatterns`. An unrestricted optimizer can become a server-side request forgery or bandwidth-abuse surface. Keep framework, `ipx`, and image-processing dependencies current, and do not expose private network hosts through custom providers.

Third-party CDN incidents and vulnerabilities in dependencies should also be reported to the relevant upstream project. We still welcome a private heads-up when Desource Image users need a mitigation.
