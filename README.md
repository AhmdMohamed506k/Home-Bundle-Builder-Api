
# 🛍️ Bundle Builder API - E-commerce Backend

A professional, full-stack API developed as a take-home assignment solution. This project provides a flexible shopping cart management system with support for secure payments using Stripe Checkout.

## 🛠️ Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose)
* **Payment Gateway:** Stripe API
* **Caching:** Redis (Upstash) - Cloud-based caching for high performance
* **Validation:** Joi (Schema-based request validation)

## 🚀 Key Features
* **Cart Logic:** Full lifecycle management for shopping carts (CRUD operations).
* **Payment Integration:** Integrated with `Stripe Checkout` to generate secure payment sessions.
* **Security & Validation:** Endpoint protection using `Joi` to ensure data integrity before processing.
* **Performance:** Utilizing `Redis` for high-speed data access and reduced database load.
* **Production Ready:** Redis configuration optimized for cloud environments with TLS support.

## 📁 Project Structure
```text
src/
├── modules/          # Application modules (Cart, Product, Category)
├── middleWare/       # Middlewares for processing and Validation
├── utils/            # Utilities (Redis Client, etc.)
└── index.js          # Server entry point
```

## ⚙️ Installation & Setup

1 - Clone the repository:

git clone [https://github.com/AhmdMohamed506k/Frontend-Take-Home-Bundle-Builder.git](https://github.com/AhmdMohamed506k/Frontend-Take-Home-Bundle-Builder.git)
   cd Frontend-Take-Home-Bundle-Builder



2 - Install dependencies:   

* npm install


3 - Configure environment variables (Create a .env file in the root directory):

* Port = 3000
* DataBaseURI = <your_mongodb_uri>
* CloudinaryCloudName = <your_Cloudinary_Cloud_Name>
* CloudinaryApiKey = <your_Cloudinary_Api_Key>
* CloudinaryApiSecret = <your_Cloudinary_Api_Secret>
* RedisURL= <your_redis_cloud_url>
* StripeSecretKey = <your_stripe_secret_key>


4 - Run the project:

* npm start


## 🤝 Contribution:

* Developed by Ahmed Mohamed - Full-stack Web Developer.

***