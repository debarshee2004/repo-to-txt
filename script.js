document.addEventListener('DOMContentLoaded', () => {
    loadApiKey();
    displayHistory();

    document.getElementById('fetch-repo-btn').addEventListener('click', fetchRepository);
    document.getElementById('consolidate-btn').addEventListener('click', consolidateFiles);
    document.getElementById('save-api-key-btn').addEventListener('click', saveApiKey);
    document.getElementById('extension-filter').addEventListener('input', filterFileTree);
});

let ghToken = '';
let currentRepoInfo = {};

function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}


async function fetchRepository() {
    const repoUrl = document.getElementById('repo-url').value.trim();
    if (!repoUrl) {
        alert('Please enter a GitHub repository URL.');
        return;
    }

    const { owner, repo } = parseRepoUrl(repoUrl);
    if (!owner || !repo) {
        alert('Invalid GitHub repository URL.');
        return;
    }

    currentRepoInfo = { owner, repo };

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;

    showLoader(true);

    try {
        const headers = ghToken ? { 'Authorization': `token ${ghToken}` } : {};
        const response = await fetch(apiUrl, { headers });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.truncated) {
            alert('Warning: The repository is too large and the file list has been truncated. Some files may not be displayed.');
        }
        displayFileTree(data.tree, owner, repo);
        updateHistory(repoUrl);
    } catch (error) {
        console.error('Error fetching repository:', error);
        alert('Failed to fetch repository. Check the URL, ensure the repository is public, or provide a valid API key for private repositories.');
    } finally {
        showLoader(false);
    }
}

function parseRepoUrl(url) {
    try {
        // Handles standard GitHub URLs
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(part => part);
        if (urlObj.hostname === 'github.com' && pathParts.length >= 2) {
            return { owner: pathParts[0], repo: pathParts[1].replace('.git', '') };
        }
    } catch (e) {
        // Handles shorthand like "owner/repo"
        const parts = url.split('/');
        if (parts.length === 2) {
            return { owner: parts[0], repo: parts[1].replace('.git', '') };
        }
    }
    return {};
}

function displayFileTree(files, owner, repo) {
    const fileTreeContainer = document.getElementById('file-tree');
    fileTreeContainer.innerHTML = '';
    const tree = buildTree(files.filter(file => file.type === 'blob')); // Only show files (blobs)

    const ul = createTreeElement(tree, owner, repo);
    fileTreeContainer.appendChild(ul);

    // Add event listener to parent checkboxes to select/deselect all children
    fileTreeContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.dataset.isDirectory) {
            checkbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                const childCheckboxes = e.target.closest('li').querySelectorAll('input[type="checkbox"]');
                childCheckboxes.forEach(child => child.checked = isChecked);
            });
        }
    });
}

function buildTree(files) {
    const tree = {};
    files.forEach(file => {
        const pathParts = file.path.split('/');
        let currentLevel = tree;
        pathParts.forEach((part, index) => {
            if (!currentLevel[part]) {
                currentLevel[part] = { children: {} };
            }
            if (index === pathParts.length - 1) {
                currentLevel[part].type = file.type;
                currentLevel[part].path = file.path;
            }
            currentLevel = currentLevel[part].children;
        });
    });
    return tree;
}

function createTreeElement(node, owner, repo) {
    const ul = document.createElement('ul');
    for (const key in node) {
        const item = node[key];
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = item.path || `folder-${key}`;
        checkbox.dataset.path = item.path;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = key;

        li.appendChild(checkbox);
        li.appendChild(label);

        if (item.children && Object.keys(item.children).length > 0) {
            checkbox.dataset.isDirectory = true;
            const childrenUl = createTreeElement(item.children, owner, repo);
            li.appendChild(childrenUl);
        } else {
            checkbox.dataset.type = item.type;
        }

        ul.appendChild(li);
    }
    return ul;
}

// Debounce utility function
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
function filterFileTree() {
    const filterText = document.getElementById('extension-filter').value.toLowerCase();
    const extensions = filterText.split(',').map(ext => ext.trim()).filter(ext => ext);

    document.querySelectorAll('#file-tree li').forEach(li => {
        const label = li.querySelector('label');
        const checkbox = li.querySelector('input[type="checkbox"]');
        const isDirectory = checkbox.dataset.isDirectory === 'true';

        if (isDirectory) {
            // Show directories, filtering will apply to files within them
            li.style.display = '';
            return;
        }

        const filePath = checkbox.dataset.path || '';
        const matches = extensions.length === 0 || extensions.some(ext => filePath.toLowerCase().endsWith(ext));
        li.style.display = matches ? '' : 'none';
    });
}

async function consolidateFiles() {
    const selectedFiles = [];
    document.querySelectorAll('#file-tree input[type="checkbox"]:checked').forEach(checkbox => {
        if (checkbox.dataset.path && checkbox.dataset.type === 'blob') {
            selectedFiles.push(checkbox.dataset.path);
        }
    });

    if (selectedFiles.length === 0) {
        alert('Please select at least one file.');
        return;
    }

    showLoader(true, 'consolidate-btn', 'Consolidating...');

    let consolidatedContent = await generateHeader();
    const { owner, repo } = currentRepoInfo;

    for (const filePath of selectedFiles) {
        const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
        try {
            const headers = {
                'Accept': 'application/vnd.github.v3.raw',
                ...(ghToken && { 'Authorization': `token ${ghToken}` })
            };
            const response = await fetch(fileUrl, { headers });
            if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);

            const content = await response.text();
            consolidatedContent += `\n\n--- File: ${filePath} ---\n\n`;
            consolidatedContent += content;
        } catch (error) {
            console.error('Error fetching file content:', error);
            consolidatedContent += `\n\n--- File: ${filePath} (Error: Could not fetch content) ---\n\n`;
        }
    }

    showLoader(false, 'consolidate-btn', 'Consolidate & Download');
    triggerDownload(consolidatedContent);
}

async function generateHeader() {
    const { owner, repo } = currentRepoInfo;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    let fileStructure = `/*\nRepository: https://github.com/${owner}/${repo}\n\n`;
    fileStructure += "File Structure:\n";

    try {
        const headers = ghToken ? { 'Authorization': `token ${ghToken}` } : {};
        const response = await fetch(apiUrl, { headers });
        if (!response.ok) throw new Error('Could not fetch repository structure for header.');
        const data = await response.json();

        const tree = {};
        data.tree.forEach(file => {
            const parts = file.path.split('/');
            let level = tree;
            parts.forEach(part => {
                level[part] = level[part] || {};
                level = level[part];
            });
        });

        const createStructureString = (node, indent = '') => {
            let str = '';
            Object.keys(node).forEach((key, index, arr) => {
                const isLast = index === arr.length - 1;
                str += `${indent}${isLast ? '└── ' : '├── '}${key}\n`;
                if (Object.keys(node[key]).length > 0) {
                    str += createStructureString(node[key], `${indent}${isLast ? '    ' : '│   '}`);
                }
            });
            return str;
        };
        fileStructure += createStructureString(tree);

    } catch (error) {
        console.error(error);
        fileStructure += "Could not generate file structure.\n";
    }

    fileStructure += "\n*/";
    return fileStructure;
}


function triggerDownload(content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('download-link');

    downloadLink.href = url;
    downloadLink.download = `${currentRepoInfo.repo}-consolidated.txt`;
    downloadLink.style.display = 'inline-block';
    downloadLink.textContent = `Download Consolidated File`;
    downloadLink.click();
}


function showLoader(show, buttonId = 'fetch-repo-btn', loadingText = 'Fetching...') {
    const button = document.getElementById(buttonId);
    const originalText = button.dataset.originalText || button.textContent;

    if (show) {
        button.disabled = true;
        button.dataset.originalText = originalText;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
    } else {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

function saveApiKey() {
    ghToken = document.getElementById('api-key').value;
    if(ghToken) {
        localStorage.setItem('githubApiKey', ghToken);
        alert('API Key saved.');
    } else {
        localStorage.removeItem('githubApiKey');
        alert('API Key cleared.');
    }
}

function loadApiKey() {
    const savedToken = localStorage.getItem('githubApiKey');
    if (savedToken) {
        ghToken = savedToken;
        document.getElementById('api-key').value = savedToken;
    }
}

function updateHistory(repoUrl) {
    let history = JSON.parse(localStorage.getItem('gitScribeHistory')) || [];
    history = history.filter(item => item !== repoUrl);
    history.unshift(repoUrl);
    history = history.slice(0, 10);
    localStorage.setItem('gitScribeHistory', JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('gitScribeHistory')) || [];
    if (history.length === 0) {
        historyList.innerHTML = '<li class="placeholder">No history yet.</li>';
        return;
    }
    history.forEach(repoUrl => {
        const li = document.createElement('li');
        li.textContent = repoUrl;
        li.onclick = () => {
            document.getElementById('repo-url').value = repoUrl;
            fetchRepository();
        };
        historyList.appendChild(li);
    });
}
