# Elasticsearch/OpenSearch Query Comparer

This project is a comprehensive Next.js template developed for comparing and analyzing Elasticsearch queries. It can be easily adapted for other customers.

## 🚀 Features

- **Query Comparison**: Compare two Elasticsearch queries
- **Performance Analysis**: Query performance analysis
- **Visual Differences**: Visually display differences in query structure
- **Result Comparison**: Compare search results
- **Real-time Testing**: Real-time query testing
- **Multi-format Support**: JSON, DSL format support
- **Elasticsearch & OpenSearch**: Support for both platforms

## 📁 Project Structure

```
elasticsearch-query-template/
├── components/                    # React components
├── pages/                        # Next.js pages
│   ├── api/                      # API endpoints
│   └── index.js                  # Main page
├── public/                       # Static files
├── styles/                       # CSS styles
├── utils/                        # Utility functions
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🛠️ Installation

### Requirements
- Node.js (v18+)
- npm or yarn
- Elasticsearch or OpenSearch access

### Quick Start

1. **Clone the project:**
```bash
git clone <repository-url>
cd elasticsearch-query-template
```

2. **Install dependencies:**
```bash
npm install
```

3. (Optional) **Set up environment variables:**
If you want to pre-fill defaults (e.g., an ES URL), add them to `.env.local`:
```env
ES_URL_1=https://your-elasticsearch:9200/index
```

4. **Start the application:**
```bash
npm run dev
```

5. **Open in browser:**
```
http://localhost:3000
```

## 🔧 Configuration

### Credentials and security
- No secrets are hardcoded in the repo.
- Elasticsearch username/password and any OpenAI key are entered in the UI and kept in memory; they are NOT stored locally by default.
- Prefer using per-user credentials at runtime.

### Elasticsearch Connection
Update connection settings in `pages/api/elasticsearch.js`.

## 📊 Usage

### 1. Query Input
- Enter the old query in the left panel
- Enter the new query in the right panel
- Both queries should be in JSON format

### 2. Comparison
- Click "Compare Queries" button
- Results are automatically compared

### 3. Analysis
- **Structure Differences**: Differences in query structure
- **Performance Metrics**: Execution time comparison
- **Result Differences**: Differences in search results

## 🎯 Customer Adaptation

To adapt this template for a new customer:

### 1. Change Project Name
```bash
# In package.json file
"name": "customer-name-query-compare"
```

### 2. Elasticsearch Configuration
- Update Elasticsearch connection information in `.env` file
- Configure endpoints in `pages/api/elasticsearch.js`

### 3. UI/UX Customization
- Change colors in `styles/global.css` file
- Customize components in `components/` folder
- Add logo and brand colors

### 4. Sample Queries
- Update `old_query_single_word.txt` and `old_query_multi_word.txt` files
- Add customer-specific query examples

### 5. Customization Files
- Create `CUSTOMER_CONFIG.md` file
- Add customer-specific setup instructions

## 📝 Sample Queries

Sample queries are included in the project:
- `old_query_single_word.txt` - Single word queries
- `old_query_multi_word.txt` - Multi-word queries
- `new_query.txt` - New query examples
- `new_query_fallback.txt` - Fallback query examples

## 🚀 Deployment

### Vercel (Recommended)
Framework Preset: Next.js
- Install: npm install (default)
- Build: next build (default)
- Output: .next (default)
Deploy URL: https://elasticsearch-query-comparer.vercel.app/

### Manual Deployment
```bash
npm run build
npm start
```

## 🔍 API Endpoints (serverless)
- `POST /api/aws-search`
- `POST /api/elasticsearch-dynamic`
- `POST /api/elasticsearch-function-score`
- `POST /api/openai-embedding`

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

If you encounter any issues, please create an issue or contact us.

---

**Template Version:** 1.0.0  
**Last Updated:** 2025-08-24  
**Framework:** Next.js  
**Elasticsearch Support:** 7.x, 8.x
