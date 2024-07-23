# Workflows

### Deployment

`deploy-dev.yml`, `deploy-stage.yml`, `deploy-prod.yml` use `deploy.yml` reusable workflow. 

`deploy-dev.yml`
- dev.geometra.rukkor.io
- cancels existing running workflows of the same type due to frequent pushes to `development`
- triggers `bundle-refresh` - pop-up dialog on website prompting user to refresh

`deploy-stage.yml`
- stage.geometra.rukkor.io
- runs consecutively - each workflow of the same type will be queued
- triggers `bundle-refresh`

`deploy-prod.yml`
- geometra.rukkor.io
- runs consecutively
- runs composite action (`actions/update-changelog/action.yml`) that updates changelog from GitHub release description
- triggers deployment workflow to prod in backend repository `geometra-server`
- also deploys to `geometra-4-website-backup` bucket, to folder named after release tag
- `bundle-refresh` is triggered after successful backend workflow run

### `check-backend.yml`

Runs on pull request from `development` to `master` as a reminder to also merge changes on backend in case there were any.

### `rollback.yml`

Triggered manually. Given the tag, checks for deployed backend and frontend versions labeled by it.
If both exist, the workflow switches production version to them:
- frontend: syncs from `geometra-4-website-backup/<tag name>/` to production bucket
- backend: changes the elastic beanstalk application version of prod environment
