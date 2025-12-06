#cloudMeals😊

# 🍕 Serverless Food Ordering Platform

A complete serverless food ordering application built on AWS, demonstrating modern cloud-native architecture with full separation between customer and restaurant interfaces.

> **Project Type**: Learning Project - AWS Serverless Architecture  
> **Started**: December 5, 2024  
> **Status**: 🚧 In Active Development  
> **Current Phase**: Backend Development Complete, API Gateway Integration Next

---

## 📚 About This Project

This is my **second AWS cloud project**, following my first project [cloud-furniture](https://github.com/hemanthbobba24/cloud-furniture). I'm building this to gain hands-on experience with serverless architecture, starting from the fundamentals and progressively adding complexity.

**My Background**: Cloud beginner with limited experience in APIs, React, and backend development. This project serves as my structured learning journey into full-stack serverless applications.

---

## 🎯 Project Goals

- ✅ Learn AWS serverless services hands-on
- ✅ Understand NoSQL database design (DynamoDB)
- ✅ Build REST APIs with API Gateway and Lambda
- ✅ Implement user authentication with Cognito
- ✅ Deploy a production-ready serverless application
- ✅ Document the entire learning process

---

## 🏗️ Architecture

### Tech Stack

#### **Frontend**
- React.js
- HTML5, CSS3, JavaScript (ES6+)
- Axios for API calls
- Hosted on Amazon S3
- Distributed via CloudFront CDN

#### **Backend**
- AWS Lambda (Python 3.12)
- Amazon API Gateway (REST)
- Amazon DynamoDB (NoSQL)

#### **Security & Authentication**
- Amazon Cognito (User Pools)
- IAM Roles and Policies
- JWT Token-based authentication

#### **Additional Services**
- Amazon SNS (Email notifications)
- Amazon CloudWatch (Monitoring & Logging)
- AWS KMS (Encryption - optional)

### Architecture Diagram
```
┌─────────────┐
│   Users     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  CloudFront (CDN)                       │
│  ↓                                      │
│  S3 (React App - Static Hosting)       │
└──────┬──────────────────────────────────┘
       │
       │ JWT Token from Cognito
       ▼
┌─────────────────────────────────────────┐
│  Amazon Cognito                         │
│  • User Pool (CUSTOMER / RESTAURANT)    │
│  • Returns JWT tokens                   │
└─────────────────────────────────────────┘
       │
       │ API Requests with JWT
       ▼
┌─────────────────────────────────────────┐
│  API Gateway (REST)                     │
│  • Cognito Authorizer validates JWT    │
│  • Routes to Lambda functions           │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  AWS Lambda Functions (5 total)         │
│  • getRestaurants                       │
│  • getMenuItems                         │
│  • createOrder                          │
│  • getCustomerOrders                    │
│  • updateOrderStatus                    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  DynamoDB Tables (3 total)              │
│  • Restaurants                          │
│  • MenuItems                            │
│  • Orders                               │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Amazon SNS                             │
│  • Order status email notifications     │
└─────────────────────────────────────────┘

       │
       ▼
┌─────────────────────────────────────────┐
│  CloudWatch                             │
│  • Lambda logs & metrics                │
│  • Performance monitoring               │
└─────────────────────────────────────────┘
```

---

## ✨ Features

### Customer Features
- 🏪 Browse all restaurants
- 🍽️ View restaurant menus with prices and descriptions
- 🛒 Add multiple items to order
- 📝 Place orders with order tracking
- 📋 View complete order history
- 📧 Receive email notifications on order updates

### Restaurant Features  
- 📬 View incoming orders in real-time
- ✅ Update order status (pending → confirmed → preparing → out for delivery → delivered)
- 📊 Dashboard to manage all orders
- 👥 Role-based access control

---

## 📊 Database Design

### DynamoDB Tables

#### 1️⃣ **Restaurants Table**
```
Primary Key: restaurantId (String)

Attributes:
- restaurantId: Unique identifier (e.g., "rest-001")
- name: Restaurant name (e.g., "Pizza Palace")
- cuisine: Type of cuisine (e.g., "Italian")
- address: Full address
- phone: Contact number
- rating: Average rating (Number)
```

#### 2️⃣ **MenuItems Table**
```
Primary Key: menuItemId (String)

Attributes:
- menuItemId: Unique identifier (e.g., "menu-001")
- restaurantId: Foreign key to Restaurants
- name: Item name (e.g., "Margherita Pizza")
- description: Item description
- price: Price (Number/Decimal)
- category: Item category (e.g., "Main Course")
```

#### 3️⃣ **Orders Table**
```
Primary Key: orderId (String)

Attributes:
- orderId: Unique identifier (e.g., "order-abc123")
- customerId: Customer identifier
- restaurantId: Foreign key to Restaurants
- restaurantName: Denormalized for performance
- orderItems: List of ordered items (with quantity, price)
- totalAmount: Total order price (Number/Decimal)
- status: Order status (pending/confirmed/preparing/delivered)
- orderDate: ISO timestamp
- updatedAt: Last update timestamp (optional)
```

**Why denormalize restaurantName?**  
Storing the restaurant name in the order prevents needing to query the Restaurants table every time we display orders. This is a NoSQL best practice for read-heavy operations.

---

## 🔧 Lambda Functions

| Function Name | HTTP Method | Endpoint (Planned) | Purpose | Status |
|--------------|-------------|-------------------|---------|--------|
| `getRestaurants` | GET | `/restaurants` | Fetch all restaurants | ✅ Complete |
| `getMenuItems` | GET | `/menu?restaurantId={id}` | Get menu for specific restaurant | ✅ Complete |
| `createOrder` | POST | `/orders` | Place new order | ✅ Complete |
| `getCustomerOrders` | GET | `/orders?customerId={id}` | Get customer's order history | ✅ Complete |
| `updateOrderStatus` | PUT | `/orders/status` | Update order status (restaurant use) | ✅ Complete |

### Function Details

<details>
<summary><b>getRestaurants</b> - Click to expand</summary>

**Purpose**: Retrieve all restaurants  
**Input**: None  
**Output**: JSON array of all restaurants  

**Sample Response**:
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
<summary><b>getMenuItems</b> - Click to expand</summary>

**Purpose**: Get menu items for a specific restaurant  
**Input**: `restaurantId` (query parameter)  
**Output**: JSON array of menu items  

**Sample Response**:
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
<summary><b>createOrder</b> - Click to expand</summary>

**Purpose**: Create a new order  
**Input**: Order details (JSON body)  
**Output**: Order confirmation with orderId  

**Sample Request**:
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
</details>

---

## 🚀 Development Progress

### ✅ Completed Phases

- [x] **Phase 0: Environment Setup**
  - [x] Created AWS account and IAM user (`developer`)
  - [x] Configured AWS CLI with IAM credentials
  - [x] Installed development tools (Node.js, Python, VS Code, Git)
  - [x] Set up VS Code extensions (AWS Toolkit, Python, ESLint, Prettier)

- [x] **Phase 1: Database Layer**
  - [x] Created 3 DynamoDB tables
  - [x] Designed table schemas with proper primary keys
  - [x] Added comprehensive sample data (3 restaurants, 6 menu items, 4 orders)
  - [x] Tested data retrieval from DynamoDB

- [x] **Phase 2: Backend Logic (Lambda Functions)**
  - [x] Built `getRestaurants` function
  - [x] Built `getMenuItems` function with filtering
  - [x] Built `createOrder` function with UUID generation
  - [x] Built `getCustomerOrders` function with sorting
  - [x] Built `updateOrderStatus` function with validation
  - [x] Implemented Decimal ↔ float conversion for DynamoDB
  - [x] Added error handling and CORS headers
  - [x] Configured IAM roles for DynamoDB access
  - [x] Tested all functions successfully

### 🔄 Current Phase

- [ ] **Phase 3: API Gateway Integration** (IN PROGRESS)
  - [ ] Create REST API in API Gateway
  - [ ] Configure API endpoints and methods
  - [ ] Connect Lambda functions to API routes
  - [ ] Set up Cognito authorizers
  - [ ] Test API with Postman
  - [ ] Enable CORS for frontend access

### ⏳ Upcoming Phases

- [ ] **Phase 4: Authentication (Cognito)**
  - [ ] Create Cognito User Pool
  - [ ] Configure user groups (CUSTOMER, RESTAURANT)
  - [ ] Implement JWT token validation
  - [ ] Add role-based access control

- [ ] **Phase 5: Frontend Development (React)**
  - [ ] Set up React project structure
  - [ ] Build customer interface (restaurant list, menu, ordering)
  - [ ] Build restaurant dashboard (order management)
  - [ ] Integrate with API Gateway
  - [ ] Implement Cognito authentication flow

- [ ] **Phase 6: Deployment & Monitoring**
  - [ ] Deploy React app to S3
  - [ ] Configure CloudFront distribution
  - [ ] Set up SNS email notifications
  - [ ] Configure CloudWatch dashboards
  - [ ] Add custom domain (optional)

---

## 📚 Key Learnings

### AWS Fundamentals
- **IAM Best Practices**: Never use root user for daily tasks; create IAM users with least-privilege permissions
- **AWS Regions**: All resources created in `us-east-2` (Ohio) for consistency
- **Security**: Separating read-only vs write IAM roles for Lambda functions

### DynamoDB (NoSQL)
- **Denormalization**: Storing `restaurantName` in Orders table for faster queries
- **Primary Keys**: Understanding partition keys and when to use sort keys
- **Data Types**: DynamoDB requires `Decimal` type for numbers, not `float`
- **Scan vs Query**: Using `scan()` with filters for small datasets

### Lambda Functions
- **Event Handling**: Parsing input from API Gateway (`queryStringParameters`, `body`)
- **Error Handling**: Using try/except blocks and returning proper HTTP status codes
- **Data Conversion**: Converting `Decimal` to `float` for JSON serialization
- **Boto3 SDK**: Using DynamoDB resource API (`table.scan()`, `put_item()`, `update_item()`)

### API Design
- **CORS**: Understanding Cross-Origin Resource Sharing for frontend-backend communication
- **REST Principles**: Proper HTTP methods (GET, POST, PUT) and status codes (200, 201, 400, 500)
- **Authentication vs Authorization**: CORS controls WHERE requests come from; authentication controls WHO can access

### Security Concepts
- **CORS Headers**: `Access-Control-Allow-Origin: '*'` allows any domain (development only)
- **Production Security**: Plan to restrict CORS and add Cognito authentication
- **IAM Roles**: Lambda functions use IAM roles, not access keys

---

## 💡 Challenges & Solutions

### Challenge 1: Decimal Type Error
**Problem**: Lambda function crashed with `"Float types are not supported"`  
**Cause**: DynamoDB requires `Decimal` type for numbers, not Python `float`  
**Solution**: Created `convert_to_decimal()` helper function to recursively convert floats in nested structures  
**Learning**: Always convert numbers to `Decimal` before writing to DynamoDB

### Challenge 2: Understanding CORS
**Problem**: Confusion about when and why CORS is needed  
**Cause**: Browser security policy blocks cross-origin requests by default  
**Solution**: Added `'Access-Control-Allow-Origin': '*'` headers to all Lambda responses  
**Learning**: CORS is browser-enforced; API must explicitly allow cross-origin requests

### Challenge 3: IAM Role Confusion
**Problem**: Unclear when to create new roles vs reuse existing ones  
**Cause**: Each Lambda function prompted for role selection  
**Solution**: Categorized functions as read-only (reuse read role) vs write (reuse write role)  
**Learning**: Group functions by permission needs; reuse roles for efficiency

### Challenge 4: Region Mismatch
**Problem**: AWS CLI couldn't find DynamoDB tables  
**Cause**: Tables created in `us-east-2`, but CLI configured for `us-east-1`  
**Solution**: Changed AWS CLI region to `us-east-2` with `aws configure set region us-east-2`  
**Learning**: Always verify region consistency across all AWS services

---

## 🔐 Security Approach

### Current (Development)
```python
'Access-Control-Allow-Origin': '*'  # Allows any domain
# No authentication
# Test data only
```
**Why**: Simplifies development and testing; acceptable for learning with fake data

### Planned (Production)
```python
'Access-Control-Allow-Origin': 'https://your-food-app.com'  # Specific domain only
# Cognito JWT token required
# Role-based access (CUSTOMER vs RESTAURANT)
# HTTPS enforced
# Rate limiting enabled
```

### Security Layers
1. **CORS**: Controls which domains can call the API
2. **Authentication**: Cognito validates user identity (JWT tokens)
3. **Authorization**: IAM and Cognito groups control what users can do
4. **Encryption**: HTTPS for data in transit; KMS for data at rest (optional)

---

## 🛠️ Local Development Setup

### Prerequisites
- AWS Account (Free Tier)
- AWS CLI configured with IAM user credentials
- Python 3.12+
- Node.js 18+ (for React frontend)
- Git
- VS Code (recommended)

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/food-ordering-serverless.git
cd food-ordering-serverless
```

2. **Configure AWS CLI**
```bash
aws configure
# Enter your IAM user credentials
# Region: us-east-2
# Output format: json
```

3. **Create DynamoDB tables** (see `database/table-schemas.md`)

4. **Deploy Lambda functions** (instructions coming soon)

5. **Test functions**
```bash
# Each function can be tested via AWS Lambda console
```

---

## 📖 Documentation

- [Database Schemas](database/table-schemas.md) - Detailed DynamoDB table structures
- [Lambda Functions](lambda-functions/README.md) - Function code and documentation
- [API Documentation](api/api-documentation.md) - API endpoints and usage (coming soon)
- [Setup Guide](docs/setup-guide.md) - Complete setup instructions
- [Learning Journal](docs/learning-journal.md) - Daily progress and learnings

---

## 🗓️ Development Timeline

| Date | Milestone | Status |
|------|-----------|--------|
| Dec 5, 2024 | AWS account setup, IAM user, dev environment | ✅ Complete |
| Dec 6, 2024 | DynamoDB tables, sample data, 5 Lambda functions | ✅ Complete |
| Dec 7, 2024 | API Gateway integration | 🔄 In Progress |
| Dec 8-10, 2024 | Cognito authentication | ⏳ Planned |
| Dec 11-14, 2024 | React frontend | ⏳ Planned |
| Dec 15-17, 2024 | Deployment & monitoring | ⏳ Planned |

---

## 🎯 Next Steps

1. ✅ ~~Complete Lambda function development~~
2. 🔄 **Set up API Gateway** (Current focus)
3. ⏳ Configure Cognito for authentication
4. ⏳ Build React frontend
5. ⏳ Deploy to S3 + CloudFront
6. ⏳ Add SNS notifications
7. ⏳ Set up CloudWatch monitoring

---

## 🤝 About Me

I'm a cloud beginner documenting my journey from foundational concepts to building production-ready serverless applications. This project represents my hands-on learning approach to mastering AWS.

**Skills I'm Learning:**
- AWS Serverless Architecture
- NoSQL Database Design
- REST API Development
- Authentication & Authorization
- React Frontend Development
- DevOps & Deployment

---

## 📞 Connect

- **GitHub**: [@hemanthbobba24](https://github.com/hemanthbobba24)
- **LinkedIn**: [Hemanth Sri Ram Bobba](https://www.linkedin.com/in/hemanth-bobba-5ba445237/)
- **Email**: hemanthbobba246@gmail.com

---

## 📝 License

This project is for educational purposes.

---

## 🙏 Acknowledgments

- AWS Documentation and Free Tier

---

**⭐ If you found this helpful, please star the repository!**

---

*Last Updated: December 6, 2024*  
*Project Duration: 2 days*  
*Lambda Functions: 5/5 Complete*
