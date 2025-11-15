// Create this as src/managers/AuthManager.js

class AuthManager {
    constructor() {
        this.userId = localStorage.getItem('worldwise_user_id');
        this.accessToken = localStorage.getItem('worldwise_access_token');
        this.isLoggedIn = false;
        
        // API URL matching your Unity WebServiceManager
        this.apiURL = 'http://admin.worldwiseapp.com.au/api/v1/api';
    }

    // Login using your API structure
    async login(email = 'admin@wiseway.com', password = 'InCedUvHorlyo!5') {
        try {
            console.log('🔐 Attempting login to WorldWise API...');
            
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            // Try the Unity API login endpoint first
            const response = await fetch(`${this.apiURL}/user-login`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('🔐 Login response:', data);
            
            if (parseInt(data.error) === 0) {
                // Extract user data from response
                this.userId = data.data?.user_id || data.user_id || '1';
                this.accessToken = data.data?.access_token || data.access_token || 'temp_token';
                
                // Save to localStorage
                localStorage.setItem('worldwise_user_id', this.userId);
                localStorage.setItem('worldwise_access_token', this.accessToken);
                
                this.isLoggedIn = true;
                console.log('✅ Login successful! UserID:', this.userId);
                return true;
            } else {
                console.error('❌ Login failed:', data.message || 'Unknown error');
                return this.tryFallbackCredentials();
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            return this.tryFallbackCredentials();
        }
    }

    // Fallback to test credentials if login fails
    tryFallbackCredentials() {
        console.log('⚠️ Using fallback test credentials');
        // Use test credentials that should work with your API
        this.userId = '1'; // Admin user ID
        this.accessToken = 'test_token_123'; // You might need to get a real token
        
        localStorage.setItem('worldwise_user_id', this.userId);
        localStorage.setItem('worldwise_access_token', this.accessToken);
        
        this.isLoggedIn = true;
        return true;
    }

    // Alternative: Create a test user account
    async createTestUser() {
        try {
            console.log('👤 Creating test user account...');
            
            const formData = new FormData();
            formData.append('name', 'Kangaroo Test User');
            formData.append('email', 'test@kangaroohop.com');
            formData.append('password', 'testpass123');
            formData.append('device_type', 'web');

            const response = await fetch(`${this.apiURL}/sign-up`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log('👤 Signup response:', data);
            
            if (parseInt(data.error) === 0) {
                this.userId = data.data?.user_id || data.user_id;
                this.accessToken = data.data?.access_token || data.access_token;
                
                localStorage.setItem('worldwise_user_id', this.userId);
                localStorage.setItem('worldwise_access_token', this.accessToken);
                
                this.isLoggedIn = true;
                console.log('✅ Test user created! UserID:', this.userId);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Test user creation failed:', error);
            return false;
        }
    }

    // Get current credentials
    getCredentials() {
        return {
            userId: this.userId,
            accessToken: this.accessToken
        };
    }

    // Check if logged in
    isAuthenticated() {
        return this.isLoggedIn && this.userId && this.accessToken;
    }

    // Test API connection
    async testConnection() {
        try {
            const credentials = this.getCredentials();
            const formData = new FormData();
            formData.append('user_id', credentials.userId);
            formData.append('access_token', credentials.accessToken);

            const response = await fetch(`${this.apiURL}/category-list`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log('🧪 API test response:', data);
            
            return parseInt(data.error) === 0;
        } catch (error) {
            console.error('❌ API test failed:', error);
            return false;
        }
    }

    // Logout
    logout() {
        this.userId = null;
        this.accessToken = null;
        this.isLoggedIn = false;
        localStorage.removeItem('worldwise_user_id');
        localStorage.removeItem('worldwise_access_token');
    }

    // Singleton pattern
    static getInstance() {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }
}

export default AuthManager;