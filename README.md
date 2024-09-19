# Meeshio API

## Overview

Meeshio is an e-commerce backend platform inspired by Meesho. This API handles user authentication, product management, cart functionality, order processing, and payment integration. The backend is built using Node.js and Express, with MongoDB as the database. It provides a robust, scalable, and flexible API for managing all core operations, interacting seamlessly with the frontend to deliver a smooth user experience for customers, sellers, and administrators.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: JWT-based authentication with role-based access control.
- **Product Management**: CRUD operations for products, managed by suppliers.
- **Cart Functionality**: Users can add, update, and remove items from their cart.
- **Order Processing**: Users can create, view, update, and delete orders.
- **Payment Integration**: Includes payment processing, status tracking, and refund initiation.
- **AWS S3 Integration**: Image upload and management using AWS S3.

## Technologies

- **Node.js**
- **Express.js**
- **MongoDB**
- **JWT for Authentication**
- **AWS SDK for S3**
- **Multer for File Upload**
- **Nodemailer for Emailing**
- **Bcrypt for Password Hashing**

## Installation

### Prerequisites

- Node.js (v14.x or higher)
- MongoDB (local or hosted on MongoDB Atlas)
- AWS Account (for S3 image storage)

### Clone the Repository

```bash
git clone https://github.com/Atishfulzade/meeshio-api.git

cd meeshio-api

npm install

npm run dev

```
# Environment Variables
### Create a .env file in the root directory and add the following environment variables:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
EMAIL_HOST=smtp.your_email_provider.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password


## The API has several endpoints across different routes. Below is a brief overview:

### User Routes
POST /api/v1/auth/login 
- Login user
POST /api/v1/auth/register
- Register new user
POST /api/v1/auth/logout
- Logout user
GET /api/v1/auth/profile
- Get user profile
PUT /api/v1/auth/profile
- Update user profile
### Supplier Routes
POST /api/v1/supplier/login 
- Login supplier
POST /api/v1/supplier/register
- Register new supplier
GET /api/v1/supplier/profile/
- Get supplier profile
PUT /api/v1/supplier/profile/
- Update supplier profile
DELETE /api/v1/supplier/profile/
- Delete supplier profile
### Product Routes
GET /api/v1/products 
- Get all products
POST /api/v1/products
- Create a new product
GET /api/v1/products/
- Get a product by ID
PUT /api/v1/products/
- Update product details
DELETE /api/v1/products/
- Delete a product
### Cart Routes
GET /api/v1/cart 
- Fetch all items in the cart
POST /api/v1/cart
- Add a new item to the cart
PUT /api/v1/cart/
- Update a specific item in the cart
DELETE /api/v1/cart/
- Remove a specific item from the cart
### Order Routes
POST /api/v1/orders 
- Create a new order
GET /api/v1/orders
- Get all orders
GET /api/v1/orders/
- Get an order by ID
PUT /api/v1/orders/
- Update an order
DELETE /api/v1/orders/
- Delete an order
### Payment Routes
POST /api/v1/payment/payment 
- Process a payment
GET /api/v1/payment/status/
- Get payment status
GET /api/v1/payment/history/
- Get payment history
POST /api/v1/payment/refund/
- Initiate a refund
GET /api/v1/payment/methods
- Get available payment methods

## Deployment
[Deplyed link](https://meeshio.onrender.com/)

