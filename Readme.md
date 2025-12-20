# 🍕 CloudMeals - Serverless Food Ordering Platform

A full-stack serverless food ordering application built on AWS, featuring modern cloud-native architecture with complete separation between customer and restaurant interfaces.

[![AWS](https://img.shields.io/badge/AWS-Serverless-orange?style=flat&logo=amazon-aws)](https://aws.amazon.com/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.12-green?style=flat&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Project Status:** 🚧 In Active Development (70% Complete)  
> **Started:** December 5, 2024  
> **Current Phase:** Frontend Complete, Authentication Next

---

## 📚 About This Project

CloudMeals is my second AWS cloud project, building on skills from my first project. I'm creating this to gain hands-on experience with serverless architecture, starting from the fundamentals and progressively adding complexity.

**My Background:** Cloud beginner with limited experience in APIs, React, and backend development. This project serves as my structured learning journey into full-stack serverless applications.

---

## ✨ Features

### 🛍️ Customer Features
- Browse restaurants by cuisine type
- View detailed restaurant menus with prices
- Add multiple items to shopping cart
- Review and modify cart before checkout
- Place orders with real-time order ID generation
- Track order history with status updates
- Auto-refresh order status every 10 seconds

### 🏪 Restaurant Features (Coming Soon)
- Receive new orders in real-time
- Update order status (pending → confirmed → preparing → delivered)
- View order details and customer information
- Dashboard to manage all orders

---

## 🏗️ Architecture

### Tech Stack

#### **Frontend**
- **React.js** - UI framework with hooks and context
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Modern responsive styling with gradients
- **Hosted on:** Amazon S3 + CloudFront (planned)

#### **Backend**
- **AWS Lambda (Python 3.12)** - 5 serverless functions
- **Amazon API Gateway** - REST API endpoints
- **Amazon DynamoDB** - NoSQL database (3 tables)

#### **Security & Authentication**
- **Amazon Cognito** - User authentication (planned)
- **IAM Roles** - Fine-grained permissions
- **JWT Tokens** - Token-based auth (planned)

#### **Additional Services**
- **Amazon SNS** - Email notifications (planned)
- **Amazon CloudWatch** - Monitoring & logging
- **AWS KMS** - Encryption (optional)

---

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Users (Customers)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  CloudFront (CDN)                                                │
│  └── S3 (React App - Static Hosting)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS + JWT Token
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Amazon Cognito User Pool                                        │
│  • User Groups: CUSTOMER / RESTAURANT                           │
│  • Returns JWT tokens for authentication                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Authenticated API Requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  API Gateway (REST)                                              │
│  • Base URL: [API_ID].execute-api.us-east-2.amazonaws.com/dev  │
│  • Cognito Authorizer validates JWT                             │
│  • Routes requests to Lambda functions                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  AWS Lambda Functions (Python 3.12)                             │
│  ┌──────────────────┬──────────────────┬─────────────────────┐ │
│  │ getRestaurants   │ getMenuItems     │ createOrder         │ │
│  │ getCustomerOrders│ updateOrderStatus│                     │ │
│  └──────────────────┴──────────────────┴─────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Amazon DynamoDB (NoSQL)                                         │
│  ┌─────────────┬──────────────┬────────────────────────────┐   │
│  │ Restaurants │  MenuItems   │        Orders              │   │
│  │ (3 items)   │  (6 items)   │     (dynamic)              │   │
│  └─────────────┴──────────────┴────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Amazon SNS (Notifications)                                      │
│  • Email notifications on order status changes                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Amazon CloudWatch                                               │
│  • Lambda function logs & metrics                               │
│  • API Gateway performance monitoring                           │
│  • Custom dashboards                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Design

### DynamoDB Tables

#### 1️⃣ **Restaurants**
```
Primary Key: restaurantId (String)

Attributes:
- restaurantId: Unique identifier (e.g., "rest-001")
- name: Restaurant name (e.g., "Pizza Palace")
- cuisine: Cuisine type (e.g., "Italian", "Japanese", "American")
- address: Full street address
- phone: Contact number
- rating: Average rating (Number: 0.0 - 5.0)
```

**Sample Data:**
| restaurantId | name | cuisine | rating |
|-------------|------|---------|--------|
| rest-001 | Pizza Palace | Italian | 4.5 |
| rest-002 | Sushi Express | Japanese | 4.7 |
| rest-003 | Burger Barn | American | 4.0 |

---

#### 2️⃣ **MenuItems**
```
Primary Key: menuItemId (String)

Attributes:
- menuItemId: Unique identifier (e.g., "menu-001")
- restaurantId: Foreign key to Restaurants table
- name: Item name (e.g., "Margherita Pizza")
- description: Detailed item description
- price: Price in USD (Number/Decimal)
- category: Food category (e.g., "Main Course", "Appetizer")
```

**Sample Data:**
| menuItemId | restaurantId | name | price |
|-----------|--------------|------|-------|
| menu-001 | rest-001 | Margherita Pizza | $14.99 |
| menu-002 | rest-001 | Pepperoni Pizza | $15.99 |
| menu-003 | rest-002 | California Roll | $8.99 |

---

#### 3️⃣ **Orders**
```
Primary Key: orderId (String)

Attributes:
- orderId: Unique identifier (e.g., "order-abc123")
- customerId: Customer identifier
- restaurantId: Foreign key to Restaurants
- restaurantName: Denormalized for performance
- orderItems: List of items with quantity and price
- totalAmount: Total order price (Number/Decimal)
- status: Order status (String)
  • Values: pending, confirmed, preparing, out for delivery, delivered
- orderDate: ISO timestamp
- updatedAt: Last update timestamp
```

**Why Denormalize restaurantName?**  
Storing the restaurant name directly in orders prevents the need to query the Restaurants table every time orders are displayed. This is a NoSQL best practice for read-heavy operations and ensures historical accuracy if a restaurant changes its name.

---

## 🔧 Lambda Functions

### API Endpoints

| Function | Method | Endpoint | Purpose | Status |
|----------|--------|----------|---------|--------|
| **getRestaurants** | GET | `/restaurants` | Fetch all restaurants | ✅ Complete |
| **getMenuItems** | GET | `/menu?restaurantId={id}` | Get restaurant's menu | ✅ Complete |
| **createOrder** | POST | `/orders` | Place new order | ✅ Complete |
| **getCustomerOrders** | GET | `/orders?customerId={id}` | Get order history | ✅ Complete |
| **updateOrderStatus** | PUT | `/orders/status` | Update order status | ✅ Complete |

---

### Function Details

<details>
<summary><b>getRestaurants</b> - Retrieve all restaurants</summary>

**Runtime:** Python 3.12  
**Trigger:** API Gateway GET /restaurants  
**Permissions:** DynamoDB Read  

**Response Example:**
```json
{
  "restaurants": [
    {
      "restaurantId": "rest-001",
      "name": "Pizza Palace",
      "cuisine": "Italian",
      "address": "123 Main St, New York, NY",
      "phone": "555-0101",
      "rating": 4.5
    }
  ]
}
```
</details>

<details>
<summary><b>getMenuItems</b> - Get menu for a restaurant</summary>

**Runtime:** Python 3.12  
**Trigger:** API Gateway GET /menu  
**Input:** Query parameter `restaurantId`  
**Permissions:** DynamoDB Read  

**Response Example:**
```json
{
  "restaurantId": "rest-001",
  "menuItems": [
    {
      "menuItemId": "menu-001",
      "name": "Margherita Pizza",
      "description": "Classic tomato and mozzarella",
      "price": 14.99,
      "category": "Main Course"
    }
  ]
}
```
</details>

<details>
<summary><b>createOrder</b> - Place a new order</summary>

**Runtime:** Python 3.12  
**Trigger:** API Gateway POST /orders  
**Permissions:** DynamoDB Read + Write  

**Request Example:**
```json
{
  "customerId": "customer-001",
  "restaurantId": "rest-001",
  "restaurantName": "Pizza Palace",
  "orderItems": [
    {
      "menuItemId": "menu-001",
      "name": "Margherita Pizza",
      "quantity": 2,
      "price": 14.99
    }
  ],
  "totalAmount": 29.98
}
```

**Response Example:**
```json
{
  "orderId": "order-abc123",
  "status": "pending",
  "message": "Order placed successfully"
}
```

**Technical Notes:**
- Generates UUID-based order IDs
- Converts float to Decimal for DynamoDB compatibility
- Sets initial status to "pending"
- Records ISO timestamp
</details>

<details>
<summary><b>getCustomerOrders</b> - Retrieve order history</summary>

**Runtime:** Python 3.12  
**Trigger:** API Gateway GET /orders  
**Input:** Query parameter `customerId`  
**Permissions:** DynamoDB Read  

**Response Example:**
```json
{
  "customerId": "customer-001",
  "orderCount": 2,
  "orders": [
    {
      "orderId": "order-abc123",
      "restaurantName": "Pizza Palace",
      "totalAmount": 29.98,
      "status": "pending",
      "orderDate": "2024-12-19T10:30:00Z",
      "orderItems": [...]
    }
  ]
}
```

**Technical Notes:**
- Sorts orders by date (newest first)
- Includes full order details
- Auto-refreshes in frontend every 10 seconds
</details>

<details>
<summary><b>updateOrderStatus</b> - Update order status</summary>

**Runtime:** Python 3.12  
**Trigger:** API Gateway PUT /orders/status  
**Permissions:** DynamoDB Read + Write  

**Request Example:**
```json
{
  "orderId": "order-abc123",
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending` - Order received
- `confirmed` - Restaurant accepted
- `preparing` - Being prepared
- `out for delivery` - On the way
- `delivered` - Completed
- `cancelled` - Cancelled

**Response Example:**
```json
{
  "message": "Order status updated successfully",
  "orderId": "order-abc123",
  "newStatus": "confirmed",
  "updatedAt": "2024-12-19T10:35:00Z"
}
```
</details>

---

## 🚀 Development Progress

### ✅ Completed Phases

#### **Phase 0: Environment Setup**
- [x] Created AWS account and IAM user
- [x] Configured AWS CLI (region: us-east-2)
- [x] Installed development tools (Node.js v24, Python 3.14, VS Code, Git)
- [x] Set up VS Code extensions (AWS Toolkit, Python, ESLint, Prettier)

#### **Phase 1: Database Layer**
- [x] Designed NoSQL schema with proper denormalization
- [x] Created 3 DynamoDB tables
- [x] Added comprehensive sample data
  - 3 restaurants (Pizza Palace, Sushi Express, Burger Barn)
  - 6 menu items (2 per restaurant)
  - 4+ sample orders
- [x] Tested data retrieval and updates

#### **Phase 2: Backend Logic (Lambda Functions)**
- [x] Built `getRestaurants` function
- [x] Built `getMenuItems` with filtering
- [x] Built `createOrder` with UUID generation
- [x] Built `getCustomerOrders` with sorting
- [x] Built `updateOrderStatus` with validation
- [x] Implemented Decimal ↔ float conversion
- [x] Added comprehensive error handling
- [x] Configured CORS headers for cross-origin requests
- [x] Set up IAM roles (read-only vs write permissions)
- [x] Tested all functions successfully

#### **Phase 3: API Gateway Integration**
- [x] Created REST API (`FoodOrderingAPI`)
- [x] Configured 5 API endpoints with methods
- [x] Connected Lambda functions via proxy integration
- [x] Set up CORS for frontend access
- [x] Deployed to `dev` stage
- [x] Tested all endpoints with Postman/browser

#### **Phase 4: Frontend Development (React)**
- [x] Set up React project structure
- [x] Built Restaurant List page with live data
- [x] Built Menu Page with dynamic routing
- [x] Implemented Shopping Cart with Context API
- [x] Created Cart/Checkout page
- [x] Built Order History (My Orders) page
- [x] Added auto-refresh for order status (10s interval)
- [x] Integrated all pages with API Gateway
- [x] Implemented responsive design with gradients

---

### 🔄 Current Phase

#### **Phase 5: Authentication (Cognito)** - IN PROGRESS
- [ ] Create Cognito User Pool
- [ ] Configure user groups (CUSTOMER, RESTAURANT)
- [ ] Implement signup/login pages
- [ ] Add JWT token validation to Lambda
- [ ] Protect API endpoints with Cognito authorizer
- [ ] Implement role-based access control
- [ ] Add logout functionality

---

### ⏳ Upcoming Phases

#### **Phase 6: Deployment & Hosting**
- [ ] Deploy React app to S3
- [ ] Configure CloudFront distribution
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure environment variables

#### **Phase 7: Additional Features**
- [ ] Set up SNS email notifications
- [ ] Create CloudWatch dashboards
- [ ] Add restaurant dashboard UI
- [ ] Implement search/filter for restaurants
- [ ] Add order timeline visualization

#### **Phase 8: Production Optimization**
- [ ] Restrict CORS to specific domain
- [ ] Enable API rate limiting
- [ ] Add request/response caching
- [ ] Implement error monitoring
- [ ] Set up automated backups

---

## 📚 Key Learnings

### AWS Fundamentals
- **IAM Best Practices:** Never use root user; create users with least-privilege permissions
- **AWS Regions:** Maintained consistency with us-east-2 (Ohio) across all resources
- **Security:** Separated read-only vs write IAM roles for Lambda functions
- **Resource Naming:** Used clear, consistent naming conventions

### DynamoDB (NoSQL)
- **Denormalization:** Storing `restaurantName` in Orders table for faster queries
- **Primary Keys:** Understanding partition keys and when to use sort keys
- **Data Types:** DynamoDB requires `Decimal` type for numbers, not `float`
- **Query vs Scan:** Using `scan()` with filters for small datasets, planning indexes for scale
- **Cost Optimization:** Designing schemas to minimize read/write operations

### Lambda Functions
- **Event Handling:** Parsing different input sources (query parameters, body, path parameters)
- **Error Handling:** Using try/except blocks with proper HTTP status codes
- **Data Conversion:** Converting `Decimal` to `float` for JSON serialization
- **Boto3 SDK:** Using DynamoDB resource API (`scan()`, `put_item()`, `update_item()`)
- **Cold Starts:** Understanding Lambda initialization and optimization
- **Proxy Integration:** Benefits of Lambda proxy integration for flexible response handling

### API Design
- **CORS:** Understanding Cross-Origin Resource Sharing for frontend-backend communication
- **REST Principles:** Proper use of HTTP methods (GET, POST, PUT) and status codes
- **Authentication vs Authorization:** CORS controls WHERE requests come from; authentication controls WHO can access
- **API Versioning:** Using deployment stages (dev, prod) for version management

### React Development
- **Context API:** Global state management for shopping cart
- **React Router:** Client-side routing for SPA navigation
- **Hooks:** useState, useEffect, useContext, useNavigate
- **Async Operations:** Proper handling of API calls with loading states
- **Component Design:** Separating concerns and reusable components

### Security Concepts
- **CORS Headers:** `Access-Control-Allow-Origin: '*'` for development only
- **Production Security:** Plan to restrict CORS and add Cognito authentication
- **Environment Variables:** Storing sensitive data securely
- **JWT Tokens:** Understanding token-based authentication flow

---

## 💡 Challenges & Solutions

### Challenge 1: Decimal Type Error in DynamoDB
**Problem:** Lambda crashed with error: `"Float types are not supported"`  
**Cause:** DynamoDB requires `Decimal` type for numbers, not Python `float`  
**Solution:** Created `convert_to_decimal()` helper function to recursively convert floats in nested data structures  
**Learning:** Always convert numbers to `Decimal` before writing to DynamoDB; convert back to `float` for JSON responses

### Challenge 2: Understanding CORS
**Problem:** Frontend blocked by CORS error when calling API  
**Cause:** Browser security policy blocks cross-origin requests by default  
**Solution:** Added `'Access-Control-Allow-Origin': '*'` headers to all Lambda responses  
**Learning:** CORS is browser-enforced; API must explicitly allow cross-origin requests. Use `'*'` for development, restrict to specific domain in production

### Challenge 3: IAM Role Management
**Problem:** Confusion about when to create new roles vs reuse existing ones  
**Cause:** Each Lambda function prompted for role selection during creation  
**Solution:** Categorized functions by permission needs (read-only vs write); reused roles accordingly  
**Learning:** Group functions with similar permissions to minimize role proliferation and simplify management

### Challenge 4: AWS Region Mismatch
**Problem:** AWS CLI couldn't find DynamoDB tables  
**Cause:** Tables created in `us-east-2`, but CLI configured for `us-east-1`  
**Solution:** Updated CLI region: `aws configure set region us-east-2`  
**Learning:** Always verify region consistency across all AWS services; region mismatches are common source of "resource not found" errors

### Challenge 5: React Context State Management
**Problem:** Shopping cart state not persisting across page navigation  
**Cause:** Misunderstanding of Context Provider placement  
**Solution:** Wrapped entire Router with CartProvider to ensure global state  
**Learning:** Context Providers must wrap all components that need access to the context

### Challenge 6: API Integration URL Management
**Problem:** Hardcoding API URLs in multiple components  
**Cause:** No centralized configuration  
**Solution:** Created `API_BASE_URL` constant in each component (will improve with environment variables)  
**Learning:** Plan for environment variables early; hardcoded values are technical debt

---

## 🔐 Security Approach

### Current State (Development)
```python
'Access-Control-Allow-Origin': '*'  # Allows any domain
# No authentication
# Test data only (customer-999, sample orders)
```

**Why Acceptable:**
- Simplifies development and testing
- Using fake customer IDs
- No real user data
- Local development only

---

### Planned (Production)
```python
'Access-Control-Allow-Origin': 'https://cloudmeals.example.com'  # Specific domain only
# Cognito JWT token required for all requests
# Role-based access control (CUSTOMER vs RESTAURANT)
# HTTPS enforced
# API rate limiting enabled
# CloudWatch alarms for suspicious activity
```

---

### Security Layers

| Layer | Development | Production | Purpose |
|-------|-------------|------------|---------|
| **CORS** | `'*'` (any domain) | Specific domain only | Control which sites can call API |
| **Authentication** | None | Cognito JWT tokens | Verify user identity |
| **Authorization** | None | IAM + Cognito groups | Control what users can do |
| **Encryption** | N/A | HTTPS + KMS | Protect data in transit/at rest |
| **Rate Limiting** | None | API Gateway throttling | Prevent abuse |
| **Monitoring** | Basic CloudWatch | Full dashboards + alarms | Detect anomalies |

---

## 🛠️ Local Development Setup

### Prerequisites
- **AWS Account** (Free Tier eligible)
- **AWS CLI** configured with IAM credentials
- **Python** 3.12+
- **Node.js** 18+
- **Git**
- **VS Code** (recommended)

---

### Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/hemanthbobba24/CloudMeals.git
cd CloudMeals
```

#### 2. Install Frontend Dependencies
```bash
npm install
```

#### 3. Configure AWS CLI
```bash
aws configure
# AWS Access Key ID: [Your IAM user access key]
# AWS Secret Access Key: [Your IAM user secret key]
# Default region name: us-east-2
# Default output format: json
```

#### 4. Create DynamoDB Tables
See `docs/database-setup.md` for detailed table schemas and creation steps.

#### 5. Deploy Lambda Functions
See `docs/lambda-deployment.md` for function code and deployment instructions.

#### 6. Configure API Gateway
Update `src/components/*/` files with your API Gateway URL:
```javascript
const API_BASE_URL = 'YOUR_API_GATEWAY_URL';
```

#### 7. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

---

## 🎯 API Reference

### Base URL
```
https://[API_ID].execute-api.us-east-2.amazonaws.com/dev
```

### Endpoints

#### Get All Restaurants
```http
GET /restaurants
```

**Response:**
```json
{
  "restaurants": [
    {
      "restaurantId": "rest-001",
      "name": "Pizza Palace",
      "cuisine": "Italian",
      "rating": 4.5
    }
  ]
}
```

---

#### Get Menu Items
```http
GET /menu?restaurantId=rest-001
```

**Response:**
```json
{
  "restaurantId": "rest-001",
  "menuItems": [
    {
      "menuItemId": "menu-001",
      "name": "Margherita Pizza",
      "price": 14.99
    }
  ]
}
```

---

#### Create Order
```http
POST /orders
Content-Type: application/json

{
  "customerId": "customer-001",
  "restaurantId": "rest-001",
  "restaurantName": "Pizza Palace",
  "orderItems": [
    {
      "menuItemId": "menu-001",
      "name": "Margherita Pizza",
      "quantity": 2,
      "price": 14.99
    }
  ],
  "totalAmount": 29.98
}
```

**Response:**
```json
{
  "orderId": "order-abc123",
  "status": "pending",
  "message": "Order placed successfully"
}
```

---

#### Get Customer Orders
```http
GET /orders?customerId=customer-001
```

**Response:**
```json
{
  "customerId": "customer-001",
  "orderCount": 2,
  "orders": [...]
}
```

---

#### Update Order Status
```http
PUT /orders/status
Content-Type: application/json

{
  "orderId": "order-abc123",
  "status": "confirmed"
}
```

**Response:**
```json
{
  "message": "Order status updated successfully",
  "orderId": "order-abc123",
  "newStatus": "confirmed"
}
```

---

## 📖 Project Documentation

- **[Database Schemas](docs/database-schemas.md)** - Detailed DynamoDB table structures (Coming soon)
- **[Lambda Functions](docs/lambda-functions.md)** - Function code and documentation (Coming soon)
- **[API Documentation](docs/api-documentation.md)** - Complete API reference (Coming soon)
- **[Setup Guide](docs/setup-guide.md)** - Step-by-step setup instructions (Coming soon)
- **[Learning Journal](docs/learning-journal.md)** - Daily progress and learnings (Coming soon)

---

## 🗓️ Development Timeline

| Date | Milestone | Hours | Status |
|------|-----------|-------|--------|
| Dec 5, 2024 | AWS setup, IAM, dev environment | 2h | ✅ Complete |
| Dec 6, 2024 | DynamoDB tables, Lambda functions (1-3) | 3h | ✅ Complete |
| Dec 7, 2024 | Lambda functions (4-5), API Gateway | 2h | ✅ Complete |
| Dec 8, 2024 | React setup, Restaurant & Menu pages | 3h | ✅ Complete |
| Dec 19, 2024 | Cart, Checkout, Order History pages | 4h | ✅ Complete |
| Dec 20-22, 2024 | Cognito authentication | 3h | 🔄 In Progress |
| Dec 23-25, 2024 | Deployment to AWS | 2h | ⏳ Planned |
| Dec 26-28, 2024 | SNS notifications, monitoring | 2h | ⏳ Planned |

**Total Time Invested:** ~16 hours  
**Estimated Remaining:** ~7 hours  
**Projected Completion:** December 28, 2024

---

## 📊 Project Metrics

### Code Statistics
- **Lines of Code:** ~1,500+
  - Lambda Functions: ~400 lines (Python)
  - React Components: ~900 lines (JavaScript)
  - CSS Styling: ~200 lines
- **Files Created:** 25+
- **Components:** 5 React components
- **API Endpoints:** 5 REST endpoints

### AWS Resources
- **Services Used:** 5 (DynamoDB, Lambda, API Gateway, IAM, CloudWatch)
- **Services Planned:** 4 more (Cognito, S3, CloudFront, SNS)
- **Total Services:** 9
- **DynamoDB Tables:** 3
- **Lambda Functions:** 5
- **API Endpoints:** 5
- **IAM Roles:** 2

### Performance (Current)
- **Cold Start:** ~500ms (Lambda)
- **API Response Time:** ~200-300ms
- **Frontend Load Time:** ~1-2s (local)
- **Auto-refresh Interval:** 10s (orders page)

---

## 🎯 Next Steps

### Immediate (This Week)
1. ✅ ~~Complete frontend pages~~ DONE
2. 🔄 Implement Cognito authentication
3. ⏳ Add protected routes in React
4. ⏳ Update Lambda functions with JWT validation

### Short Term (Next 2 Weeks)
1. Deploy React app to S3
2. Configure CloudFront distribution
3. Set up SNS email notifications
4. Create CloudWatch dashboards
5. Build restaurant dashboard UI

### Long Term (Future Enhancements)
1. Add payment processing (Stripe)
2. Implement real-time order tracking
3. Add review/rating system
4. Multi-language support
5. Mobile app (React Native)
6. Advanced analytics dashboard

---

## 🤝 About Me

I'm a cloud enthusiast documenting my journey from foundational concepts to building production-ready serverless applications. This project represents my hands-on learning approach to mastering AWS.

**Skills I'm Learning:**
- ✅ AWS Serverless Architecture
- ✅ NoSQL Database Design
- ✅ REST API Development
- ✅ React Frontend Development
- 🔄 Authentication & Authorization (in progress)
- ⏳ DevOps & Deployment (coming soon)

**Connect with Me:**
- **GitHub:** [@hemanthbobba24](https://github.com/hemanthbobba24)
- **LinkedIn:** [Hemanth Sri Ram](https://www.linkedin.com/in/hemanth-bobba-5ba445237/)
- **Email:** hemanthbobba246@gmail.com

---

## 📝 License

This project is for educational purposes. Feel free to use it as a learning resource!

---

## 🙏 Acknowledgments

- AWS Documentation and Free Tier for making cloud learning accessible
- React community for excellent documentation and resources
- Stack Overflow community for troubleshooting help
- Claude AI for guidance throughout development

---

## ⭐ If You Find This Helpful

If this project helped you learn serverless architecture or AWS, please:
1. ⭐ Star this repository
2. 🍴 Fork it for your own learning
3. 📢 Share it with others learning cloud development
4. 💬 Leave feedback or suggestions in Issues

---

**Built with ❤️ and ☕ by Hemanth Sri Ram**

*Last Updated: December 19, 2024*  
*Project Progress: 70% Complete*  
*Next Milestone: Cognito Authentication*

---

## 📸 Screenshots

### Home Page - Restaurant List
<img width="1365" height="722" alt="image" src="https://github.com/user-attachments/assets/8f46513d-c08c-4f72-9055-dcb434ee9e9e" />


### Menu Page
<img width="1365" height="721" alt="image" src="https://github.com/user-attachments/assets/0e7ab906-b168-4c4a-bd44-16b92b3ef3d6" />


### Shopping Cart
<img width="1365" height="721" alt="image" src="https://github.com/user-attachments/assets/9326b77a-2db8-4f62-8a83-f79d91347ebd" />


### My Orders
<img width="1365" height="719" alt="image" src="https://github.com/user-attachments/assets/dadea301-6161-476f-b979-aaf509f1be91" />


---

## 🚀 Quick Start Commands

```bash
# Clone repository
git clone https://github.com/hemanthbobba24/CloudMeals.git
cd CloudMeals

# Install dependencies
npm install

# Start development server
npm start

# Build for production (when ready to deploy)
npm run build
```

---

*"From cloud beginner to serverless architect - one Lambda function at a time."* 🚀
