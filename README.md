# EnrichIQ Dev

This repository contains the source code for the **EnrichIQ** project, including both the frontend and backend components.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Set Up Environment Variables](#2-set-up-environment-variables)
    - [3. Install Dependencies](#3-install-dependencies)
    - [4. Running the Project](#4-running-the-project)
4. [Monitoring and Management](#monitoring-and-management)
    - [Supabase](#supabase)
    - [Stripe](#stripe)
5. [License](#license)

## Project Structure

```
enrich-iq-dev/
├── enrichiq_backend/
├── enrichiq_frontend/
└── README.md
```

- **`enrichiq_backend/`**: Contains the backend code for the project.
- **`enrichiq_frontend/`**: Contains the frontend code for the project.

## Prerequisites

Ensure you have the following installed on your local development environment:

- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher)
- **Supabase account** for database management
- **Stripe account** for handling payments

## Setup Instructions

### 1. Clone the Repository

Start by cloning the repository to your local machine:

```bash
git clone https://github.com/devenrichiq/enrich-iq-dev.git
cd enrich-iq-dev
```

### 2. Set Up Environment Variables

You'll need to create `.env` files in both the `enrichiq_backend` and `enrichiq_frontend` directories with the necessary environment variables. Below are the formats to follow:

#### Backend (`enrichiq_backend/.env`)

```env
SUPABASE_URL=<YOUR_SUPABASE_URL>
SUPABASE_SERVICE_KEY=<YOUR_SUPABASE_SERVICE_KEY>

# Test Keys
STRIPE_SECRET_KEY_TEST=<YOUR_STRIPE_SECRET_KEY_TEST>
STRIPE_WH_SECRET_KEY_TEST=<YOUR_STRIPE_WH_SECRET_KEY_TEST>

# Production Keys
STRIPE_SECRET_KEY=<YOUR_STRIPE_SECRET_KEY>
STRIPE_WH_SECRET_KEY=<YOUR_STRIPE_WH_SECRET_KEY>

PORT=4000
```

#### Frontend (`enrichiq_frontend/.env`)

```env
SUPABASE_URL=<YOUR_SUPABASE_URL>
SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
```

Replace `<YOUR_SUPABASE_URL>`, `<YOUR_SUPABASE_SERVICE_KEY>`, `<YOUR_SUPABASE_ANON_KEY>`, and other placeholders with the actual values provided by your Supabase and Stripe accounts.

### 3. Install Dependencies

Navigate to each directory and install the required packages:

#### Backend

```bash
cd enrichiq_backend
npm install
```

#### Frontend

```bash
cd enrichiq_frontend
npm install
```

### 4. Running the Project

To start the project, run the following commands:

#### Backend

```bash
cd enrichiq_backend
npm start
```

#### Frontend

```bash
cd enrichiq_frontend
npm run dev
```

This will start the backend server on port 4000 and the frontend server on the default port (usually 3000).

## Monitoring and Management

### Supabase

Login to your [Supabase dashboard](https://app.supabase.io/) to:

- **View Logs**: Check for any issues in real-time.
- **Table Editor**: Manage and view the tables and data related to the project.

### Stripe

Login to your [Stripe dashboard](https://dashboard.stripe.com/) to:

- **View Subscriptions**: Monitor customer subscriptions and payment activity.
- **Manage API Keys**: Handle your test and live API keys.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
