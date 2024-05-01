# Python Imports Sorter

Python Imports Sorter is a Visual Studio Code extension that helps you organize and sort your Python import statements within your source code. It provides a simple and customizable way to group and order imports based on your project structure.

## Features

- **Import Sorting:** Automatically organizes and sorts import statements in your Python files.
- **Custom Categories:** Allows you to define custom categories for sorting, making it easy to group imports based on your project's structure.
- **Priority Sorting:** Prioritizes 'import' statements over 'from' statements during sorting.

## Installation

1. Team members can install the extension by going to the Extensions view, clicking on the ellipsis (`...`), and choosing "Install from VSIX..."

## Configuration

Customize your import sorting preferences by modifying the `categories` array in the `settings.json` file:

```json
{
    "sortpythonlib.categories": [
        "SEC.core.logic_flow",
        "SEC.core.crud",
        "SEC.sec_core",
        "SEC.sec_admin",
        "SEC.sec_client_manager",
        "SEC.sec_end_user"
    ]
}
```


## Usage
1. Open a Python file in Visual Studio Code.
2. Right-click in the editor or use the command palette to find and run the "Sort Python Imports" command.
3. The extension will organize and sort your import statements based on the defined categories.