# API Diagnostic and Fix Plan

## 🔍 Current Status Analysis

### ✅ **What's Working**
1. **Docker Containers Running Successfully**:
   - ✅ MongoDB (mongo:7) - Port 27017
   - ✅ Mongo Express - Port 8081
   - ✅ Backend (Spring Boot) - Port 8080
   - ✅ Backoffice (Angular/Nginx) - Port 4200

2. **Backend Service**:
   - ✅ Spring Boot started successfully
   - ✅ MongoDB connection established
   - ✅ 15 repositories loaded
   - ✅ Tomcat server running on port 8080
   - ✅ WebSocket support active
   - ✅ CORS properly configured

3. **Backoffice Service**:
   - ✅ Nginx serving static files
   - ✅ Application accessible on port 4200
   - ✅ Assets loading correctly

### ⚠️ **Identified Issues**

#### Issue 1: AI Matching Service Disabled
```
AiMatchingClient disabled (no ANTHROPIC_API_KEY); using heuristic fallback.
```
**Impact**: AI matching features will use basic heuristic algorithms instead of advanced AI
**Severity**: Medium (Feature degradation, not critical)

#### Issue 2: Firebase Service Account
```
FIREBASE_SERVICE_ACCOUNT_JSON: ${FIREBASE_SERVICE_ACCOUNT_JSON:-}
FIREBASE_SERVICE_ACCOUNT_PATH: ${FIREBASE_SERVICE_ACCOUNT_PATH:-}
```
**Status**: Check if firebase-service-account.json exists and is properly mounted
**Impact**: Authentication may fail if file is missing
**Severity**: High (Critical for auth)

#### Issue 3: Commons Logging Conflict Warning
```
Standard Commons Logging discovery in action with spring-jcl: 
please remove commons-logging.jar from classpath
```
**Impact**: Potential logging conflicts
**Severity**: Low (Warning only)

---

## 🔧 Fix Plan

### **Priority 1: Critical - Authentication Setup**

#### Step 1: Verify Firebase Service Account
```bash
# Check if the file exists
dir "d:\Smart-Internship---Freelance-Matching-Platform\smart-match-backend\firebase-service-account.json"

# Verify it's mounted in container
docker exec smart-match-platform-backend ls -la /run/secrets/firebase-service-account.json

# Check backend logs for Firebase initialization
docker logs smart-match-platform-backend | grep -i firebase
```

**If file is missing:**
1. Download service account JSON from Firebase Console
2. Place it in: `smart-match-backend/firebase-service-account.json`
3. Restart backend container:
   ```bash
   docker-compose restart backend
   ```

#### Step 2: Set Environment Variables
Create `.env` file in root directory:
```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=/run/secrets/firebase-service-account.json

# Optional: AI Matching (if you have Anthropic API key)
ANTHROPIC_API_KEY=your_api_key_here

# Payment Configuration
APP_PAYMENT_WEBHOOK_SECRET=your_webhook_secret_here

# Seed Data
APP_SEED_ENABLED=true
```

Then restart services:
```bash
docker-compose down
docker-compose up -d
```

---

### **Priority 2: High - API Connectivity**

#### Step 1: Test Backend Endpoints
```bash
# Test public endpoint
curl http://localhost:8080/api/auth/test

# Test with authentication
# First login, then use token
```

#### Step 2: Verify Network Communication
The backoffice runs in Docker but needs to communicate with backend.

**Current Setup:**
- Backoffice: `http://localhost:4200` (in browser)
- Backend API: `http://localhost:8080/api` (in browser)
- WebSocket: `ws://localhost:8080/ws`

**This should work because:**
- Browser makes requests from host machine
- Both services expose ports to localhost
- CORS allows `localhost:*` origins

**If API calls fail, check:**
1. Browser console for CORS errors
2. Network tab for failed requests
3. Backend logs for rejected requests

---

### **Priority 3: Medium - Optional Enhancements**

#### Enable AI Matching (Optional)
1. Get Anthropic API key from https://console.anthropic.com/
2. Add to `.env`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```
3. Restart backend

#### Fix Commons Logging Warning
Add to `smart-match-backend/pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

---

## 🧪 Testing Checklist

### Backend API Tests
```bash
# 1. Health check (should return 401 - means auth is working)
curl http://localhost:8080/api/health

# 2. Check if backend is responding
curl http://localhost:8080/api/auth/test

# 3. Mongo Express (database viewer)
# Open: http://localhost:8081

# 4. Check database content
docker exec -it smart-match-platform-mongodb mongosh
> use smart_match
> show collections
> db.users.find().pretty()
```

### Backoffice Tests
1. Open: http://localhost:4200
2. Try to login with test credentials
3. Check browser console (F12) for errors
4. Check Network tab for API calls
5. Verify WebSocket connection

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Symptoms**: API calls fail, 404 or connection refused
**Solutions**:
1. Check backend is running: `docker ps`
2. Check backend logs: `docker logs smart-match-platform-backend`
3. Verify port 8080 is accessible: `curl http://localhost:8080`

### Issue: "Authentication failed"
**Symptoms**: Login doesn't work, 401 errors
**Solutions**:
1. Verify Firebase service account file exists
2. Check Firebase config in backoffice environment files
3. Ensure user exists in database with correct role
4. Check backend logs for Firebase errors

### Issue: "CORS errors in browser"
**Symptoms**: "Access-Control-Allow-Origin" errors
**Solutions**:
1. Verify CorsConfig.java has correct origins
2. Check if backend is receiving OPTIONS requests
3. Ensure credentials are set: `withCredentials: true`

### Issue: "WebSocket connection failed"
**Symptoms**: Real-time features don't work
**Solutions**:
1. Check WebSocket URL in environment.ts
2. Verify backend WebSocket config
3. Check for proxy/firewall blocking WS protocol

---

## 🚀 Quick Fix Commands

### Restart All Services
```bash
cd "d:\Smart-Internship---Freelance-Matching-Platform"
docker-compose restart
```

### View All Logs
```bash
docker-compose logs -f
```

### Rebuild Backend (if code changed)
```bash
docker-compose build backend
docker-compose up -d backend
```

### Rebuild Backoffice (if code changed)
```bash
docker-compose build backoffice
docker-compose up -d backoffice
```

### Reset Database (CAUTION: Deletes all data)
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📊 Monitoring Commands

### Check Container Status
```bash
docker ps
docker stats
```

### Watch Backend Logs
```bash
docker logs -f smart-match-platform-backend
```

### Watch Backoffice Logs
```bash
docker logs -f smart-match-platform-backoffice
```

### Check MongoDB
```bash
docker exec -it smart-match-platform-mongodb mongosh
```

---

## 🔍 Detailed Investigation Steps

### Step 1: Verify Firebase Setup
```bash
# Check if file exists
cd smart-match-backend
dir firebase-service-account.json

# If missing, create it with your Firebase service account JSON
# Download from: https://console.firebase.google.com/project/interlance-d0916/settings/serviceaccounts/adminsdk
```

### Step 2: Check Database Seeding
```bash
# Connect to MongoDB
docker exec -it smart-match-platform-mongodb mongosh smart_match

# Check if users exist
db.users.find().pretty()

# Check if test data exists
db.companies.find().count()
db.offers.find().count()
```

### Step 3: Test Authentication Flow
1. Open http://localhost:4200
2. Open browser console (F12)
3. Try to login
4. Check Network tab for API calls
5. Look for any error responses

### Step 4: Verify CORS Headers
```bash
# Test OPTIONS request (preflight)
curl -X OPTIONS \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v \
  http://localhost:8080/api/auth/login
```

---

## ✅ Expected Behavior

### Healthy System Should Show:
1. **Backend logs**: No ERROR messages
2. **Backoffice**: Loads without console errors
3. **Login**: Works with Firebase credentials
4. **API calls**: Return 200 or appropriate status codes
5. **WebSocket**: Connects successfully
6. **Database**: Contains seeded data

### Test Credentials (if seeding enabled):
- Check backend logs for generated test users
- Or create user via Firebase Auth

---

## 📝 Notes

### Current Configuration:
- **MongoDB**: Internal container network + exposed port 27017
- **Backend**: Spring Boot on port 8080
- **Backoffice**: Angular served by Nginx on port 4200
- **CORS**: Allows localhost:* origins
- **Firebase**: Uses service account for auth
- **AI Matching**: Fallback to heuristic (no Anthropic key)

### Next Steps:
1. ✅ Verify Firebase service account file
2. ✅ Test login functionality
3. ✅ Check API endpoints in browser
4. ✅ Verify WebSocket connection
5. ⚠️ (Optional) Add Anthropic API key for AI features

---

## 🆘 If Issues Persist

### Collect Diagnostic Information:
```bash
# Get all container logs
docker-compose logs > logs.txt

# Get container details
docker inspect smart-match-platform-backend > backend-inspect.txt
docker inspect smart-match-platform-backoffice > backoffice-inspect.txt

# Get environment info
docker-compose config > docker-config.txt

# Test network connectivity
docker exec smart-match-platform-backend ping -c 3 mongodb
docker exec smart-match-platform-backoffice ping -c 3 backend
```

### Share for Debug:
1. Container logs (logs.txt)
2. Browser console errors (screenshot)
3. Network tab showing failed requests
4. Backend configuration (application.properties)

---

## 🎯 Success Criteria

System is fully working when:
- ✅ All containers are running (green status)
- ✅ Backend logs show no errors
- ✅ Login page loads without errors
- ✅ Can successfully log in
- ✅ Dashboard loads with data
- ✅ API calls succeed in Network tab
- ✅ WebSocket connection established
- ✅ Real-time updates work

---

**Current Status**: All containers running, need to verify Firebase authentication setup.
**Most Likely Issue**: Missing or incorrect Firebase service account configuration.
**Quick Fix**: Ensure `firebase-service-account.json` exists and restart backend container.
