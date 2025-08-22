hari# Customer Setup Guide

This guide will help you adapt the Elasticsearch Query Comparison Template for your specific customer needs.

## 🎯 Quick Setup Checklist

- [ ] Update project name and branding
- [ ] Configure Elasticsearch connection
- [ ] Customize UI/UX elements
- [ ] Add customer-specific sample queries
- [ ] Update documentation
- [ ] Test the application

## 📝 Step-by-Step Setup

### 1. Project Configuration

#### Update package.json
```json
{
  "name": "customer-name-query-compare",
  "version": "1.0.0",
  "description": "Elasticsearch Query Comparison Tool for [Customer Name]",
  "author": "Your Company",
  "private": true
}
```

#### Update vercel.json (if using Vercel)
```json
{
  "name": "customer-name-query-compare",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ]
}
```

### 2. Environment Configuration

Create `.env.local` file:
```env
# Elasticsearch Configuration
ELASTICSEARCH_URL=http://your-elasticsearch-host:9200
ELASTICSEARCH_INDEX=your-index-name
ELASTICSEARCH_USERNAME=your-username
ELASTICSEARCH_PASSWORD=your-password

# Application Configuration
NEXT_PUBLIC_APP_NAME="Customer Name Query Compare"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### 3. Elasticsearch Connection

Update `pages/api/elasticsearch.js`:
```javascript
// Update these constants for your customer
const ELASTICSEARCH_CONFIG = {
  host: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  index: process.env.ELASTICSEARCH_INDEX || 'your-index',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  }
};
```

### 4. UI Customization

#### Update Colors (styles/global.css)
```css
:root {
  --primary-color: #your-brand-color;
  --secondary-color: #your-secondary-color;
  --accent-color: #your-accent-color;
  --background-color: #your-background-color;
  --text-color: #your-text-color;
}
```

#### Update Layout (components/Layout.js)
```javascript
// Update header title and branding
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header>
        <h1>Customer Name Query Compare</h1>
        <p>Elasticsearch Query Analysis Tool</p>
      </header>
      {children}
    </div>
  );
};
```

### 5. Sample Queries

#### Update Query Files
Replace the content of these files with customer-specific examples:

- `old_query_single_word.txt` - Single word query examples
- `old_query_multi_word.txt` - Multi-word query examples
- `new_query.txt` - New query examples
- `new_query_fallback.txt` - Fallback query examples

Example structure:
```json
{
  "query": {
    "match": {
      "field_name": "search_term"
    }
  },
  "size": 10
}
```

### 6. Documentation Updates

#### Update README.md
- Change project title
- Update customer-specific instructions
- Modify sample queries section
- Update contact information

#### Create Customer-Specific Docs
Create `CUSTOMER_README.md` with:
- Customer-specific setup instructions
- Custom query examples
- Troubleshooting guide
- Contact information

## 🔧 Advanced Customization

### Custom Components
Add customer-specific components in `components/` folder:
- `CustomerHeader.js` - Custom header component
- `CustomerFooter.js` - Custom footer component
- `CustomerQueryExamples.js` - Custom query examples

### Custom API Endpoints
Add customer-specific API endpoints in `pages/api/`:
- `customer-specific.js` - Customer-specific functionality
- `custom-analytics.js` - Custom analytics endpoints

### Custom Styling
Create customer-specific styles:
- `customer-theme.css` - Customer brand colors
- `customer-components.css` - Custom component styles

## 🚀 Deployment Configuration

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure custom domain (if needed)
4. Set up automatic deployments

### Manual Deployment
```bash
npm run build
npm start
```

## 📊 Testing Checklist

- [ ] Test Elasticsearch connection
- [ ] Verify query comparison functionality
- [ ] Test UI responsiveness
- [ ] Check all sample queries work
- [ ] Verify deployment works correctly
- [ ] Test error handling

## 🎨 Branding Guidelines

### Logo Integration
- Add customer logo to `public/` folder
- Update favicon and app icons
- Include logo in header component

### Color Scheme
- Primary: Customer brand color
- Secondary: Supporting brand color
- Accent: Highlight color
- Background: Clean, professional background
- Text: High contrast, readable text

### Typography
- Use customer brand fonts (if available)
- Ensure readability across devices
- Maintain consistent typography hierarchy

## 📞 Support Information

### Customer Contact
- Technical Support: [customer-support-email]
- Project Manager: [project-manager-email]
- Emergency Contact: [emergency-phone]

### Documentation Links
- Customer Documentation: [customer-docs-url]
- API Documentation: [api-docs-url]
- Troubleshooting Guide: [troubleshooting-url]

---

**Template Version:** 1.0.0  
**Last Updated:** 2024-08-15  
**Customer Setup Guide Version:** 1.0.0
