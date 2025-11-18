# Digital E-commerce Website

A real-time digital product management system with admin panel, built with Supabase and Verifone payment integration.

## Features

- Real-time product updates using Supabase
- Admin panel for product management
- Shopping cart functionality
- Verifone payment integration
- Instant digital product download after payment
- Responsive design

## Setup Instructions

1. **Supabase Configuration**
   - Create a new project at [Supabase](https://supabase.com)
   - Create the tables using the provided SQL schema
   - Update the Supabase URL and anon key in `assets/js/supabase-client.js`

2. **Verifone Integration**
   - Sign up for a Verifone merchant account
   - Get your API credentials
   - Update the Verifone configuration in `assets/js/verifone-integration.js`

3. **Deployment**
   - Upload all files to your web server
   - Ensure all file paths are correct
   - Test the payment integration in sandbox mode first

## File Structure

- `index.html` - Main product listing page
- `product-details.html` - Individual product page
- `cart.html` - Shopping cart
- `checkout.html` - Checkout and payment page
- `admin/` - Admin panel files
- `assets/` - CSS, JavaScript, and image files

## Admin Access

The admin panel is accessible at `/admin/`. You'll need to implement authentication (not included in this basic version).

## Real-time Features

- Product updates in admin panel reflect immediately on the website
- Inventory changes are visible in real-time
- Order status updates

## Payment Flow

1. Customer adds products to cart
2. Proceeds to checkout
3. Enters payment details (simulated Verifone integration)
4. Upon successful payment, download links are immediately available
5. Order details are saved to Supabase

## Customization

- Modify CSS files to match your brand
- Add additional product fields as needed
- Extend the admin panel with more features
- Implement user authentication if required