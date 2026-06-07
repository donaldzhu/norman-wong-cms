# Frontend query mapping (post selectedWorks / allProjects swap)

After deploying the CMS schema swap and running the `swap-selected-all-naming` migration, update frontend GROQ queries as follows.

## Singleton documents

| Before | After |
|--------|-------|
| `*[_type == "selectedWorks"][0]{ projects, desktopLayout, mobileLayout }` | `*[_type == "allProjects"][0]{ projects, desktopLayout, mobileLayout }` |
| `*[_type == "allProjects"][0]{ projects[]-> }` | `*[_type == "selectedWorks"][0]{ projects[]-> }` |

## Project fields

| Before | After |
|--------|-------|
| `project.allProjectsThumbnails` | `project.selectedWorksThumbnails` |
| Nested `_type == "allProjectsThumbnail"` | `_type == "selectedWorksThumbnail"` |

## Nested object types (allProjects grid singleton)

| Before | After |
|--------|-------|
| `selectedWorksProject` | `allProjectsProject` |
| `selectedWorksMedia` | `allProjectsMedia` |
| `selectedWorksLayout` | `allProjectsLayout` |

## Unchanged

Header nav display-text fields are unchanged:

- `selectedWorksDisplayTextDesktop` / `Mobile`
- `allProjectsDisplayTextDesktop` / `Mobile`

## Migration commands

```bash
# Backup first
sanity dataset export production backup-pre-swap.tar.gz

# Dry run
npm run migrate:swap-selected-all-naming

# Apply (uses temp document IDs for singleton _id swap — safe single pass)
npm run migrate:swap-selected-all-naming:apply

# If selectedWorks singleton is missing after swap (legacy bug), restore list content:
npm run migrate:restore-selected-works-singleton:apply
```
