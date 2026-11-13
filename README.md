# Event Feedback System

## Project Description

The Event Feedback System is a MERN app where event organisers create events, and open them for feedback. Attendees then leave a rating, and comments on events they went to.

This application is forked from the unit's task manager start project.

## Setup

### (local)

#### Prerequisites

- Node.js >=20.0.0
- npm
- MongoDB (Atlas used in this project)

#### Steps

1. Clone the repo, and install

    ```bash
    git clone https://github.com/xdaybreakerx/IFQ636-A1.git
    cd IFQ636-A1
    npm run install-all
    ```

2. Create `backend/.env` by copying `backend/.env.example` and fill in:

- `MONGO_URI` - your Mongo connection string
- `JWT_SECRET` - a random long string
    - or generate:
        ```bash
        openssl rand -base64 32
        ```
- `PORT` - default `5001` - the frontend proxies to this
    - changable for deployment - see below
- `ORGANISER_EMAIL`, `ORGANISER_PASSWORD`, `ATTENDEE_EMAIL`, `ATTENDEE_PASSWORD` - logins for the seed data

3.  Seed the database

        **NOTE**
        The seed functions fully drop the existing database - do not use in prod

        ```bash
        npm run reset --prefix backend
        ```

    **NOTE**

    New accounts made through the register page are attendees. The organiser accounts come via either seed data, or through direct API calls.

4.  Run the app (backend and frontend)

    ```bash
    npm run dev
    ```

5.  Access the app

- frontend: http://localhost:3000
- backend: http://localhost:5001/api

### Tests

The API tests are provided via Postman through `postman/collections/`.

Backend unit tests with Mocha:

```bash
npm test --prefix backend
```

### Deployment (manual)

CI/CD is out of scope for this assignment. Deployment is done manually over SSH.

#### First setup

1. Launch an Ubuntu EC2 instance as outlined through the required university configuration and setup documentation.
2. Add the instance's public IP to MongoDB Atlas Network Access whitelist.
3. SSH in and install required tools:

    ```bash
    sudo apt update && sudo apt upgrade
    sudo apt install git nodejs npm nginx -y
    sudo npm install -g pm2
    ```

4. Clone the repo and create `backend/.env` on the server.

    ```bash
    cd ~/IFQ636-A1/backend
    touch .env
    nano .env
    ```

5. Start the backend and build and serve the frontend.

    ```bash
    cd ~/IFQ636-A1/backend
    npm ci
    pm2 start "npm run start" --name backend

    cd ../frontend
    npm ci
    npm run build
    pm2 serve build/ 3000 --name frontend --spa
    pm2 startup && pm2 save
    ```

6. Configure nginx to send `/api/` to port 5001 and `/` to port 3000
    - instructions available within the config file

        `/etc/nginx/sites-available/default`

7. Reload nginx

    ```bash
    sudo nginx -t && sudo systemctl reload nginx
    ```

#### Updating

## Architecture

### Features

### Tech

## Known Limitations

## Deployment URL

**Live App (EC2):** [http://8.8.8.8](http://8.8.8.88)

<!-- TODO -->
<!-- UPDATE WITH IP ADDRESS ON DAY OF RELEASE TAG -->

### Known Deployment Limitation

- The uni provided AWS EC2 instance doesn't allow use of an Elastic IP, so the public ip address changes whenever the instance is stopped and started.
- Additionally the instances are set to stop automatically at midnight daily.
- As such the IP address above is current as of DATE
      <!-- TO DO - UPDATE DATE + SCREENSHOT DEPLOYED APP -->
- If the application does not load, the new IP address needs to be added to this doc, and whitelisted within the MongoDB Atlas.

```

```
