# Backend-for-Frontend - FusionAuth Hosted Backend: Frontend

1. In your filesystem, open a console in the `auth-architecture/bff-hb/frontend-ng` folder
2. Run `npm install`
3. Run `npm start` to run the development environment using the Angular CLI, accessible in the browser at `http://localhost:4200`

If you have the FusionAuth container running, you should be able to log into the frontend app with the admin credentials provided in the FusionAuth installation section.

This demo [uses a proxy](https://github.com/kmaida/auth-architecture-ng/blob/main/bff-hb/frontend-ng/proxy.conf.json) for requests to the external `resource-api` in order to use cookies (requires same origin) to access the API.

## Concurrent architectures

You will not be able to run multiple architecture demos at the same time because they share ports. If you'd like to run multiple apps at the same time, you must change the ports.

All apps share the same FusionAuth instance, so there is no need to run multiple FusionAuth containers.