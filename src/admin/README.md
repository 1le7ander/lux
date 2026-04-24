# src/admin

Admin-only domain logic. Anything that should never leak into a client bundle
lives in `src/server/`; anything that can be rendered on either side lives in
`src/components/admin/`. This folder is a namespace for shared admin types /
helpers that don't fit either.
