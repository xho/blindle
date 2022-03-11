# blindle
An implementation of Wordle for blind or visually impaired people

## First time setup

1. Install ionic
2. Clone repo
3. `npm install`

## Develop and serve web app

1. `npm install` (only after git pull or branch checkout)
2. `ionic serve`

## Build for production

`ionic build --prod`


## Released on Netlify

The file `_redirects` in the root of the projects is specific to Netlify: it redirects every request to /index.html (routes are managed by the SPA). The file is automatically copied into the dist folder. So the build command on netlify is:

 `npm run build; cp _redirects www/`
