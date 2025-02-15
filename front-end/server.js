app.post('/register', async (req, res) => {
    try {
        const { 
            name, 
            role, 
            fssaiNumber,
            email,
            password,
            phone,
            address,
            capacity, // For food banks/NGOs: how much food they can handle
            availableHours, // When they can pickup/receive food
            serviceAreas // Areas they serve/operate in
        } = req.body;

        // Basic validation
        if (!name || !role || !email || !password || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: "Name, role, email, password, and phone are required fields" 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid email format" 
            });
        }

        // Phone validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: "Phone number must be 10 digits" 
            });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Role-specific validations
        const validRoles = ['restaurant', 'ngo', 'food_bank', 'volunteer', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid role" 
            });
        }

        if (role === 'restaurant' && !fssaiNumber) {
            return res.status(400).json({ 
                success: false, 
                message: "FSSAI number is required for restaurants" 
            });
        }

        if (['ngo', 'food_bank'].includes(role) && !capacity) {
            return res.status(400).json({ 
                success: false, 
                message: "Storage capacity is required for NGOs and food banks" 
            });
        }

        // Insert into PostgreSQL
        const result = await pool.query(
            `INSERT INTO users (
                name, role, fssai_number, email, password, phone, 
                address, capacity, available_hours, service_areas
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [name, role, fssaiNumber, email, hashedPassword, phone, 
             address, capacity, availableHours, serviceAreas]
        );

        res.json({ 
            success: true, 
            message: "Registration successful!",
            user: {
                id: result.rows[0].id,
                name: result.rows[0].name,
                role: result.rows[0].role,
                email: result.rows[0].email,
                // Don't send back sensitive information
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
});

// Food Donation Listing endpoint
app.post('/food-listings', async (req, res) => {
    try {
        const {
            restaurantId,
            foodType,
            quantity,
            expiryTime,
            pickupAddress,
            pickupTimeWindow,
            specialInstructions
        } = req.body;

        // Validation
        if (!restaurantId || !foodType || !quantity || !expiryTime || !pickupAddress) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const result = await pool.query(
            `INSERT INTO food_listings (
                restaurant_id, food_type, quantity, expiry_time,
                pickup_address, pickup_time_window, special_instructions,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [restaurantId, foodType, quantity, expiryTime, 
             pickupAddress, pickupTimeWindow, specialInstructions, 'available']
        );

        res.json({
            success: true,
            message: "Food listing created successfully",
            listing: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Search Available Food Listings
app.get('/food-listings', async (req, res) => {
    try {
        const { 
            foodType,
            location,
            radius,
            status = 'available'
        } = req.query;

        let query = 'SELECT * FROM food_listings WHERE status = $1';
        const queryParams = [status];

        if (foodType) {
            query += ' AND food_type = $2';
            queryParams.push(foodType);
        }

        // Add location-based filtering if needed

        const result = await pool.query(query, queryParams);

        res.json({
            success: true,
            listings: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
