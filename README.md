# GitHub Repository Downloader

A simple web-based tool that allows you to download any public GitHub repository and compile all its code into a single, organized text file with folder structure visualization.

## 🚀 Features

- **Easy Repository Input**: Support for both full GitHub URLs and simple `username/repo` format
- **File Type Filtering**: Choose which file extensions to include (JavaScript, Python, HTML, CSS, etc.)
- **Visual Folder Tree**: Displays complete project structure with file sizes
- **Progress Tracking**: Real-time download progress with status updates
- **Organized Output**: Clean, structured text file with headers and separators
- **CORS Proxy Support**: Uses multiple proxy fallbacks to bypass browser restrictions

## 📋 How to Use

### Step 1: Enter Repository Information

Input the GitHub repository in one of these formats:

- **Full URL**: `https://github.com/facebook/react`
- **Short Format**: `facebook/react`

### Step 2: Select File Types

Choose which file extensions you want to include:

- ✅ Programming languages (JS, Python, Java, C++, Go, Rust, etc.)
- ✅ Web files (HTML, CSS, JSON, XML)
- ✅ Documentation (Markdown, Text files)
- ✅ Configuration files (YAML, JSON)

### Step 3: Download

Click the **"Download Repository"** button and wait for the process to complete.

## 📁 Output File Structure

The generated text file contains:

```txt
GITHUB REPOSITORY: username/repository-name
DOWNLOADED: 2025-06-29T10:30:00.000Z
TOTAL FILES: 25
SELECTED EXTENSIONS: js, html, css, py
================================================================================

FOLDER STRUCTURE:
================================================================================
repository-name/
├── src/
│   ├── components/
│   │   ├── Header.js (2.1 KB)
│   │   └── Footer.js (1.3 KB)
│   └── index.js (3.2 KB)
├── public/
│   └── index.html (1.1 KB)
└── README.md (2.7 KB)
================================================================================

================================================================================
FILE: src/index.js
SIZE: 3247 bytes
================================================================================

[actual file content here]

================================================================================
FILE: src/components/Header.js
SIZE: 2156 bytes
================================================================================

[actual file content here]
```

## 🎯 Use Cases

- **Code Analysis**: Study project architecture and implementation
- **Learning**: Understand how popular repositories are structured
- **Backup**: Create offline copies of important repositories
- **Documentation**: Generate comprehensive code documentation
- **AI Training**: Prepare datasets from open-source projects
- **Code Review**: Analyze entire codebases in a single file

## ⚡ Examples

### Download React Repository

```txt
Input: facebook/react
Extensions: js, json, md
Result: react-codebase-2025-06-29.txt
```

### Download Vue.js Repository

```txt
Input: https://github.com/vuejs/vue
Extensions: js, ts, json, md
Result: vue-codebase-2025-06-29.txt
```

### Download Python Project

```txt
Input: python/cpython
Extensions: py, md, txt, yml
Result: cpython-codebase-2025-06-29.txt
```

## ⚠️ Important Notes

- **Public Repositories Only**: Can only access publicly available repositories
- **File Size Limits**: Very large repositories might take longer to process
- **Network Dependent**: Requires stable internet connection
- **CORS Proxies**: Uses third-party proxies which may have occasional downtime
- **Rate Limiting**: Includes automatic delays to prevent overwhelming GitHub's API

## 🔧 Troubleshooting

### Common Issues and Solutions

**"Repository not found" error:**

- Verify the repository name is correct
- Ensure the repository is public
- Check your internet connection

**"Network error" message:**

- Wait a moment and try again
- Check if the repository exists and is accessible
- Try with a different repository to test connectivity

**No files downloaded:**

- Ensure at least one file type is selected
- Verify the repository contains files with selected extensions
- Check if the repository is empty

**Slow download speed:**

- Large repositories naturally take longer
- CORS proxies may have varying response times
- Consider selecting fewer file types to reduce download size

## 🛠️ Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: GitHub REST API v3
- **CORS Handling**: Multiple proxy fallbacks
- **File Processing**: Client-side JavaScript
- **Download**: Browser's native download functionality

## 📜 File Naming Convention

Downloaded files are automatically named as:

`{owner}-{repository}-{date}.txt`

Example: `facebook-react-2025-06-29.txt`

## 🎨 Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (not supported)

---

**Happy Coding!** 🎉
