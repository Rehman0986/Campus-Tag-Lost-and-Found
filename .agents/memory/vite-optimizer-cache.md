---
name: Vite dependency optimizer cache
description: Stale optimized dependencies can make preview report an outdated React/react-dom mismatch.
---

When the browser reports a React/react-dom version mismatch after dependency versions are updated, verify the artifact's direct package resolution and inspect Vite's optimized cache in `node_modules/.vite`. If direct versions are consistent but preview still reports the old version, clear the generated Vite cache and restart the web workflow before changing package versions further.

**Why:** package manifests and direct runtime resolution were correct while the browser continued loading an older optimized React DOM bundle.

**How to apply:** check installed package versions first; only clear the Vite cache when optimizer output is stale, then restart the affected Vite workflow.
